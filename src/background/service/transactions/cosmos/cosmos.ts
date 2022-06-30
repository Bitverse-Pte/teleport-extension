import { AccountSetBaseSuper, MsgOpt, WalletStatus } from './base';
import { AppCurrency, KeplrSignOptions } from '@keplr-wallet/types';
import {
  BroadcastMode,
  makeSignDoc,
  Msg,
  StdFee,
  StdSignDoc,
} from '@cosmjs/launchpad';
import { DenomHelper } from '@keplr-wallet/common';
import { Dec, DecUtils } from '@keplr-wallet/unit';
import { Any } from '@keplr-wallet/proto-types/google/protobuf/any';
import { MsgSend } from '@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx';
import {
  BaseAccount,
  Bech32Address,
  TendermintTxTracer,
} from '@keplr-wallet/cosmos';
// import { QueriesSetBase, IQueriesStore, CosmosQueries } from "./query";
import { DeepPartial } from 'utility-types';
import { CosChainInfo } from './types';
import deepmerge from 'deepmerge';
import { isAddress } from '@ethersproject/address';
import { Buffer } from 'buffer/';
import Axios, { AxiosInstance } from 'axios';
import { CoinType, Ecosystem, Provider } from 'types/network';
import {
  AuthInfo,
  TxRaw,
  TxBody,
  Fee,
} from '@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx';
import { SignMode } from '@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing';
import { PubKey } from '@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys';
import platform from '../../extension';

// FOR SIGN
import {
  encodeSecp256k1Signature,
  serializeSignDoc,
  AminoSignResponse,
} from '@cosmjs/launchpad';
import { checkAndValidateADR36AminoSignDoc } from '@keplr-wallet/cosmos';
import { keyringService, networkPreferenceService } from 'background/service';
import { Bech32Config } from 'types/cosmos';
import { CosmosKey } from 'background/service/keyManager/cosmos/CosmosKey';
import { ObservableStorage } from 'background/utils/obsStorage';
import { nanoid as createId } from 'nanoid';

export interface CosmosAccount {
  cosmos: CosmosAccountImpl;
}

export const cosmosTxHistoryStorage = new ObservableStorage<TransactionState>(
  'cosmos_transaction_history',
  {
    transactions: {},
  }
);

// export const CosmosAccount = {
//   use(options: {
//     msgOptsCreator?: (
//       chainId: string
//     ) => DeepPartial<CosmosMsgOpts> | undefined;
//     // queriesStore: IQueriesStore<CosmosQueries>;
//     wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
//     preTxEvents?: {
//       onBroadcastFailed?: (chainId: string, e?: Error) => void;
//       onBroadcasted?: (chainId: string, txHash: Uint8Array) => void;
//       onFulfill?: (chainId: string, tx: any) => void;
//     };
//   }): (
//     base: AccountSetBaseSuper,
//     cosChainInfo: CosChainInfo,
//     chainId: string
//   ) => CosmosAccount {
//     return (base, cosChainInfo, chainId) => {
//       const msgOptsFromCreator = options.msgOptsCreator
//         ? options.msgOptsCreator(chainId)
//         : undefined;

//       return {
//         cosmos: new CosmosAccountImpl(
//           // base,
//           // cosChainInfo,
//           // chainId,
//           // options.queriesStore,
//           deepmerge<CosmosMsgOpts, DeepPartial<CosmosMsgOpts>>(
//             defaultCosmosMsgOpts,
//             msgOptsFromCreator ? msgOptsFromCreator : {}
//           ),
//           options
//         ),
//       };
//     };
//   },
// };

export const CosmosAccount = (options: {
  chainId: string;
  msgOptsCreator?: (chainId: string) => DeepPartial<CosmosMsgOpts> | undefined;
  // queriesStore: IQueriesStore<CosmosQueries>;
  wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
  preTxEvents?: {
    onBroadcastFailed?: (chainId: string, e?: Error) => void;
    onBroadcasted?: (chainId: string, txHash: Uint8Array) => void;
    onFulfill?: (chainId: string, tx: any) => void;
  };
}) => {
  const msgOptsFromCreator = options.msgOptsCreator
    ? options.msgOptsCreator(options.chainId)
    : undefined;
  return new CosmosAccountImpl(
    deepmerge<CosmosMsgOpts, DeepPartial<CosmosMsgOpts>>(
      defaultCosmosMsgOpts,
      msgOptsFromCreator ? msgOptsFromCreator : {}
    ),
    options,
    cosmosTxHistoryStorage
  );
};

