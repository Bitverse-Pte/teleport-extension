import { CoinType, Ecosystem, Provider } from 'types/network';
import { Bech32Address } from 'utils/cosmos/bech32';
import { CHAINS } from './chain';

export enum PresetNetworkId {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  BSC = 'bsc',
  FTM = 'ftm',
  AVAX = 'avax',
  OP = 'op',
  TELE_TEST = 'teleport_testnet',
  COSMOS_HUB = 'cosmos_hub',
  OSMOSIS = 'osmosis',
  SECRET_NETWORK = 'secret_network',
}

const EVMProviderSharedProperties = {
  chainName: 'ETH',
  coinType: CoinType.ETH,
  ecosystem: Ecosystem.EVM,
  prefix: '0x',
};

export const defaultNetworks: {
  [key in CHAINS]?: Provider;
} = {
  [CHAINS.ETH]: {
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    chainId: '0x1',
    ticker: 'ETH',
    nickname: 'Ethereum Mainnet',
    rpcPrefs: {
      blockExplorerUrl: 'https://etherscan.io',
    },
    id: PresetNetworkId.ETHEREUM,
    type: 'ethereum',
    ...EVMProviderSharedProperties,
  },
  [CHAINS.BSC]: {
    id: PresetNetworkId.BSC,
    type: CHAINS.BSC,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    chainId: '0x38',
    ticker: 'BNB',
    nickname: 'BNB Smart Chain',
    rpcPrefs: {
      blockExplorerUrl: 'https://bscscan.com',
    },
    ...EVMProviderSharedProperties,
  },
  [CHAINS.ARBITRUM]: {
    id: PresetNetworkId.ARBITRUM,
    type: CHAINS.ARBITRUM,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    chainId: '0xa4b1',
    ticker: 'ETH',
    nickname: 'Arbitrum One',
    rpcPrefs: {
      blockExplorerUrl: 'https://arbiscan.io/',
    },
    ...EVMProviderSharedProperties,
  },
  [CHAINS.POLYGON]: {
    id: PresetNetworkId.POLYGON,
    type: CHAINS.POLYGON,
    rpcUrl: 'https://rpc-mainnet.maticvigil.com',
    chainId: '0x89',
    ticker: 'MATIC',
    nickname: 'Polygon Mainnet',
    rpcPrefs: {
      blockExplorerUrl: 'https://polygonscan.com',
    },
    ...EVMProviderSharedProperties,
  },
  [CHAINS.FTM]: {
    id: PresetNetworkId.FTM,
    type: CHAINS.FTM,
    rpcUrl: 'https://rpc.ftm.tools/',
    chainId: '0xfa',
    ticker: 'FTM',
    nickname: 'Fantom Opera',
    rpcPrefs: {
      blockExplorerUrl: 'https://ftmscan.com',
    },
    ...EVMProviderSharedProperties,
  },
  [CHAINS.AVAX]: {
    id: PresetNetworkId.AVAX,
    type: CHAINS.AVAX,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: '0xa86a',
    ticker: 'AVAX',
    nickname: 'Avalanche Network',
    rpcPrefs: {
      blockExplorerUrl: 'https://snowtrace.io',
    },
    ...EVMProviderSharedProperties,
  },
  [CHAINS.OP]: {
    id: PresetNetworkId.OP,
    type: CHAINS.OP,
    rpcUrl: 'https://mainnet.optimism.io',
    chainId: '0xa',
    ticker: 'ETH',
    nickname: 'Optimistic Ethereum',
    rpcPrefs: {
      blockExplorerUrl: 'https://optimistic.ethereum.io',
    },
    ...EVMProviderSharedProperties,
  },
  [CHAINS.COSMOS_HUB]: {
    id: PresetNetworkId.COSMOS_HUB,
    type: CHAINS.COSMOS_HUB,
    rpcUrl: 'https://rpc-cosmoshub.keplr.app',
    chainId: 'cosmoshub-4',
    ticker: 'ATOM',
    nickname: 'Cosmos Hub',
    rpcPrefs: {
      blockExplorerUrl: 'https://www.mintscan.io/cosmos/',
    },
    chainName: 'COSMOS',
    coinType: CoinType.COSMOS,
    ecosystem: Ecosystem.COSMOS,
    prefix: Bech32Address.defaultBech32Config('cosmos'),
    ecoSystemParams: {
      rest: 'https://lcd-cosmoshub.keplr.app',
      stakeCurrency: {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
      },
      walletUrl:
        process.env.NODE_ENV === 'production'
          ? 'https://wallet.keplr.app/#/cosmoshub/stake'
          : 'http://localhost:8080/#/cosmoshub/stake',
      walletUrlForStaking:
        process.env.NODE_ENV === 'production'
          ? 'https://wallet.keplr.app/#/cosmoshub/stake'
          : 'http://localhost:8080/#/cosmoshub/stake',
      currencies: [
        {
          coinDenom: 'ATOM',
          coinMinimalDenom: 'uatom',
          coinDecimals: 6,
          coinGeckoId: 'cosmos',
        },
      ],
      feeCurrencies: [
        {
          coinDenom: 'ATOM',
          coinMinimalDenom: 'uatom',
          coinDecimals: 6,
          coinGeckoId: 'cosmos',
        },
      ],
      features: ['ibc-transfer', 'ibc-go'],
    },
  },
  /** @TODO might need to remove in the future */
  [CHAINS.OSMOSIS]: {
    id: PresetNetworkId.OSMOSIS,
    type: CHAINS.OSMOSIS,
    rpcUrl: 'https://rpc-osmosis.keplr.app',
    chainId: 'osmosis-1',
    ticker: 'OSMO',
    nickname: 'Osmosis',
    rpcPrefs: {
      blockExplorerUrl: 'https://www.mintscan.io/osmosis/',
    },
    chainName: 'OSMOSIS',
    coinType: CoinType.COSMOS,
    ecosystem: Ecosystem.COSMOS,
    prefix: Bech32Address.defaultBech32Config('osmo'),
    ecoSystemParams: {
      rest: 'https://lcd-osmosis.keplr.app',
      stakeCurrency: {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
      },
      walletUrl:
        process.env.NODE_ENV === 'production'
          ? 'https://app.osmosis.zone'
          : 'https://app.osmosis.zone',
      walletUrlForStaking:
        process.env.NODE_ENV === 'production'
          ? 'https://wallet.keplr.app/#/osmosis/stake'
          : 'http://localhost:8080/#/osmosis/stake',
      currencies: [
        {
          coinDenom: 'OSMO',
          coinMinimalDenom: 'uosmo',
          coinDecimals: 6,
          coinGeckoId: 'osmosis',
        },
        {
          coinDenom: 'ION',
          coinMinimalDenom: 'uion',
          coinDecimals: 6,
          coinGeckoId: 'ion',
        },
      ],
      feeCurrencies: [
        {
          coinDenom: 'OSMO',
          coinMinimalDenom: 'uosmo',
          coinDecimals: 6,
          coinGeckoId: 'osmosis',
        },
      ],
      gasPriceStep: {
        low: 0,
        average: 0.025,
        high: 0.04,
      },
      features: ['ibc-transfer', 'ibc-go', 'cosmwasm'],
    },
  },
  [CHAINS.SECRET_NETWORK]: {
    id: PresetNetworkId.SECRET_NETWORK,
    type: CHAINS.SECRET_NETWORK,
    rpcUrl: 'https://rpc-secret.keplr.app',
    chainId: 'secret-4',
    ticker: 'SCRT',
    nickname: 'Secret Network',
    rpcPrefs: {
      // did not see any scan for secret network
      //   blockExplorerUrl: 'https://www.mintscan.io/cosmos/',
    },
    chainName: 'SECRET',
    coinType: CoinType.SECRET_NETWORK,
    ecosystem: Ecosystem.COSMOS,
    prefix: Bech32Address.defaultBech32Config('secret'),
    ecoSystemParams: {
      rest: 'https://lcd-secret.keplr.app',
      stakeCurrency: {
        coinDenom: 'SCRT',
        coinMinimalDenom: 'uscrt',
        coinDecimals: 6,
        coinGeckoId: 'secret',
      },
      walletUrl:
        process.env.NODE_ENV === 'production'
          ? 'https://wallet.keplr.app/#/secret/stake'
          : 'http://localhost:8080/#/secret/stake',
      walletUrlForStaking:
        process.env.NODE_ENV === 'production'
          ? 'https://wallet.keplr.app/#/secret/stake'
          : 'http://localhost:8080/#/secret/stake',
      alternativeBIP44s: [
        {
          coinType: 118,
        },
      ],
      currencies: [
        {
          coinDenom: 'SCRT',
          coinMinimalDenom: 'uscrt',
          coinDecimals: 6,
          coinGeckoId: 'secret',
        },
      ],
      feeCurrencies: [
        {
          coinDenom: 'SCRT',
          coinMinimalDenom: 'uscrt',
          coinDecimals: 6,
          coinGeckoId: 'secret',
        },
      ],
      gasPriceStep: {
        low: 0.0125,
        average: 0.1,
        high: 0.25,
      },
      features: ['secretwasm', 'ibc-go', 'ibc-transfer'],
    },
  },
};

export const getDefaultNetworkIdsByEcoSystem = (ec: Ecosystem) =>
  Object.values(defaultNetworks)
    .filter((n) => n.ecosystem === ec)
    .map((n) => n.id);
