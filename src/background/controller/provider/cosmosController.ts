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
  }) => {
    console.log('==[chainId, from, messages]==', chainId, from, messages);
    const k = keyringService.getKeplrCompatibleKey(chainId);
    if (!k) throw Error('no key found');
    const signDoc = JSONUint8Array.unwrap(messages);
    const pk = await keyringService.getPrivateKeyByAddress(k.bech32Address);
    if (!pk) throw Error('no private key found');
    const cosmosKey = new CosmosKey();
    const signature = cosmosKey.generateSignature(
      serializeSignDoc(signDoc),
      pk
    );
    return {
      signed: JSONUint8Array.wrap(signDoc),
      signature: encodeSecp256k1Signature(k.pubKey, signature),
    };
  };

  @Reflect.metadata('APPROVAL', ['SignAminoCosmTx'])
  signAmino = async ({
    data: {
      args: [chainId, from, messages],
    },
    session: { origin },
  }) => {
    console.log('==[chainId, from, messages]==', chainId, from, messages);
    const k = keyringService.getKeplrCompatibleKey(chainId);
    if (!k) throw Error('no key found');
    const signDoc = JSONUint8Array.unwrap(messages);
    const pk = await keyringService.getPrivateKeyByAddress(k.bech32Address);
    if (!pk) throw Error('no private key found');
    const cosmosKey = new CosmosKey();
    const signature = cosmosKey.generateSignature(
      serializeSignDoc(signDoc),
      pk
    );
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
    console.log('========>>>>>>>[id, tx, mode]', id, tx, mode);
    const txHash = await cosmosTxController.cosmos.sendTx(
      cosChainInfo,
      tx,
      mode,
      txId
    );
    return txHash;
  };
}

export default new CosmosProviderController();