export interface CosmosMsgOpts {
  readonly send: {
    readonly native: MsgOpt;
  };
  readonly ibcTransfer: MsgOpt;
  readonly delegate: MsgOpt;
  readonly undelegate: MsgOpt;
  readonly redelegate: MsgOpt;
  // The gas multiplication per rewards.
  readonly withdrawRewards: MsgOpt;
  readonly govVote: MsgOpt;
}

export const defaultCosmosMsgOpts: CosmosMsgOpts = {
  send: {
    native: {
      type: 'cosmos-sdk/MsgSend',
      gas: 80000,
    },
  },
  ibcTransfer: {
    type: 'cosmos-sdk/MsgTransfer',
    gas: 450000,
  },
  delegate: {
    type: 'cosmos-sdk/MsgDelegate',
    gas: 250000,
  },
  undelegate: {
    type: 'cosmos-sdk/MsgUndelegate',
    gas: 250000,
  },
  redelegate: {
    type: 'cosmos-sdk/MsgBeginRedelegate',
    gas: 250000,
  },
  // The gas multiplication per rewards.
  withdrawRewards: {
    type: 'cosmos-sdk/MsgWithdrawDelegationReward',
    gas: 140000,
  },
  govVote: {
    type: 'cosmos-sdk/MsgVote',
    gas: 250000,
  },
};

export enum CosmosTxStatus {
  CREATED = 'created',
  SIGNED = 'signed',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface CosmosTx {
  id: string;
  status: CosmosTxStatus;
  chainInfo: CosChainInfo;
  timestamp: number;
  account?: any;
  aminoMsgs?: Msg[];
  fee?: Partial<StdFee>;
  memo?: string;
  mode?: string;
  currency?: AppCurrency;
  tx_hash?: string;
}
interface TransactionState {
  transactions: Record<string, CosmosTx>;
}

type ProtoMsgsOrWithAminoMsgs = {
  // TODO: Make `aminoMsgs` nullable
  //       And, make proto sign doc if `aminoMsgs` is null
  aminoMsgs: Msg[];
  protoMsgs: Any[];
};

export class CosmosAccountImpl {
  public broadcastMode: 'sync' | 'async' | 'block' = 'sync';

  constructor(
    // protected readonly base: AccountSetBaseSuper,
    // protected readonly cosChainInfo: CosChainInfo,
    // protected readonly chainId: string,
    // protected readonly queriesStore: IQueriesStore<CosmosQueries>,
    protected readonly _msgOpts: CosmosMsgOpts,
    protected readonly txOpts: {
      wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
      preTxEvents?: {
        onBroadcastFailed?: (chainId: string, e?: Error) => void;
        onBroadcasted?: (chainId: string, txHash: Uint8Array) => void;
        onFulfill?: (chainId: string, tx: any) => void;
      };
    },
    readonly store: ObservableStorage<TransactionState>
  ) {
    // this.base.registerSendTokenFn(this.processSendToken.bind(this));
  }

  get msgOpts(): CosmosMsgOpts {
    return this._msgOpts;
  }
  getTransaction(txId: string): CosmosTx {
    const { transactions } = this.store.getState();
    return transactions[txId];
  }

  getTransactionList(): Record<string, CosmosTx> {
    return this.store.getState().transactions;
  }

  addTransactionToList(txData: CosmosTx) {
    this.store.updateState({
      transactions: {
        ...this.getTransactionList(),
        [txData.id]: txData,
      },
    });
  }

  addTransactionsToList(txList: CosmosTx[]) {
    for (const tx of txList) {
      this.addTransactionToList(tx);
    }
  }

