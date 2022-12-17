import { CoinType, Ecosystem } from 'types/network';

export const MIN_PASSWORD_LENGTH = 8;

export const POLICY_AGREED = 'policy_agreed';

export const WALLET_THEME_COLOR: string[] = [
  '#56FAA5',
  '#FFFFFF',
  '#FFA014',
  '#1BD6AA',
  '#865CFF',
];

export enum TOKEN_MANAGE_TAB {
  SEARCH = 1,
  CUSTOMIZE,
}

export enum Tabs {
  FIRST = 0,
  SECOND,
}

export enum TipButtonEnum {
  SEND = 0,
  RECEIVE,
  WALLET_MANAGE,
  LOCK,
}

export enum MnemonicCount {
  WORDS_12 = 'words_12',
  WORDS_15 = 'words_15',
  WORDS_18 = 'words_18',
  WORDS_21 = 'words_21',
  WORDS_24 = 'words_24',
}

export const MnemonicCountList = [
  {
    type: MnemonicCount.WORDS_12,
    count: 12,
  },

  {
    type: MnemonicCount.WORDS_15,
    count: 15,
  },
  {
    type: MnemonicCount.WORDS_18,
    count: 18,
  },
  {
    type: MnemonicCount.WORDS_21,
    count: 21,
  },
  {
    type: MnemonicCount.WORDS_24,
    count: 24,
  },
];

export const ecosystemMapping: {
  [key in keyof typeof Ecosystem]: {
    ecosystemName: string;
  };
} = {
  [Ecosystem.EVM]: {
    ecosystemName: 'EVM Networks',
  },
  [Ecosystem.COSMOS]: {
    ecosystemName: 'Cosmos Networks',
  },
  [Ecosystem.POLKADOT]: {
    ecosystemName: 'Polkadot Networks',
  },
};
