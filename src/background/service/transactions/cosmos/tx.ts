import { AccountSetBaseSuper, MsgOpt, WalletStatus } from "./base";
import { AppCurrency, KeplrSignOptions } from "@keplr-wallet/types";
import {
  BroadcastMode,
  makeSignDoc,
  Msg,
  StdFee,
  StdSignDoc,
} from "@cosmjs/launchpad";
import { DenomHelper } from "@keplr-wallet/common";
import { Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { Any } from "@keplr-wallet/proto-types/google/protobuf/any";
import { MsgSend } from "@keplr-wallet/proto-types/cosmos/bank/v1beta1/tx";
import {
  BaseAccount,
  Bech32Address,
  ChainIdHelper,
  TendermintTxTracer,
} from "@keplr-wallet/cosmos";
// import { QueriesSetBase, IQueriesStore, CosmosQueries } from "./query";
import { DeepPartial, DeepReadonly } from "utility-types";
import { CosChainInfo } from "./types";
import deepmerge from "deepmerge";
import { isAddress } from "@ethersproject/address";
import { Buffer } from "buffer/";
import Axios, { AxiosInstance } from "axios";
import {
  AuthInfo,
  TxRaw,
  TxBody,
  Fee,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { SignMode } from "@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";
import { Coin } from "@keplr-wallet/proto-types/cosmos/base/v1beta1/coin";
import platform from '../../extension';

// FOR SIGN
import {
  encodeSecp256k1Signature,
  serializeSignDoc,
  AminoSignResponse,
} from "@cosmjs/launchpad";
import {
  checkAndValidateADR36AminoSignDoc,
} from "@keplr-wallet/cosmos";

export interface CosmosAccount {
  cosmos: CosmosAccountImpl;
}

export const CosmosAccount = {
  use(options: {
    msgOptsCreator?: (
      chainId: string
    ) => DeepPartial<CosmosMsgOpts> | undefined;
    // queriesStore: IQueriesStore<CosmosQueries>;
    wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
    preTxEvents?: {
      onBroadcastFailed?: (chainId: string, e?: Error) => void;
      onBroadcasted?: (chainId: string, txHash: Uint8Array) => void;
      onFulfill?: (chainId: string, tx: any) => void;
    };
  }): (
    base: AccountSetBaseSuper,
    cosChainInfo: CosChainInfo,
    chainId: string
  ) => CosmosAccount {
    return (base, cosChainInfo, chainId) => {
      const msgOptsFromCreator = options.msgOptsCreator
        ? options.msgOptsCreator(chainId)
        : undefined;

      return {
        cosmos: new CosmosAccountImpl(
          base,
          cosChainInfo,
          chainId,
          // options.queriesStore,
          deepmerge<CosmosMsgOpts, DeepPartial<CosmosMsgOpts>>(
            defaultCosmosMsgOpts,
            msgOptsFromCreator ? msgOptsFromCreator : {}
          ),
          options
        ),
      };
    };
  },
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
      type: "cosmos-sdk/MsgSend",
      gas: 80000,
    },
  },
  ibcTransfer: {
    type: "cosmos-sdk/MsgTransfer",
    gas: 450000,
  },
  delegate: {
    type: "cosmos-sdk/MsgDelegate",
    gas: 250000,
  },
  undelegate: {
    type: "cosmos-sdk/MsgUndelegate",
    gas: 250000,
  },
  redelegate: {
    type: "cosmos-sdk/MsgBeginRedelegate",
    gas: 250000,
  },
  // The gas multiplication per rewards.
  withdrawRewards: {
    type: "cosmos-sdk/MsgWithdrawDelegationReward",
    gas: 140000,
  },
  govVote: {
    type: "cosmos-sdk/MsgVote",
    gas: 250000,
  },
};

type ProtoMsgsOrWithAminoMsgs = {
  // TODO: Make `aminoMsgs` nullable
  //       And, make proto sign doc if `aminoMsgs` is null
  aminoMsgs: Msg[];
  protoMsgs: Any[];
};

export class CosmosAccountImpl {
  public broadcastMode: "sync" | "async" | "block" = "sync";

  constructor(
    protected readonly base: AccountSetBaseSuper,
    protected readonly cosChainInfo: CosChainInfo,
    protected readonly chainId: string,
    // protected readonly queriesStore: IQueriesStore<CosmosQueries>,
    protected readonly _msgOpts: CosmosMsgOpts,
    protected readonly txOpts: {
      wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
      preTxEvents?: {
        onBroadcastFailed?: (chainId: string, e?: Error) => void;
        onBroadcasted?: (chainId: string, txHash: Uint8Array) => void;
        onFulfill?: (chainId: string, tx: any) => void;
      };
    }
  ) {
    this.base.registerSendTokenFn(this.processSendToken.bind(this));
  }

  get msgOpts(): CosmosMsgOpts {
    return this._msgOpts;
  }