  async processSendToken(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string,
    stdFee: Partial<StdFee>,
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ): Promise<boolean> {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    const {
      rpcUrl,
      chainId,
      ecoSystemParams,
      prefix: bech32Config,
      coinType,
    } = networkPreferenceService.getProviderConfig();
    const cosChainInfo = {
      rpc: rpcUrl,
      chainId,
      rest: ecoSystemParams?.rest,
      bech32Config,
      coinType,
    } as CosChainInfo;

    const hexAdjustedRecipient = (recipient: string) => {
      const bech32prefix = cosChainInfo.bech32Config.bech32PrefixAccAddr;
      if (bech32prefix === 'evmos' && recipient.startsWith('0x')) {
        // Validate hex address
        if (!isAddress(recipient)) {
          throw new Error('Invalid hex address');
        }
        const buf = Buffer.from(
          recipient.replace('0x', '').toLowerCase(),
          'hex'
        );
        return new Bech32Address(buf).toBech32(bech32prefix);
      }
      return recipient;
    };

    const k = keyringService.getKeplrCompatibleKey(chainId);
    if (!k) throw Error('no key found');
    const { bech32Address, pubKey } = k;

    const txId = createId();
    this.addTransactionToList({
      id: txId,
      status: CosmosTxStatus.CREATED,
      chainInfo: cosChainInfo,
      timestamp: new Date().getTime(),
      memo,
      fee: stdFee,
      currency,
    });

    const actualAmount = () => {
      let dec = new Dec(amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toString();
    };

    switch (denomHelper.type) {
      case 'native': {
        const msg = {
          type: this.msgOpts.send.native.type,
          value: {
            from_address: bech32Address,
            to_address: hexAdjustedRecipient(recipient),
            amount: [
              {
                denom: currency.coinMinimalDenom,
                amount: actualAmount(),
              },
            ],
          },
        };

        await this.sendMsgs(
          'send',
          cosChainInfo,
          txId,
          {
            aminoMsgs: [msg],
            protoMsgs: [
              {
                typeUrl: '/cosmos.bank.v1beta1.MsgSend',
                value: MsgSend.encode({
                  fromAddress: msg.value.from_address,
                  toAddress: msg.value.to_address,
                  amount: msg.value.amount,
                }).finish(),
              },
            ],
          },
          memo,
          {
            amount: stdFee.amount ?? [],
            gas: stdFee.gas ?? this.msgOpts.send.native.gas.toString(),
          },
          signOptions,
          this.txEventsWithPreOnFulfill(onTxEvents, (tx) => {
            if (tx.code == null || tx.code === 0) {
              // After succeeding to send token, refresh the balance.
              /*const queryBalance = this.queries.queryBalances
                .getQueryBech32Address(this.base.bech32Address)
                .balances.find((bal) => {
                  return (
                    bal.currency.coinMinimalDenom === currency.coinMinimalDenom
                  );
                });

              if (queryBalance) {
                queryBalance.fetch();
              }*/
            }
          })
        );
        return true;
      }
    }

    return false;
  }

  async generateMsg(
    amount: string,
    currency: AppCurrency,
    recipient: string,
    memo: string,
    stdFee: Partial<StdFee>
  ) {
    const {
      rpcUrl,
      chainId,
      ecoSystemParams,
      prefix: bech32Config,
      coinType,
    } = networkPreferenceService.getProviderConfig();
    const k = keyringService.getKeplrCompatibleKey(chainId);
    if (!k) throw Error('no key found');
    const { bech32Address, pubKey } = k;

    const {
      account: { account_number, sequence },
    } = await this.getAccounts(ecoSystemParams?.rest, bech32Address);

    const actualAmount = (_amount) => {
      let dec = new Dec(_amount);
      dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
      return dec.truncate().toString();
    };
    return {
      chain_id: chainId,
      account_number: account_number,
      sequence: sequence,
      fee: stdFee,
      from_address: bech32Address,
      to_address: recipient,
      msgs: [
        {
          type: this.msgOpts.send.native.type,
          value: {
            from_address: bech32Address,
            to_address: recipient,
            amount: [
              {
                denom: currency.coinMinimalDenom,
                amount: actualAmount(amount),
              },
            ],
          },
        },
      ],
      memo: memo,
    };
  }

  async sendMsgs(
    type: string | 'unknown',
    cosChainInfo: CosChainInfo,
    txId: string,
    msgs:
      | ProtoMsgsOrWithAminoMsgs
      | (() => Promise<ProtoMsgsOrWithAminoMsgs> | ProtoMsgsOrWithAminoMsgs),
    memo = '',
    fee: StdFee,
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    // this.base.setTxTypeInProgress(type);

    let txHash: Uint8Array;
    let signDoc: StdSignDoc;
    try {
      if (typeof msgs === 'function') {
        msgs = await msgs();
      }

      const result = await this.broadcastMsgs(
        cosChainInfo,
        msgs,
        fee,
        memo,
        txId,
        signOptions,
        this.broadcastMode
      );
      txHash = result.txHash;
      signDoc = result.signDoc;
    } catch (e: any) {
      // this.base.setTxTypeInProgress('');

      if (this.txOpts.preTxEvents?.onBroadcastFailed) {
        this.txOpts.preTxEvents.onBroadcastFailed(cosChainInfo.chainId, e);
      }

      if (
        onTxEvents &&
        'onBroadcastFailed' in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (typeof onTxEvents === 'function') {
        onFulfill = onTxEvents;
      } else {
        onBroadcasted = onTxEvents.onBroadcasted;
        onFulfill = onTxEvents.onFulfill;
      }
    }

    if (this.txOpts.preTxEvents?.onBroadcasted) {
      this.txOpts.preTxEvents.onBroadcasted(cosChainInfo.chainId, txHash);
    }
    if (onBroadcasted) {
      onBroadcasted(txHash);
    }

    const txTracer = new TendermintTxTracer(cosChainInfo.rpc, '/websocket', {
      wsObject: this.txOpts.wsObject,
    });
    txTracer.traceTx(txHash).then((tx) => {
      txTracer.close();

      // this.base.setTxTypeInProgress('');

      // After sending tx, the balances is probably changed due to the fee.
      /*for (const feeAmount of signDoc.fee.amount) {
        const bal = this.queries.queryBalances
          .getQueryBech32Address(this.base.bech32Address)
          .balances.find(
            (bal) => bal.currency.coinMinimalDenom === feeAmount.denom
          );

        if (bal) {
          bal.fetch();
        }
      }*/

      // Always add the tx hash data.
      if (tx && !tx.hash) {
        tx.hash = Buffer.from(txHash).toString('hex');
      }

      if (this.txOpts.preTxEvents?.onFulfill) {
        this.txOpts.preTxEvents.onFulfill(cosChainInfo.chainId, tx);
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    });
  }
  // Return the tx hash.
  protected async broadcastMsgs(
    cosChainInfo: CosChainInfo,
    msgs: ProtoMsgsOrWithAminoMsgs,
    fee: StdFee,
    memo = '',
    txId: string,
    signOptions?: KeplrSignOptions,
    mode: 'block' | 'async' | 'sync' = 'async'
  ): Promise<{
    txHash: Uint8Array;
    signDoc: StdSignDoc;
  }> {
    // TODO: add if
    // if (this.base.walletStatus !== WalletStatus.Loaded) {
    //   throw new Error(`Wallet is not loaded: ${this.base.walletStatus}`);
    // }

    const aminoMsgs: Msg[] = msgs.aminoMsgs;
    // fixed type error: const protoMsgs: Any[] = msgs.protoMsgs;
    const protoMsgs: Any[] = msgs.protoMsgs;

    // TODO: Make proto sign doc if `aminoMsgs` is empty or null
    if (aminoMsgs.length === 0 || protoMsgs.length === 0) {
      throw new Error('There is no msg to send');
    }

    if (aminoMsgs.length !== protoMsgs.length) {
      throw new Error('The length of aminoMsgs and protoMsgs are different');
    }

    const k = keyringService.getKeplrCompatibleKey(cosChainInfo.chainId);
    if (!k) throw Error('no key found');
    const { bech32Address, pubKey } = k;

    const { account } = await this.getAccounts(
      cosChainInfo.rest,
      bech32Address
    );

    const currentCosmosTx: CosmosTx = this.getTransaction(txId);
    console.log('--currentCosmosTx--', currentCosmosTx);
    this.addTransactionToList({
      ...currentCosmosTx,
      status: CosmosTxStatus.SIGNED,
      account,
      aminoMsgs,
      mode,
    });

    // const account = await BaseAccount.fetchFromRest(
    //   this.instance(cosChainInfo),
    //   bech32Address,
    //   true
    // );

    const coinType = cosChainInfo.coinType;

    // TODO: need remove keplr
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // const keplr = (await this.base.getKeplr())!;

    const signDoc = makeSignDoc(
      aminoMsgs,
      fee,
      cosChainInfo.chainId,
      memo,
      account.account_number,
      account.sequence
    );

    // TODO: need remove keplr
    const signResponse = await this.requestSignAmino(
      cosChainInfo.chainId,
      bech32Address,
      signDoc,
      signOptions as KeplrSignOptions
    );

    const signedTx = TxRaw.encode({
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: protoMsgs as
            | {
                typeUrl?: string | undefined;
                value?: Uint8Array | undefined;
              }[]
            | undefined,
          memo: signResponse.signed.memo,
        })
      ).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: [
          {
            publicKey: {
              typeUrl:
                coinType === 60
                  ? '/ethermint.crypto.v1.ethsecp256k1.PubKey'
                  : '/cosmos.crypto.secp256k1.PubKey',
              value: PubKey.encode({
                key: Buffer.from(
                  signResponse.signature.pub_key.value,
                  'base64'
                ),
              }).finish(),
            },
            modeInfo: {
              single: {
                mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
              },
              multi: undefined,
            },
            sequence: signResponse.signed.sequence,
          },
        ],
        fee: Fee.fromPartial({
          amount: signResponse.signed.fee.amount as
            | {
                denom?: string | undefined;
                amount?: string | undefined;
              }[]
            | undefined,
          gasLimit: signResponse.signed.fee.gas,
        }),
      }).finish(),
      signatures: [Buffer.from(signResponse.signature.signature, 'base64')],
    }).finish();

