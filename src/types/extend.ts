import { SignatureAlgorithm } from 'types/keyBase';
import { CoinType } from 'types/network';

export enum AccountCreateType {
  MNEMONIC = 'mnemonic',
  PRIVATE_KEY = 'privateKey',
  KEYSTORE = 'keystore',
}

export enum HomeTabType {
  ASSETS = 0,
  ACTIVITY,
}
export interface BaseAccount {
  address: string;
  coinType: CoinType;
  publicKey: string;
  hdPathCoinType: number;
  hdPathAccount: number;
  hdPathChange: number;
  hdPathIndex: number;
  hdWalletName: string;
  hdWalletId: string;
  accountName: string;
  isCompatibleEthereum: boolean;
  countOfPhrase: number;
  signatureAlgorithm: SignatureAlgorithm;
  accountCreateType: AccountCreateType;
  deletedHdPathIndex?: number[];
}

export interface Secret {
  privateKey: string; // hex
  mnemonic: string;
  address: string;
  hdWalletId: string;
}

export interface CreateAccountOpts {
  name: string;
  mnemonic?: string;
  password?: string;
}

export interface ImportAccountOpts {
  name: string;
  privateKey: string;
  coinType: CoinType;
  password?: string;
}

export interface HdAccountStruct {
  hdWalletId: string;
  hdWalletName: string;
  accounts: BaseAccount[];
}

export interface DisplayWalletManage {
  hdAccount: HdAccountStruct[];
  simpleAccount: BaseAccount[];
}

export interface DisplayAccountManage {
  accountName: string;
  hdPathIndex: number;
  accounts: BaseAccount[];
}