  protected async processSendToken(
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

    const hexAdjustedRecipient = (recipient: string) => {
      const bech32prefix = this.cosChainInfo.bech32Config.bech32PrefixAccAddr;
      if (bech32prefix === "evmos" && recipient.startsWith("0x")) {
        // Validate hex address
        if (!isAddress(recipient)) {
          throw new Error("Invalid hex address");
        }
        const buf = Buffer.from(
          recipient.replace("0x", "").toLowerCase(),
          "hex"
        );
        return new Bech32Address(buf).toBech32(bech32prefix);
      }
      return recipient;
    };

    switch (denomHelper.type) {
      case "native":
        const actualAmount = (() => {
          let dec = new Dec(amount);
          dec = dec.mul(DecUtils.getPrecisionDec(currency.coinDecimals));
          return dec.truncate().toString();
        })();

        const msg = {
          type: this.msgOpts.send.native.type,
          value: {
            from_address: this.base.bech32Address,
            to_address: hexAdjustedRecipient(recipient),
            amount: [
              {
                denom: currency.coinMinimalDenom,
                amount: actualAmount,
              },
            ],
          },
        };

        await this.sendMsgs(
          "send",
          {
            aminoMsgs: [msg],
            protoMsgs: [
              {
                typeUrl: "/cosmos.bank.v1beta1.MsgSend",
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

    return false;
  }

  async sendMsgs(
    type: string | "unknown",
    msgs:
      | ProtoMsgsOrWithAminoMsgs
      | (() => Promise<ProtoMsgsOrWithAminoMsgs> | ProtoMsgsOrWithAminoMsgs),
    memo: string = "",
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
    this.base.setTxTypeInProgress(type);

    let txHash: Uint8Array;
    let signDoc: StdSignDoc;
    try {
      if (typeof msgs === "function") {
        msgs = await msgs();
      }

      const result = await this.broadcastMsgs(
        msgs,
        fee,
        memo,
        signOptions,
        this.broadcastMode
      );
      txHash = result.txHash;
      signDoc = result.signDoc;
    } catch (e: any) {
      this.base.setTxTypeInProgress("");

      if (this.txOpts.preTxEvents?.onBroadcastFailed) {
        this.txOpts.preTxEvents.onBroadcastFailed(this.chainId, e);
      }

      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(e);
      }

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (typeof onTxEvents === "function") {
        onFulfill = onTxEvents;
      } else {
        onBroadcasted = onTxEvents.onBroadcasted;
        onFulfill = onTxEvents.onFulfill;
      }
    }

    if (this.txOpts.preTxEvents?.onBroadcasted) {
      this.txOpts.preTxEvents.onBroadcasted(this.chainId, txHash);
    }
    if (onBroadcasted) {
      onBroadcasted(txHash);
    }

    const txTracer = new TendermintTxTracer(
      this.cosChainInfo.rpc,
      "/websocket",
      {
        wsObject: this.txOpts.wsObject,
      }
    );
    txTracer.traceTx(txHash).then((tx) => {
      txTracer.close();

      this.base.setTxTypeInProgress("");

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
        tx.hash = Buffer.from(txHash).toString("hex");
      }

      if (this.txOpts.preTxEvents?.onFulfill) {
        this.txOpts.preTxEvents.onFulfill(this.chainId, tx);
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    });
  }
	// Return the tx hash.
	protected async broadcastMsgs(
		msgs: ProtoMsgsOrWithAminoMsgs,
		fee: StdFee,
		memo: string = "",
		signOptions?: KeplrSignOptions,
		mode: "block" | "async" | "sync" = "async"
	): Promise<{
		txHash: Uint8Array;
		signDoc: StdSignDoc;
	}> {
		if (this.base.walletStatus !== WalletStatus.Loaded) {
			throw new Error(`Wallet is not loaded: ${this.base.walletStatus}`);
		}

		const aminoMsgs: Msg[] = msgs.aminoMsgs;
		// fixed type error: const protoMsgs: Any[] = msgs.protoMsgs;
		const protoMsgs: Any[] = msgs.protoMsgs;

		// TODO: Make proto sign doc if `aminoMsgs` is empty or null
		if (aminoMsgs.length === 0 || protoMsgs.length === 0) {
			throw new Error("There is no msg to send");
		}

		if (aminoMsgs.length !== protoMsgs.length) {
			throw new Error("The length of aminoMsgs and protoMsgs are different");
		}

		const account = await BaseAccount.fetchFromRest(
			this.instance,
			this.base.bech32Address,
			true
		);

		const coinType = this.cosChainInfo.coinType;

    // TODO: need remove keplr
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		// const keplr = (await this.base.getKeplr())!;

		const signDoc = makeSignDoc(
			aminoMsgs,
			fee,
			this.chainId,
			memo,
			account.getAccountNumber().toString(),
			account.getSequence().toString()
		);
    
    // TODO: need remove keplr
		const signResponse = await this.requestSignAmino(
			this.chainId,
			this.base.bech32Address,
			signDoc,
			signOptions as KeplrSignOptions
		);

		const signedTx = TxRaw.encode({
			bodyBytes: TxBody.encode(
				TxBody.fromPartial({
					messages: protoMsgs as {
            typeUrl?: string | undefined;
            value?: Uint8Array | undefined;
          }[] | undefined,
					memo: signResponse.signed.memo,
				})
			).finish(),
			authInfoBytes: AuthInfo.encode({
				signerInfos: [
					{
						publicKey: {
							typeUrl:
								coinType === 60
									? "/ethermint.crypto.v1.ethsecp256k1.PubKey"
									: "/cosmos.crypto.secp256k1.PubKey",
							value: PubKey.encode({
								key: Buffer.from(
									signResponse.signature.pub_key.value,
									"base64"
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
					amount: signResponse.signed.fee.amount as {
            denom?: string | undefined;
            amount?: string | undefined;
          }[] | undefined,
					gasLimit: signResponse.signed.fee.gas,
				}),
			}).finish(),
			signatures: [Buffer.from(signResponse.signature.signature, "base64")],
		}).finish();

		return {
      // TODO: need remove keplr
			txHash: await this.sendTx(this.cosChainInfo, signedTx, mode as BroadcastMode),
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
      typeof onTxEvents === "function" ? undefined : onTxEvents.onBroadcasted;
    const onFulfill =
      typeof onTxEvents === "function" ? onTxEvents : onTxEvents.onFulfill;

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

	get instance(): AxiosInstance {
    const chainInfo = this.cosChainInfo;
    return Axios.create({
      ...{
        baseURL: chainInfo.rest,
      },
      ...chainInfo.restConfig,
    });
  }
  async sendTx(
    cosChainInfo: CosChainInfo,
    tx: unknown,
    mode: "async" | "sync" | "block"
  ): Promise<Uint8Array> {
    const chainInfo = cosChainInfo;
    const restInstance = Axios.create({
      ...{
        baseURL: chainInfo.rest,
      },
      ...chainInfo.restConfig,
    });

    // this.notification.create({
    //   iconRelativeUrl: "assets/temp-icon.svg",
    //   title: "Tx is pending...",
    //   message: "Wait a second",
    // });

    const isProtoTx = Buffer.isBuffer(tx) || tx instanceof Uint8Array;

    const params = isProtoTx
      ? {
          tx_bytes: Buffer.from(tx as any).toString("base64"),
          mode: (() => {
            switch (mode) {
              case "async":
                return "BROADCAST_MODE_ASYNC";
              case "block":
                return "BROADCAST_MODE_BLOCK";
              case "sync":
                return "BROADCAST_MODE_SYNC";
              default:
                return "BROADCAST_MODE_UNSPECIFIED";
            }
          })(),
        }
      : {
          tx,
          mode: mode,
        };

    try {
      const result = await restInstance.post(
        isProtoTx ? "/cosmos/tx/v1beta1/txs" : "/txs",
        params
      );

      const txResponse = isProtoTx ? result.data["tx_response"] : result.data;

      if (txResponse.code != null && txResponse.code !== 0) {
        throw new Error(txResponse["raw_log"]);
      }

      const txHash = Buffer.from(txResponse.txhash, "hex");

      const txTracer = new TendermintTxTracer(chainInfo.rpc, "/websocket");
      txTracer.traceTx(txHash).then((tx) => {
        txTracer.close();
        platform.showTransactionNotification(tx, {});
      });

      return txHash;
    } catch (e) {
      console.log(e);
      platform.showTransactionNotification(e, {});
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
    const coinType = this.cosChainInfo.coinType;

    // TODO: use keyRing
    const key = await this.keyRing.getKey(chainId, coinType);
    const bech32Prefix = this.cosChainInfo.bech32Config.bech32PrefixAccAddr;
    const bech32Address = new Bech32Address(key.address).toBech32(bech32Prefix);
    if (signer !== bech32Address) {
      // throw new KeplrError("keyring", 231, "Signer mismatched");
      throw new Error('Signer mismatched');
    }

    const isADR36SignDoc = checkAndValidateADR36AminoSignDoc(
      signDoc,
      bech32Prefix
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
      throw new Error('Sign doc is not for ADR-36. But, "isADR36WithString" option is defined');
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
      if (checkAndValidateADR36AminoSignDoc(signDoc, bech32Prefix)) {
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
        throw new Error('Signing request was for ADR-36. But, accidentally, new sign doc is not for ADR-36');
      }
    }

    try {
      // TODO: use keyRing
      const signature = await this.keyRing.sign(
        chainId,
        coinType,
        serializeSignDoc(signDoc)
      );

      return {
        signed: signDoc,
        signature: encodeSecp256k1Signature(key.pubKey, signature),
      };
    } finally {
      // this.interactionService.dispatchEvent(APP_PORT, "request-sign-end", {});
    }
  }
}
