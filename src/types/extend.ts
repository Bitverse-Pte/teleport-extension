import { PresetNetworkId } from 'constants/defaultNetwork';
import { SignatureAlgorithm } from 'types/keyBase';
import { CoinType, Ecosystem, Provider } from 'types/network';

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
  countOfPhrase?: number;
  signatureAlgorithm: SignatureAlgorithm;
  accountCreateType: AccountCreateType;
  deletedHdPathIndex?: number[];
  // add field after v0.3.0
  chainCustomId: PresetNetworkId | string;
  ecosystem: Ecosystem;
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
  chains: Provider[];
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

export interface CompareAccountsForCompatible {
  hdWalletId: string;
  hdWalletName: string;
  mnemonic?: string;
  privateKey?: string;
  accountCreateType: AccountCreateType;
  accounts?: {
    hdPathIndex: number;
    accountName: string;
  }[];
  chains: Provider[];
}
