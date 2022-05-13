import * as Base from 'types/keyBase';
import * as Tx from 'ethereumjs-tx';
import * as ethUtil from 'ethereumjs-util';
import * as bip39 from 'bip39';
import { fromSeed } from 'bip32';
import { ec } from 'elliptic';
import crypto from 'crypto-js';
import { toWords, encode } from 'bech32';

export class CosmosKey extends Base.KeyBase<Tx.Transaction> {
  public generateWalletFromMnemonic(
    mnemonic: string,
    hdPath: Base.Bip44HdPath,
    password?: string,
    addressPrefix?: string
  ): Pick<Base.KeyPair, 'privateKey' | 'publicKey' | 'address'> {
    const seed = bip39.mnemonicToSeedSync(mnemonic, password);
    const { coinType, account, change, addressIndex } = hdPath;
    const hdPathStr = `m/44'/${coinType}'/${account}'/${change}/${addressIndex}`;
    const masterSeed = fromSeed(seed);
    const hd = masterSeed.derivePath(hdPathStr);
    const privateKey = hd.privateKey;

    if (!privateKey) {
      throw new Error('null hd key');
    }

    return this.generateWalletFromPrivateKey(privateKey, addressPrefix);
  }

  public generateWalletFromPrivateKey(
    privateKey: string | Buffer,
    addressPrefix?: string
  ): Pick<Base.KeyPair, 'privateKey' | 'publicKey' | 'address'> {
    let privKey = privateKey;
    if (typeof privKey === 'string') {
      const stripped = ethUtil.stripHexPrefix(privateKey as string);
      privKey = Buffer.from(stripped, 'hex');
    }

    const secp256k1 = new ec('secp256k1');
    const key = secp256k1.keyFromPrivate(privKey as Buffer);

    const publicKey = Buffer.from(key.getPublic().encodeCompressed('array'));
    const sha256Hash = crypto
      .SHA256(crypto.lib.WordArray.create(publicKey))
      .toString();
    const ripemd160Hahsh = crypto
      .RIPEMD160(crypto.enc.Hex.parse(sha256Hash))
      .toString();
    const addressRaw = Buffer.from(ripemd160Hahsh, 'hex');
    const words = toWords(addressRaw);
    const address = encode(addressPrefix as string, words);
    const keyPair: Pick<Base.KeyPair, 'privateKey' | 'publicKey' | 'address'> =
      {
        privateKey: privateKey.toString('hex'),
        publicKey: publicKey.toString('hex'),
        address,
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
