import { CoinType, Ecosystem, Provider } from 'types/network';
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
};

export const getDefaultNetworkIdsByEcoSystem = (ec: Ecosystem) =>
  Object.values(defaultNetworks)
    .filter((n) => n.ecosystem === ec)
    .map((n) => n.id);
