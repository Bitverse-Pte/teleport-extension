import {
  keyringService,
  networkPreferenceService,
  cosmosTxController,
} from 'background/service';
import { CosmosKey } from 'background/service/keyManager/cosmos/CosmosKey';
import { JSONUint8Array } from 'utils/cosmos/json-uint8-array';
import { encodeSecp256k1Signature, serializeSignDoc } from '@cosmjs/launchpad';
import { nanoid as createId } from 'nanoid';
import { CosChainInfo } from 'background/service/transactions/cosmos/types';
import BitError from 'error';
import { ErrorCode } from 'constants/code';
import cosmosController from 'background/service/transactions/cosmos';
import { CosmosTxStatus } from 'types/cosmos/transaction';
import { CoinType } from 'types/network';
import { EthKey } from 'background/service/keyManager/eth/EthKey';
import {
  AuthInfo,
  SignDoc,
  TxBody,
} from '@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx';
import { ProtoSignDocDecoder } from '@keplr-wallet/cosmos';
import { makeSignBytes } from '@cosmjs/proto-signing';
import Long from 'long';

class CosmosProviderController {
  @Reflect.metadata('SAFE', true)
  getKey = async ({ data: { args } }) => {
    const resp = keyringService.getKeplrCompatibleKey(args[0]);
    return JSONUint8Array.wrap(resp);
  };

  enable = async ({ data: { args } }) => {
    const chainId = args[0];
    return chainId;
  };

  @Reflect.metadata('SkipConnect', true)
  @Reflect.metadata('APPROVAL', [
    'AddCosmosChain',
    (req) => {
      const { data } = req;
      const {
        args: [chainParams],
      } = data;
      const chainId = chainParams.chainId;
      const exist = networkPreferenceService
        .getAllProviders()
        .find((_a) => _a.chainId === chainId);
      if (exist) {
        return true;
      }
      return false;
    },
  ])
  experimentalSuggestChain = async ({
    data: {
      args: [chainParams],
    },
    session: { origin },
  }) => {
    await networkPreferenceService.suggestCosmosChainInfo(chainParams, origin);
    keyringService.generateMissedAccounts();
  };

  @Reflect.metadata('APPROVAL', ['SignDirectCosmTx'])
  signDirect = async ({
    data: {
      args: [chainId, from, messages],
    },
    session: { origin },
    approvalRes,
  }) => {
    const _protoSignDoc = new ProtoSignDocDecoder(messages);
    const newSignDoc: SignDoc = {
      bodyBytes: TxBody.encode({
        ..._protoSignDoc.txBody,
        ...{
          memo: approvalRes?.txBody?.memo,
        },
      }).finish(),
      authInfoBytes: AuthInfo.encode({
        ..._protoSignDoc.authInfo,
        ...{
          fee: approvalRes?.authInfo?.fee,
        },
      }).finish(),
      chainId: approvalRes.chainId,
      accountNumber: approvalRes.accountNumber,
    };
    console.log('====[messages, newSignDoc]====', messages, newSignDoc);
    const { accountNumber: newSignDocAccountNumber, ...newSignDocRest } =
      newSignDoc;
    const cosmJSSignDoc = {
      ...newSignDocRest,
      accountNumber: Long.fromString(newSignDocAccountNumber),
    };
    const k = keyringService.getKeplrCompatibleKey(chainId);
    if (!k) throw Error('no key found');
    const pk = keyringService.getPrivateKeyByAddress(k.bech32Address);
    if (!pk) throw new BitError(ErrorCode.WALLET_WAS_LOCKED);
    const coinType = networkPreferenceService.getChainCoinType(chainId);
    let signature;
    if (coinType === CoinType.ETH) {
      const ethKey = new EthKey();
      signature = await ethKey.generateSignature(
        serializeSignDoc(JSONUint8Array.unwrap(newSignDoc)),
        pk
      );
    } else {
      const cosmosKey = new CosmosKey();
      signature = cosmosKey.generateSignature(makeSignBytes(cosmJSSignDoc), pk);
    }

    return {
      signed: JSONUint8Array.wrap(newSignDoc),
      signature: encodeSecp256k1Signature(k.pubKey, signature),
    };
  };

  @Reflect.metadata('APPROVAL', ['SignAminoCosmTx'])
  signAmino = async ({
    data: {
      args: [chainId, from, messages],
    },
    session: { origin },
    approvalRes,
  }) => {
    console.log('==[chainId, from, approvalRes]==', chainId, from, approvalRes);
    const k = keyringService.getKeplrCompatibleKey(chainId);
    if (!k) throw Error('no key found');
    const signDoc = JSONUint8Array.unwrap(approvalRes);
    const pk = keyringService.getPrivateKeyByAddress(k.bech32Address);
    if (!pk) throw new BitError(ErrorCode.WALLET_WAS_LOCKED);
    const currentCoinType = networkPreferenceService.getChainCoinType(chainId);
    let signature;
    if (currentCoinType === CoinType.ETH) {
      const ethKey = new EthKey();
      signature = await ethKey.generateSignature(serializeSignDoc(signDoc), pk);
    } else {
      const cosmosKey = new CosmosKey();
      signature = cosmosKey.generateSignature(serializeSignDoc(signDoc), pk);
    }
    // process activities
    const {
      rpcUrl,
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
    let { account } = await cosmosTxController.cosmosAccount.getAccounts(
      cosChainInfo.rest,
      k.bech32Address
    );
    if (!account) {
      account = {
        address: k.bech32Address,
      };
    }
    const txId = createId();
    cosmosTxController.cosmosAccount.addTransactionToList({
      id: txId,
      type: 'sign',
      status: CosmosTxStatus.SIGNED,
      chainInfo: cosChainInfo,
      timestamp: new Date().getTime(),
      aminoMsgs: approvalRes?.msgs,
      memo: approvalRes?.memo,
      fee: approvalRes?.fee,
      account,
      fromDapp: origin,
    });
    return {
      signed: JSONUint8Array.wrap(signDoc),
      signature: encodeSecp256k1Signature(k.pubKey, signature),
    };
  };

  @Reflect.metadata('SkipConnect', true)
  sendTx = async ({
    data: {
      args: [id, tx, mode],
    },
    session: { origin },
  }) => {
    const {
      rpcUrl,
      chainId,
      ecoSystemParams,
      prefix: bech32Config,
      coinType,
    } = networkPreferenceService.getCosmosChainInfo(id);
    const cosChainInfo = {
      rpc: rpcUrl,
      chainId,
      rest: ecoSystemParams?.rest,
      bech32Config,
      coinType,
    } as CosChainInfo;
    const txId = createId();
    console.log(
      '==={cosChainInfo, tx, mode, txId}===',
      cosChainInfo,
      tx,
      mode,
      txId
    );
    const txHash = await cosmosTxController.sendTx(
      cosChainInfo,
      tx,
      mode,
      txId
    );
    return txHash;
  };
}

export default new CosmosProviderController();
