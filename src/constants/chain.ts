import {
  ROPSTEN_RPC_URL,
  RINKEBY_RPC_URL,
  KOVAN_RPC_URL,
  MAINNET_RPC_URL,
  GOERLI_RPC_URL,
} from './network';

export enum CHAINS {
  ETH = 'ethereum',
  KOVAN = 'kovan',
  RINKEBY = 'rinkeby',
  ROPSTEN = 'ropsten',
  GOERLI = 'goerli',
  BSC = 'BSC',
  DAI = 'DAI',
  HECO = 'HECO',
  POLYGON = 'POLYGON',
  FTM = 'FANTOM',
  OKT = 'OKT',
  ARBITRUM = 'ARBITRUM',
  AVAX = 'AVAX',
  OP = 'OP',
  CELO = 'CELO',
  KLAY = 'KLAY',

  COSMOS_HUB = 'COSMOS_HUB',
  OSMOSIS = 'OSMOSIS',
  SECRET_NETWORK = 'SECRET_NETWORK',

  KAVA = 'KAVA',
  CRYPTO_ORG = 'CRYPTO_ORG',
  UMEE = 'UMEE',
  EVMOS = 'EVMOS',
  JUNO = 'JUNO',
}

export const CHAIN_TO_RPC_URL_MAP = {
  [CHAINS.ETH]: MAINNET_RPC_URL,
  [CHAINS.KOVAN]: KOVAN_RPC_URL,
  [CHAINS.RINKEBY]: RINKEBY_RPC_URL,
  [CHAINS.ROPSTEN]: ROPSTEN_RPC_URL,
  [CHAINS.GOERLI]: GOERLI_RPC_URL,
};

export const TOKEN_STORE_KEY = 'token';
