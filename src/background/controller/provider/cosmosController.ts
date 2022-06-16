import { keyringService, networkPreferenceService } from 'background/service';

class CosmosProviderController {
  @Reflect.metadata('SAFE', true)
  getKey = async ({ data: { args } }) => {
    const resp = keyringService.getKeplrCompatibleKey(args[0]);
    console.log('======[resp, chainId]=====', resp, args[0]);
    return resp;
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
    console.log('=keyringService.generateMissedAccounts()=');
  };

  @Reflect.metadata('APPROVAL', ['SignTx'])
  signDirect = async ({ data, session: { origin } }) => {
    //return keyringService.signDirect();
  };

  @Reflect.metadata('APPROVAL', ['SignTx'])
  signAmino = async ({ data, session: { origin } }) => {
    //return keyringService.signDirect();
  };

  sendTx = async () => {
    //
  };
}

export default new CosmosProviderController();
