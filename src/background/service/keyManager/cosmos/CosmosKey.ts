import * as Base from 'types/keyBase';
import * as Tx from 'ethereumjs-tx';
import * as ethUtil from 'ethereumjs-util';
import * as bip39 from 'bip39';
import Wallet from 'ethereumjs-wallet';
const bip32 = require("bip32");

export class CosmosKey extends Base.KeyBase<Tx.Transaction> {
  public generateWalletFromMnemonic(
    mnemonic: string,
    hdPath: Base.Bip44HdPath,
    password?: string,
    addressPrefix?: string,
  ): Pick<Base.KeyPair, 'privateKey' | 'publicKey' | 'address'> {
    const seed = bip39.mnemonicToSeedSync(mnemonic, password);
    const { coinType, account, change, addressIndex } = hdPath;
    const hdPathStr = `m/44'/${coinType}'/${account}'/${change}`;
    const masterSeed = bip32.fromSeed(seed);
    const hd = masterSeed.derivePath(hdPathStr);

    const privateKey = hd.privateKey;
    if (!privateKey) {
      throw new Error("null hd key");
    }

    const keyPair: Pick<Base.KeyPair, 'privateKey' | 'publicKey' | 'address'> =
      {
        privateKey: '',
        publicKey:'',
        address: '',
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

  public generateSignature(stdTx: Tx.Transaction, privateKey: string): string {
    throw new Error('Method not implemented.');
  }

  public signTx(stdTx: Tx.Transaction, privateKey: string): any {
    const privateKeyBuf = Buffer.from(
      ethUtil.stripHexPrefix(privateKey),
      'hex'
    );
    return stdTx.sign(privateKeyBuf);
  }

 
}
