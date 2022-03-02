import { CoinType, EcoSystem, Provider } from 'types/network';
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
  ecsystem: EcoSystem.EVM,
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
  // [CHAINS.ROPSTEN]: {
  //     rpcUrl: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  //     chainId: '0x3',
  //     ticker: 'ETH',
  //     nickname: 'Ropsten Testnet',
  //     rpcPrefs: {
  //         blockExplorerUrl: 'https://ropsten.etherscan.io'
  //     },
  //     id: 'ropsten',
  //     type: 'ropsten',
  //     ...ETHSharedProperties
  // },
  // [CHAINS.RINKEBY]: {
  //     rpcUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  //     chainId: '0x4',
  //     ticker: 'ETH',
  //     nickname: 'Rinkeby Testnet',
  //     id: 'rinkeby',
  //     type: 'rinkeby',
  //     rpcPrefs: {
  //         blockExplorerUrl: 'https://rinkeby.etherscan.io'
  //     },
  //     chainName: 'ETH',
  //     coinType: CoinType.ETH,
  //     ...ETHSharedProperties
  // },
  // [CHAINS.KOVAN]: {
  //     rpcUrl: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  //     chainId: '0x2a',
  //     ticker: 'ETH',
  //     nickname: 'Kovan Testnet',
  //     id: 'kovan',
  //     type: 'kovan',
  //     rpcPrefs: {
  //         blockExplorerUrl: 'https://kovan.etherscan.io'
  //     },
  //     chainName: 'ETH',
  //     coinType: CoinType.ETH,
  //     ...ETHSharedProperties
  // },
  // [CHAINS.GOERLI]: {
  //     rpcUrl: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  //     chainId: '0x5',
  //     ticker: 'ETH',
  //     id: 'goerli',
  //     type: 'goerli',
  //     nickname: 'Goerli Testnet',
  //     rpcPrefs: {
  //         blockExplorerUrl: 'https://goerli.etherscan.io'
  //     },
  //     chainName: 'ETH',
  //     coinType: CoinType.ETH,
  //     ...ETHSharedProperties
  // },
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
    // rpcUrl: 'https://arb1.arbitrum.io/rpc',
    // chainId: '0xa4b1',
    rpcUrl: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    chainId: '0x3',
    ticker: 'ETH',
    nickname: 'Arbitrum',
    rpcPrefs: {
      // blockExplorerUrl: 'https://arbiscan.io/'
      blockExplorerUrl: 'https://ropsten.etherscan.io',
    },
    ...EVMProviderSharedProperties,
  },
  [CHAINS.POLYGON]: {
    id: PresetNetworkId.POLYGON,
    type: CHAINS.POLYGON,
    // rpcUrl: 'https://rpc-mainnet.maticvigil.com',
    // chainId: '0x89',
    rpcUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    chainId: '0x4',
    ticker: 'MATIC',
    nickname: 'Polygon Mainnet',
    rpcPrefs: {
      // blockExplorerUrl: 'https://polygonscan.com'
      blockExplorerUrl: 'https://rinkeby.etherscan.io',
    },
    ...EVMProviderSharedProperties,
  },
};
