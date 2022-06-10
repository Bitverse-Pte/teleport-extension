import { keyringService, networkPreferenceService } from 'background/service';

class CosmosProviderController {
  @Reflect.metadata('SAFE', true)
  getKey = async ({ data: { args } }) => {
    return keyringService.getKeplrCompatibleKey(args[0]);
  };

  enable = async ({ data: { args } }) => {
    const chainId = args[0];
    return chainId;
  };

  @Reflect.metadata('SAFE', true)
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
    networkPreferenceService.suggestCosmosChainInfo(chainParams, origin);
  };
}

export default new CosmosProviderController();
