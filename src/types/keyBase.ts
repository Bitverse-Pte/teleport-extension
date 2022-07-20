import * as bip39 from 'bip39';

export abstract class KeyBase<T> {
  public static generateMnemonic(strength = 128): string {
    return bip39.generateMnemonic(strength);
  }

  public abstract generateWalletFromMnemonic(
    mnemonic: string,
    hdPath: Bip44HdPath,
    password?: string,
    addressPrefix?: string
  ): Pick<KeyPair, 'privateKey' | 'publicKey' | 'address'>;

  public abstract generateWalletFromPrivateKey(
    privateKey: string | Buffer,
    addressPrefix?: string
  ): Pick<KeyPair, 'privateKey' | 'publicKey' | 'address'>;

  public abstract generateSignature(
    msg: T,
    privateKey: string | Buffer
  ): Buffer | Promise<Buffer>;

  public abstract signTx(stdTx: T, privateKey: string | Buffer): any;
}

export interface KeyPair {
  privateKey: string;
  publicKey: string;
  publicKeyCompressed?: string;
  address: string;
  mnemonic?: string;
}

export interface Bip44HdPath {
  coinType?: number;
  account: number;
  change: number;
  addressIndex: number;
}

export enum SignatureAlgorithm {
  secp256k1 = 0,
  ed25519,
  sm2,
}

export interface KeplrGetKeyResponseInterface {
  name: string;
  algo: string;
  pubKey: Buffer | Uint8Array;
  address: Buffer | Uint8Array;
  bech32Address: string;
  isNanoLedger: boolean;
}
