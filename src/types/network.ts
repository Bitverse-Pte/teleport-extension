import { CHAINS } from 'constants/chain';
import type { PresetNetworkId } from 'constants/defaultNetwork';

// just use the enum
// they are easy to use and never mistaken
export enum CoinType {
  ETH = 60, // 0
  COSMOS = 118, // 1
  // SOME_OTHER_CHAIN_COIN // 2 etc...
  // You can add as you like
}

export interface Network {
  // MetaMask use HexString for ChainId, so we should do the same
  chainId: string;
  nickname: string;
  rpcPrefs: {
    blockExplorerUrl?: string;
  };
  rpcUrl: string;
  ticker?: string;
  category: string;

  // leaving this field for future support of non-EVM based chains
  coinType: CoinType;
  isEthereumCompatible: boolean;

  // for further question please contact lsc
  chainName: string;

  /**
   * Relation required,
   * for preset network, equal to `type`
   * for `rpc` provider, used `nanoid` for type
   */
  id: PresetNetworkId | string;
}
export interface Provider extends Network {
  type:
    | 'mainnet'
    | 'goerli'
    | 'rinkeby'
    | 'ropsten'
    | 'kovan'
    | 'BSC'
    | 'POLYGON'
    | 'ARBITRUM'
    | 'rpc';
}

export interface NetworkController {
  network: string;
  networkDetails: {
    EIPS: {
      '1559': boolean;
    };
  };
  previousProviderStore?: Provider;
  provider: Provider;
}

export type NetworkBg2UIMessage =
  | {
      type: 'update';
      data: NetworkController;
    }
  | {
      type: 'update_custom_network';
      data: Network[];
    }
  | {
      type: 'update_all';
      data: {
        customNetworks: Network[];
        ctrler: NetworkController;
      };
    };
