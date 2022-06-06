import * as Base from 'types/keyBase';
import * as Tx from 'ethereumjs-tx';
import * as ethUtil from 'ethereumjs-util';
import * as sigUtil from 'eth-sig-util';
import * as bip39 from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import Wallet from 'ethereumjs-wallet';
import { CoinType } from 'types/network';

export class EthKey extends Base.KeyBase<Tx.Transaction> {
  public generateWalletFromMnemonic(
    mnemonic: string,
    hdPath: Base.Bip44HdPath,
    password?: string
  ): Pick<Base.KeyPair, 'privateKey' | 'publicKey' | 'address'> {
    const seed = bip39.mnemonicToSeedSync(mnemonic, password);
    const masterKey = hdkey.fromMasterSeed(seed);
    const { account, change, addressIndex } = hdPath;
    const hdPathStr = `m/44'/${CoinType.ETH}'/${account}'/${change}`;
    const master = masterKey.derivePath(hdPathStr);
    const child = master.deriveChild(addressIndex);
    const wallet = child.getWallet();
    const keyPair: Pick<Base.KeyPair, 'privateKey' | 'publicKey' | 'address'> =
      {
        privateKey: ethUtil.bufferToHex(wallet.getPrivateKey()),
        publicKey: ethUtil.bufferToHex(wallet.getPublicKey()),
        address: ethUtil.bufferToHex(wallet.getAddress()),
      };
    return keyPair;
  }

  public generateWalletFromPrivateKey(
    privateKey: string
  ): Pick<Base.KeyPair, 'privateKey' | 'publicKey' | 'address'> {
    const stripped = ethUtil.stripHexPrefix(privateKey);
    const buffer = Buffer.from(stripped, 'hex');
    const wallet: any = Wallet.fromPrivateKey(buffer);
    const keyPair: Pick<Base.KeyPair, 'privateKey' | 'publicKey' | 'address'> =
      {
        privateKey: ethUtil.bufferToHex(wallet.getPrivateKey()),
        publicKey: ethUtil.bufferToHex(wallet.getPublicKey()),
        address: ethUtil.bufferToHex(wallet.getAddress()),
      };
    return keyPair;
  }

  public generateSignature(stdTx: any, privateKey: string | Buffer): Buffer {
    throw new Error('Method not implemented.');
  }

  public signTx(stdTx: Tx.Transaction, privateKey: string): any {
    const privateKeyBuf = Buffer.from(
      ethUtil.stripHexPrefix(privateKey),
      'hex'
    );
    return stdTx.sign(privateKeyBuf);
  }

  // sign arbitrary data
  public static signMessage(privateKey: string, msg: string): any {
    const message = ethUtil.stripHexPrefix(msg);
    const msgSig = ethUtil.ecsign(
      Buffer.from(message, 'hex'),
      Buffer.from(ethUtil.stripHexPrefix(privateKey), 'hex')
    );
    return sigUtil.concatSig(<any>msgSig.v, msgSig.r, msgSig.s);
  }

  // sign geth node transactions:
  public static newGethSignMessage(privateKey: string, msg: string): any {
    const msgBuffer = ethUtil.toBuffer(msg);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const msgSig = ethUtil.ecsign(
      msgHash,
      Buffer.from(ethUtil.stripHexPrefix(privateKey), 'hex')
    );
    return sigUtil.concatSig(<any>msgSig.v, msgSig.r, msgSig.s);
  }

  // For personal_sign, we need to prefix the message:
  public static signPersonalMessage(privateKey: string, msg: any): any {
    return sigUtil.personalSign(
      Buffer.from(ethUtil.stripHexPrefix(privateKey), 'hex'),
      { data: msg }
    );
  }

  // decrypt message crypt by public key
  public static decryptMessage(privateKey, encryptedData): any {
    //const privKey = ethUtil.stripHexPrefix(privateKey)
    return sigUtil.decrypt(encryptedData, privateKey);
  }

  // personal_signTypedData, signs data along with the schema
  public static signTypedData(
    privateKey: string,
    typedData,
    opts = { version: 'V1' }
  ): string {
    switch (opts.version) {
      case 'V1':
        return EthKey.signTypedData_v1(privateKey, typedData);
      case 'V3':
        return EthKey.signTypedData_v3(privateKey, typedData);
      case 'V4':
        return EthKey.signTypedData_v4(privateKey, typedData);
      default:
        return EthKey.signTypedData_v1(privateKey, typedData);
    }
  }

  // personal_signTypedData, signs data along with the schema
  public static signTypedData_v1(privateKey: string, typedData): string {
    return sigUtil.signTypedDataLegacy(
      Buffer.from(ethUtil.stripHexPrefix(privateKey), 'hex'),
      { data: typedData }
    );
  }

  // personal_signTypedData, signs data along with the schema
  public static signTypedData_v3(privateKey: string, typedData): string {
    return sigUtil.signTypedData(
      Buffer.from(ethUtil.stripHexPrefix(privateKey), 'hex'),
      { data: typedData }
    );
  }

  // personal_signTypedData, signs data along with the schema
  public static signTypedData_v4(privateKey: string, typedData): string {
    return sigUtil.signTypedData_v4(
      Buffer.from(ethUtil.stripHexPrefix(privateKey), 'hex'),
      { data: typedData }
    );
  }

  // get public key for nacl
  public static getEncryptionPublicKey(privateKey: string): string {
    return sigUtil.getEncryptionPublicKey(ethUtil.stripHexPrefix(privateKey));
  }
}
