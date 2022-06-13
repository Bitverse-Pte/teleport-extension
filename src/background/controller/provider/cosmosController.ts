import { keyringService } from 'background/service';

class CosmosProviderController {
  @Reflect.metadata('SAFE', true)
  getKey = async ({ data: { args } }) => {
    return keyringService.getKeplrCompatibleKey(args[0]);
  };

  enable = async ({ data: { args } }) => {
    const chainId = args[0];
    return chainId;
  };
}

export default new CosmosProviderController();
