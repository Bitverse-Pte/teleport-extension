import { CoinType, Provider } from 'types/network';
import { CHAINS } from './chain';

export enum PresetNetworkId {
  MAINNET = 'mainnet',
  POLYGON = 'polygon',
  ARBITRUM = 'arbitrum',
  BSC = 'bsc',
}

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
    id: PresetNetworkId.MAINNET,
    type: 'mainnet',
    category: 'ETH',
    chainName: 'ETH',
    isEthereumCompatible: true,
    coinType: CoinType.ETH,
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
  //     category: 'ETH',
  //     chainName: 'ETH',
  //     isEthereumCompatible: true,
  //     coinType: CoinType.ETH,
  // },
  // [CHAINS.RINKEBY]: {
  //     rpcUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  //     chainId: '0x4',
  //     ticker: 'ETH',
  //     nickname: 'Rinkeby Testnet',
  //     category: 'ETH',
  //     id: 'rinkeby',
  //     type: 'rinkeby',
  //     rpcPrefs: {
  //         blockExplorerUrl: 'https://rinkeby.etherscan.io'
  //     },
  //     chainName: 'ETH',
  //     isEthereumCompatible: true,
  //     coinType: CoinType.ETH,
  // },
  // [CHAINS.KOVAN]: {
  //     rpcUrl: `https://kovan.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  //     chainId: '0x2a',
  //     ticker: 'ETH',
  //     nickname: 'Kovan Testnet',
  //     category: 'ETH',
  //     id: 'kovan',
  //     type: 'kovan',
  //     rpcPrefs: {
  //         blockExplorerUrl: 'https://kovan.etherscan.io'
  //     },
  //     chainName: 'ETH',
  //     isEthereumCompatible: true,
  //     coinType: CoinType.ETH,
  // },
  // [CHAINS.GOERLI]: {
  //     rpcUrl: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
  //     chainId: '0x5',
  //     ticker: 'ETH',
  //     category: 'ETH',
  //     id: 'goerli',
  //     type: 'goerli',
  //     nickname: 'Goerli Testnet',
  //     rpcPrefs: {
  //         blockExplorerUrl: 'https://goerli.etherscan.io'
  //     },
  //     chainName: 'ETH',
  //     isEthereumCompatible: true,
  //     coinType: CoinType.ETH,
  // },
  [CHAINS.BSC]: {
    id: PresetNetworkId.BSC,
    type: CHAINS.BSC,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    chainId: '0x38',
    ticker: 'BNB',
    category: 'BSC',
    nickname: 'Binance SmartChain',
    rpcPrefs: {
      blockExplorerUrl: 'https://bscscan.com',
    },
    chainName: 'ETH',
    isEthereumCompatible: true,
    coinType: CoinType.ETH,
  },
  [CHAINS.ARBITRUM]: {
    id: PresetNetworkId.ARBITRUM,
    type: CHAINS.ARBITRUM,
    // rpcUrl: 'https://arb1.arbitrum.io/rpc',
    // chainId: '0xa4b1',
    rpcUrl: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    chainId: '0x3',
    ticker: 'ETH',
    category: 'ARBITRUM',
    nickname: 'Arbitrum',
    rpcPrefs: {
      // blockExplorerUrl: 'https://arbiscan.io/'
      blockExplorerUrl: 'https://ropsten.etherscan.io',
    },
    chainName: 'ETH',
    isEthereumCompatible: true,
    coinType: CoinType.ETH,
  },
  [CHAINS.POLYGON]: {
    id: PresetNetworkId.POLYGON,
    type: CHAINS.POLYGON,
    // rpcUrl: 'https://rpc-mainnet.maticvigil.com',
    // chainId: '0x89',
    rpcUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    chainId: '0x4',
    ticker: 'MATIC',
    category: 'POLYGON',
    nickname: 'Polygon Mainnet',
    rpcPrefs: {
      // blockExplorerUrl: 'https://polygonscan.com'
      blockExplorerUrl: 'https://rinkeby.etherscan.io',
    },
    chainName: 'ETH',
    isEthereumCompatible: true,
    coinType: CoinType.ETH,
  },
};
