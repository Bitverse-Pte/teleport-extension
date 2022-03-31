import type { Chain } from 'types/chain';
import IconEthLogo from 'assets/create.svg';
import IconEthWhiteLogo from 'assets/create.svg';
import IconEN from 'assets/create.svg';
import IconZH from 'assets/create.svg';

export enum CHAINS_ENUM {
  ETH = 'ETH',
  BSC = 'BSC',
  DAI = 'DAI',
  HECO = 'HECO',
  POLYGON = 'POLYGON',
  FTM = 'FTM',
  OKT = 'OKT',
  ARBITRUM = 'ARBITRUM',
  AVAX = 'AVAX',
  OP = 'OP',
  CELO = 'CELO',
}

export const CHAINS: Record<string, Chain> = {
  [CHAINS_ENUM.ETH]: {
    id: 1,
    serverId: 'eth',
    name: 'Ethereum',
    hex: '0x1',
    enum: CHAINS_ENUM.ETH,
    logo: IconEthLogo,
    whiteLogo: IconEthWhiteLogo,
    network: '1',
    nativeTokenSymbol: 'ETH',
    nativeTokenLogo:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    nativeTokenAddress: 'eth',
    scanLink: 'https://etherscan.io/tx/_s_',
  },
};

export const KEYRING_TYPE = {
  HdKeyring: 'HD Key Tree',
  SimpleKeyring: 'Simple Key Pair',
  HardwareKeyring: 'hardware',
  WatchAddressKeyring: 'Watch Address',
};

export const KEYRING_TYPE_TEXT = {
  [KEYRING_TYPE.HdKeyring]: 'Created by Mnemonic',
  [KEYRING_TYPE.SimpleKeyring]: 'Imported by Private Key',
  [KEYRING_TYPE.HardwareKeyring]: 'Hardware Wallet',
  [KEYRING_TYPE.WatchAddressKeyring]: 'Watch Mode',
};

export const KEYRING_CLASS = {
  PRIVATE_KEY: 'Simple Key Pair',
  MNEMONIC: 'HD Key Tree',
  WATCH: 'Watch Address',
};

export const HARDWARE_KEYRING_TYPES = {
  Ledger: {
    type: 'Ledger Hardware',
    brandName: 'Ledger',
  },
  Trezor: {
    type: 'Trezor Hardware',
    brandName: 'Trezor',
  },
  Onekey: {
    type: 'Onekey Hardware',
    brandName: 'Onekey',
  },
};

export enum TX_TYPE_ENUM {
  SEND = 1,
  APPROVE = 2,
  CANCEL_APPROVE = 3,
  CANCEL_TX = 4,
  SIGN_TX = 5,
}

export const IS_CHROME = /Chrome\//i.test(navigator.userAgent);

export const IS_FIREFOX = /Firefox\//i.test(navigator.userAgent);

export const IS_LINUX = /linux/i.test(navigator.userAgent);

let chromeVersion: number | null = null;

if (IS_CHROME) {
  const matches = navigator.userAgent.match(/Chrome\/(\d+[^.\s])/);
  if (matches && matches.length >= 2) {
    chromeVersion = Number(matches[1]);
  }
}

export const IS_AFTER_CHROME91 = IS_CHROME
  ? chromeVersion && chromeVersion >= 91
  : false;

export const GAS_LEVEL_TEXT = {
  slow: 'Standard',
  normal: 'Fast',
  fast: 'Instant',
  custom: 'Custom',
};

export const IS_WINDOWS = /windows/i.test(navigator.userAgent);

export const LANGS = [
  {
    value: 'en',
    label: 'English',
    icon: IconEN,
  },
  {
    value: 'zh_CN',
    label: '中文',
    icon: IconZH,
  },
];

export const CHECK_METAMASK_INSTALLED_URL = {
  Chrome: 'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/phishing.html',
  Firefox: '',
  Brave: '',
  Edge: '',
};

