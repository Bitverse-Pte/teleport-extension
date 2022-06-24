import { keyringService, networkPreferenceService } from 'background/service';
import { CosmosKey } from 'background/service/keyManager/cosmos/CosmosKey';
import { JSONUint8Array } from 'utils/cosmos/json-uint8-array';
import { encodeSecp256k1Signature, serializeSignDoc } from '@cosmjs/launchpad';
import BitError from 'error';
import { ErrorCode } from 'constants/code';

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
    const pk = keyringService.getPrivateKeyByAddress(k.bech32Address);
    if (!pk) throw new BitError(ErrorCode.WALLET_WAS_LOCKED);
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
    const pk = keyringService.getPrivateKeyByAddress(k.bech32Address);
    if (!pk) throw new BitError(ErrorCode.WALLET_WAS_LOCKED);
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
  sendTx = async () => {
    //
  };
}

export default new CosmosProviderController();
