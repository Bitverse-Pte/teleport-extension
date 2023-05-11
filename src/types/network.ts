import type { PresetNetworkId } from 'constants/defaultNetwork';
import {
  Bech32Config,
  BIP44,
  CosmosAppCurrency,
  CosmosCurrency,
} from './cosmos';

// just use the enum
// they are easy to use and never mistaken

export enum CoinType {
  ETH = 60,
  COSMOS = 118,
  POLKADOT = 354,
  SECRET_NETWORK = 529,
  CRYPTO_ORG = 394,
  KAVA = 459,
  BIT = 10005001,
}

export enum Ecosystem {
  EVM = 'EVM',
  COSMOS = 'COSMOS',
  POLKADOT = 'POLKADOT',
}

export enum VmEnums {
  EVM = 'evm',
  COSM_WASM = 'cosmwasm',
  SECRET_WASM = 'secretwasm',
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

  /**
   * Some properties that only exist in other ecosystem will be here
   * currently only support Cosmos, you can add more type as we expand the support for other ecosystem
   */
  ecoSystemParams?: CosmosParams;
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
    | 'KLAY'
    | 'COSMOS_HUB'
    | 'OSMOSIS'
    | 'SECRET_NETWORK'
    | 'KAVA'
    | 'CRYPTO_ORG'
    | 'UMEE'
    | 'EVMOS'
    | 'JUNO'
    | 'MANTLE_TEST'
    | 'MANTLE'
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

export interface CosmosParams {
  rest: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  stakeCurrency: CosmosCurrency;
  walletUrl?: string;
  walletUrlForStaking?: string;
  alternativeBIP44s?: BIP44[];
  currencies: CosmosAppCurrency[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  feeCurrencies: CosmosCurrency[];

  /**
   * This is used to set the fee of the transaction.
   * If this field is empty, it just use the default gas price step (low: 0.01, average: 0.025, high: 0.04).
   * And, set field's type as primitive number because it is hard to restore the prototype after deserialzing if field's type is `Dec`.
   */
  gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
  /**
   * Indicate the features supported by this chain. Ex) cosmwasm, secretwasm ...
   */
  features?: string[];
  /**
   * Shows whether the blockchain is in production phase or beta phase.
   * Major features such as staking and sending are supported on staging blockchains, but without guarantee.
   * If the blockchain is in an early stage, please set it as beta.
   */
  beta?: boolean;
}