export const SAFE_RPC_METHODS = [
  'eth_blockNumber',
  'eth_call',
  'eth_chainId',
  'eth_coinbase',
  'eth_decrypt',
  'eth_estimateGas',
  'eth_gasPrice',
  'eth_getBalance',
  'eth_getBlockByHash',
  'eth_getBlockByNumber',
  'eth_getBlockTransactionCountByHash',
  'eth_getBlockTransactionCountByNumber',
  'eth_getCode',
  'eth_getEncryptionPublicKey',
  'eth_getFilterChanges',
  'eth_getFilterLogs',
  'eth_getLogs',
  'eth_getProof',
  'eth_getStorageAt',
  'eth_getTransactionByBlockHashAndIndex',
  'eth_getTransactionByBlockNumberAndIndex',
  'eth_getTransactionByHash',
  'eth_getTransactionCount',
  'eth_getTransactionReceipt',
  'eth_getUncleByBlockHashAndIndex',
  'eth_getUncleByBlockNumberAndIndex',
  'eth_getUncleCountByBlockHash',
  'eth_getUncleCountByBlockNumber',
  'eth_getWork',
  'eth_hashrate',
  'eth_mining',
  'eth_newBlockFilter',
  'eth_newFilter',
  'eth_newPendingTransactionFilter',
  'eth_protocolVersion',
  'eth_sendRawTransaction',
  'eth_sendTransaction',
  'eth_submitHashrate',
  'eth_submitWork',
  'eth_syncing',
  'eth_uninstallFilter',
  'wallet_requestPermissions',
  'wallet_getPermissions',
];

export const MINIMUM_GAS_LIMIT = 21000;

export enum WATH_ADDRESS_BRAND {
  TP = 'TP',
  IMTOKEN = 'IMTOKEN',
  TRUSTWALLET = 'TRUSTWALLET',
  MATHWALLET = 'MATHWALLET',
}

export enum WATCH_ADDRESS_TYPES {
  TP = 'TP',
  IMTOKEN = 'IMTOKEN',
  TRUSTWALLET = 'TRUSTWALLET',
  MATHWALLET = 'MATHWALLET',
}

export enum WATCH_ADDRESS_CONNECT_TYPE {
  WalletConnect = 'WalletConnect',
}

export const WATCH_ADDRESS_TYPE_CONTENT = {
  [WATCH_ADDRESS_TYPES.TP]: {
    id: 0,
    name: 'TokenPocket',
    brand: WATH_ADDRESS_BRAND.TP,
    icon: './images/brand-logos/icon-tp.png',
    connectType: WATCH_ADDRESS_CONNECT_TYPE.WalletConnect,
  },
  [WATCH_ADDRESS_TYPES.IMTOKEN]: {
    id: 1,
    name: 'ImToken',
    brand: WATH_ADDRESS_BRAND.IMTOKEN,
    icon: './images/brand-logos/icon-imtoken.png',
    connectType: WATCH_ADDRESS_CONNECT_TYPE.WalletConnect,
  },
  // [WATCH_ADDRESS_TYPES.TRUSTWALLET]: {
  //   id: 2,
  //   name: 'Trust Wallet',
  //   brand: WATH_ADDRESS_BRAND.TRUSTWALLET,
  //   icon: './images/brand-logos/icon-trustwallet.png',
  //   connectType: WATCH_ADDRESS_CONNECT_TYPE.WalletConnect,
  // }, disable TrustWallet since walletconnect of TW is white-list based
  [WATCH_ADDRESS_TYPES.MATHWALLET]: {
    id: 3,
    name: 'Math Wallet',
    brand: WATH_ADDRESS_BRAND.MATHWALLET,
    icon: './images/brand-logos/icon-mathwallet.png',
    connectType: WATCH_ADDRESS_CONNECT_TYPE.WalletConnect,
  },
};

export const WALLETCONNECT_STATUS_MAP = {
  PENDING: 1,
  CONNECTED: 2,
  WAITING: 3,
  SIBMITTED: 4,
  REJECTED: 5,
  FAILD: 6,
};

export const INTERNAL_REQUEST_ORIGIN = 'https://teleport.network';

export const EVENTS = {
  broadcastToUI: 'broadcastToUI',
  broadcastToBackground: 'broadcastToBackground',
  SIGN_FINISHED: 'SIGN_FINISHED',
  WALLETCONNECT: {
    STATUS_CHANGED: 'WALLETCONNECT_STATUS_CHANGED',
    INIT: 'WALLETCONNECT_INIT',
    INITED: 'WALLETCONNECT_INITED',
  },
};

export enum ACCOUNT_CREATE_TYPE {
  CREATE = 0,
  IMPORT,
}

export enum ACCOUNT_IMPORT_TYPE {
  MNEMONIC = 0,
  PRIVATE_KEY,
}

export const MIN_PASSWORD_LENGTH = 8;
