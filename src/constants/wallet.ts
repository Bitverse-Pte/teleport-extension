import { CoinType, Ecosystem } from 'types/network';

export const MIN_PASSWORD_LENGTH = 8;

export const POLICY_AGREED = 'policy_agreed';

export const WALLET_THEME_COLOR: string[] = [
  '#0F83FF',
  '#FFA800',
  '#57CC75',
  '#E33376',
  '#000000',
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
