import { CoinType, Ecosystem, Provider } from 'types/network';
import { CHAINS } from './chain';

export enum PresetNetworkId {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  BSC = 'bsc',
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
    nickname: 'Binance SmartChain',
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
    nickname: 'Arbitrum',
    rpcPrefs: {
      blockExplorerUrl: 'https://arbiscan.io/'
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
      blockExplorerUrl: 'https://polygonscan.com'
    },
    ...EVMProviderSharedProperties,
  },
};
