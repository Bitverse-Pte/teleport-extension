import type { PresetNetworkId } from 'constants/defaultNetwork';
import { Bech32Config } from './cosmos';

// just use the enum
// they are easy to use and never mistaken
export enum CoinType {
  ETH = 60, // 0
  COSMOS = 118, // 1
  POLKADOT = 354,
  // SOME_OTHER_CHAIN_COIN // 2 etc...
  // You can add as you like
}

export enum Ecosystem {
  EVM = 'EVM',
  COSMOS = 'COSMOS',
  POLKADOT = 'POLKADOT',
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

  // leaving this field for future support of non-EVM based chains
  coinType: CoinType;

  // for further question please contact lsc
  chainName: string;

  /**
   * Relation required,
   * for preset network, equal to `type`
   * for `rpc` provider, used `nanoid` for type
   */
  id: PresetNetworkId | string;

  /**
   * Future-proof design
   */
  ecosystem: Ecosystem;

  prefix: string | Bech32Config;
}
export interface Provider extends Network {
  type:
    | 'ethereum'
    | 'goerli'
    | 'rinkeby'
    | 'ropsten'
    | 'kovan'
    | 'BSC'
    | 'POLYGON'
    | 'ARBITRUM'
    | 'FANTOM'
    | 'AVAX'
    | 'OP'
    | 'COSMOS_HUB'
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