    return {
      // TODO: need remove keplr
      txHash: await this.sendTx(
        cosChainInfo,
        signedTx,
        mode as BroadcastMode,
        txId
      ),
      signDoc: signResponse.signed,
    };
  }

  protected txEventsWithPreOnFulfill(
    onTxEvents:
      | ((tx: any) => void)
      | {
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
      | undefined,
    preOnFulfill?: (tx: any) => void
  ):
    | {
        onBroadcasted?: (txHash: Uint8Array) => void;
        onFulfill?: (tx: any) => void;
      }
    | undefined {
    if (!onTxEvents) {
      return;
    }

    const onBroadcasted =
      typeof onTxEvents === 'function' ? undefined : onTxEvents.onBroadcasted;
    const onFulfill =
      typeof onTxEvents === 'function' ? onTxEvents : onTxEvents.onFulfill;

    return {
      onBroadcasted,
      onFulfill:
        onFulfill || preOnFulfill
          ? (tx: any) => {
              if (preOnFulfill) {
                preOnFulfill(tx);
              }

              if (onFulfill) {
                onFulfill(tx);
              }
            }
          : undefined,
    };
  }

  // protected get queries(): DeepReadonly<QueriesSetBase & CosmosQueries> {
  //   return this.queriesStore.get(this.chainId);
  // }

  // instance(cosChainInfo: CosChainInfo): AxiosInstance {
  //   const chainInfo = cosChainInfo;
  //   return Axios.create({
  //     ...{
  //       baseURL: chainInfo.rest,
  //     },
  //     ...chainInfo.restConfig,
  //   });
  // }
  async sendTx(
    cosChainInfo: CosChainInfo,
    tx: unknown,
    mode: 'async' | 'sync' | 'block',
    txId: string
  ): Promise<Uint8Array> {
    const chainInfo = cosChainInfo;
    // const restInstance = Axios.create({
    //   ...{
    //     baseURL: chainInfo.rest,
    //   },
    //   ...chainInfo.restConfig,
    // });

    // this.notification.create({
    //   iconRelativeUrl: "assets/temp-icon.svg",
    //   title: "Tx is pending...",
    //   message: "Wait a second",
    // });

    const isProtoTx = Buffer.isBuffer(tx) || tx instanceof Uint8Array;

    const params = isProtoTx
      ? {
          tx_bytes: Buffer.from(tx as any).toString('base64'),
          mode: (() => {
            switch (mode) {
              case 'async':
                return 'BROADCAST_MODE_ASYNC';
              case 'block':
                return 'BROADCAST_MODE_BLOCK';
              case 'sync':
                return 'BROADCAST_MODE_SYNC';
              default:
                return 'BROADCAST_MODE_UNSPECIFIED';
            }
          })(),
        }
      : {
          tx,
          mode: mode,
        };

    try {
      const fetchUrl = isProtoTx
        ? `${chainInfo.rest}/cosmos/tx/v1beta1/txs`
        : `${chainInfo.rest}/txs`;
      const result = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(params),
      }).then((res) => res.json());
      console.log('--------result--------', result);
      // const result = await restInstance.post(
      //   isProtoTx ? '/cosmos/tx/v1beta1/txs' : '/txs',
      //   params
      // );

      const txResponse = isProtoTx ? result['tx_response'] : result;

      if (txResponse.code != null && txResponse.code !== 0) {
        throw new Error(txResponse['raw_log']);
      }

      const txHash = Buffer.from(txResponse.txhash, 'hex');

      const txTracer = new TendermintTxTracer(chainInfo.rpc, '/websocket');
      console.log('----------------txHash----------------', txHash);
      txTracer.traceTx(txHash).then((tx) => {
        console.log('----------------traceTx----------------', tx);
        // platform.showTransactionNotification(tx, {});
        if (tx.code && !tx.data) {
          platform._showNotification('Tx Failed', tx.log);
        } else {
          platform._showNotification('Tx Success', tx.log);
        }
        txTracer.close();
      });

      const currentCosmosTx: CosmosTx = this.getTransaction(txId);
      console.log('--currentCosmosTx2222--', currentCosmosTx);
      this.addTransactionToList({
        ...currentCosmosTx,
        status: CosmosTxStatus.SUCCESS,
        tx_hash: txResponse.txhash,
      });

      return txHash;
    } catch (e) {
      console.log(e);
      platform._showNotification('Tx Failed', e);
      // platform.showTransactionNotification(e, {});
      throw e;
    }
  }
  async requestSignAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions: KeplrSignOptions & {
      // Hack option field to detect the sign arbitrary for string
      isADR36WithString?: boolean;
    }
  ): Promise<AminoSignResponse> {
    //const coinType = this.cosChainInfo.coinType;

    // TODO: use keyRing
    //const key = await this.keyRing.getKey(chainId, coinType);
    //const bech32Prefix = this.cosChainInfo.bech32Config.bech32PrefixAccAddr;
    //const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);

    const chains: Provider[] = networkPreferenceService.getSupportProviders();
    const chain: Provider | undefined = chains.find(
      (c: Provider) => c.chainId === chainId
    );
    const k = keyringService.getKeplrCompatibleKey(chainId);
    if (!k) throw Error('no key found');
    if (!chain) throw Error('no chain found');
    const { bech32Address, pubKey } = k;
    if (signer !== bech32Address) {
      throw new Error('Signer mismatched');
    }

    const isADR36SignDoc = checkAndValidateADR36AminoSignDoc(
      signDoc,
      (chain.prefix as Bech32Config).bech32PrefixAccAddr
    );
    if (isADR36SignDoc) {
      if (signDoc.msgs[0].value.signer !== signer) {
        // throw new KeplrError("keyring", 233, "Unmatched signer in sign doc");
        throw new Error('Unmatched signer in sign doc');
      }
    }

    if (signOptions.isADR36WithString != null && !isADR36SignDoc) {
      // throw new KeplrError(
      //   "keyring",
      //   236,
      //   'Sign doc is not for ADR-36. But, "isADR36WithString" option is defined'
      // );
      throw new Error(
        'Sign doc is not for ADR-36. But, "isADR36WithString" option is defined'
      );
    }

    // const newSignDoc = (await this.interactionService.waitApprove(
    //   env,
    //   "/sign",
    //   "request-sign",
    //   {
    //     msgOrigin,
    //     chainId,
    //     mode: "amino",
    //     signDoc,
    //     signer,
    //     signOptions,
    //     isADR36SignDoc,
    //     isADR36WithString: signOptions.isADR36WithString,
    //   }
    // )) as StdSignDoc;

    if (isADR36SignDoc) {
      // Validate the new sign doc, if it was for ADR-36.
      if (
        checkAndValidateADR36AminoSignDoc(
          signDoc,
          (chain.prefix as Bech32Config).bech32PrefixAccAddr
        )
      ) {
        if (signDoc.msgs[0].value.signer !== signer) {
          // throw new KeplrError(
          //   "keyring",
          //   232,
          //   "Unmatched signer in new sign doc"
          // );
          throw new Error('Unmatched signer in new sign doc');
        }
      } else {
        // throw new KeplrError(
        //   "keyring",
        //   237,
        //   "Signing request was for ADR-36. But, accidentally, new sign doc is not for ADR-36"
        // );
        throw new Error(
          'Signing request was for ADR-36. But, accidentally, new sign doc is not for ADR-36'
        );
      }
    }

    try {
      const privateKey = keyringService.getPrivateKeyByAddress(k.bech32Address);
      if (!privateKey) throw Error('no private key found');
      const signature = new CosmosKey().generateSignature(
        serializeSignDoc(signDoc),
        privateKey
      );

      return {
        signed: signDoc,
        signature: encodeSecp256k1Signature(k.pubKey, signature),
      };
    } finally {
      // this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }
  async getAccounts(baseURL, address) {
    return await fetch(`${baseURL}/cosmos/auth/v1beta1/accounts/${address}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
      },
    }).then((res) => res.json());
  }
}
