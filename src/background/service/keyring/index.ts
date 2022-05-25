import { EventEmitter } from 'events';
import encrypt from 'browser-passworder';
import * as ethUtil from 'ethereumjs-util';
import {
  toBuffer,
  isValidPrivate,
  bufferToHex,
  stripHexPrefix,
} from 'ethereumjs-util';
import * as bip39 from 'bip39';
import { ObservableStore } from '@metamask/obs-store';
import preference from '../preference';
import {
  AccountCreateType,
  BaseAccount,
  DisplayAccountManage,
  DisplayWalletManage,
  ImportAccountOpts,
  Secret,
} from 'types/extend';
import { networkPreferenceService } from 'background/service';
import BitError from 'error';
import { ErrorCode } from 'constants/code';
import { nanoid } from 'nanoid';
import { EthKey } from '../keyManager/eth/EthKey';
import { CosmosKey } from '../keyManager/cosmos/CosmosKey';
import { Bip44HdPath, KeyPair, SignatureAlgorithm } from 'types/keyBase';
import cloneDeep from 'lodash/cloneDeep';
import { CoinType, Provider } from 'types/network';
import secp256k1_1 from 'ethereum-cryptography/secp256k1';
import { Bech32Config } from 'types/cosmos';
import { PresetNetworkId } from 'constants/defaultNetwork';

export interface IStorageState {
  booted: string;
  account: string | BaseAccount[];
  secret: string | Secret[];
}

export interface ICreateAccountOpts {
  name: string;
  mnemonic: string;
  addressIndex?: number;
  hdWalletId?: string;
  accountName?: string;
}

export interface IAddAccountOpts {
  hdWalletName: string;
  hdWalletId: string;
  accountName: string;
}

class KeyringService extends EventEmitter {
  store!: ObservableStore<IStorageState>;
  password: string | null = null;
  isUnlocked = false;
  accounts: BaseAccount[] = [];
  secrets: Secret[] = [];

  constructor() {
    super();
  }

  /**
   * Get Lock Status
   *
   * @returns {Boolean} whether wallet is locked.
   */
  public getIsUnlocked() {
    return this.isUnlocked;
  }

  /**
   * Create Store
   *
   * Create memory store, and initializing state from storage
   *
   * @param {IStorageState} initState - the initState from storage.
   */
  public loadStore(initState: IStorageState): void {
    this.store = new ObservableStore<IStorageState>(initState);
    this.accounts = initState?.account
      ? JSON.parse(initState.account as string)
      : [];
  }

  /**
   * Encrypt Password
   *
   * Encrypted the password and store it to storage
   *
   */
  public async boot(): Promise<void> {
    const encryptBooted = await encrypt.encrypt(this.password, 'true');
    this.store.updateState({ booted: encryptBooted });
    this._setIsUnlocked(true);
  }

  /**
   * Set Locked Status
   *
   * Set locked status
   *
   * @param {Boolean} isUnlocked - whether the wallet is unlocked.
   */
  private _setIsUnlocked(isUnlocked: boolean): void {
    this.isUnlocked = isUnlocked;
  }

  /**
   * Get Wallet Encrypt Status
   */
  public isBooted() {
    return !!this.store.getState().booted;
  }

  /**
   * Get Secret Status
   *
   * @returns {Boolean} whether the wallet has secrets.
   */
  public hasSecret() {
    return !!this.store.getState().secret;
  }

  /**
   * Set Password
   *
   * @param {String} password - password which will encrypt the wallet
   *
   */
  public setPassword(password?: string): void {
    if (!this.password && password) {
      this.password = password;
    }
  }

  /**
   * Generate Mnemonic
   *
   * Generate a mnemonic by using bip39 libs
   *
   * @param {String} strength - length of entropy
   *
   */
  public generateMnemonic(strength?: number): string {
    return bip39.generateMnemonic(strength);
  }

  /**
   * Checksum Duplicate Of Wallet Name
   *
   * @param {Boolean} name - wallet name
   *
   * @returns {Boolean} whether exists same wallet name.
   */
  private _checkDuplicateHdWalletName(name: string): boolean {
    return this.accounts.some((a: BaseAccount) => a.hdWalletName === name);
  }

  private _checkDuplicatePrivateKeyWalletName(
    name: string,
    chainCustomId: PresetNetworkId | string
  ): boolean {
    return this.accounts.some((a: BaseAccount) => {
      if (a.accountCreateType === AccountCreateType.MNEMONIC) {
        return a.hdWalletName === name;
      } else {
        //there is no `chainCustomId` field on typeof BaseAccount, compatible
        if (a.coinType === CoinType.ETH) {
          return (
            chainCustomId === PresetNetworkId.ETHEREUM &&
            a.hdWalletName === name
          );
        } else {
          return a.chainCustomId === chainCustomId && a.hdWalletName === name;
        }
      }
    });
  }

  private _checkDuplicateAccount(address: string): boolean {
    return this.accounts.some((a: BaseAccount) => a.address === address);
  }

  private _checkDuplicateIndexName(
    indexName: string,
    hdWalletId: string
  ): boolean {
    return this.accounts
      .filter((a: BaseAccount) => a.hdWalletId === hdWalletId)
      .some((a: BaseAccount) => a.accountName === indexName);
  }

  /**
   * Create Account
   *
   * Create account by private key
   *
   * @param {ImportAccountOpts}
   * @returns {Promise<BaseAccount>} A Promise that resolves to the account.
   */
  async createAccountByImportPrivateKey(
    opts: ImportAccountOpts
  ): Promise<BaseAccount> {
    // account or secret must be a transaction, which should be reverted if error occur
    let currentAccount;
    const tempAccounts: BaseAccount[] = [],
      tempSecrets: Secret[] = [];
    for (const chain of opts.chains) {
      // same wallet name can not exist bellow the same chain
      if (this._checkDuplicateHdWalletName(opts.name)) {
        return Promise.reject(new BitError(ErrorCode.WALLET_NAME_REPEAT));
      }
      let keyPair: Pick<KeyPair, 'privateKey' | 'publicKey' | 'address'>;
      let signatureAlgorithm: SignatureAlgorithm;
      const hdWalletId: string = nanoid();
      switch (chain.id) {
        case PresetNetworkId.ETHEREUM:
          keyPair = await this._createEthKeypairByImportPrivateKey(
            opts.privateKey
          );
          if (this._checkDuplicateAccount(keyPair.address)) {
            return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
          }
          signatureAlgorithm = SignatureAlgorithm.secp256k1;
          break;
        case PresetNetworkId.COSMOS_HUB:
        case PresetNetworkId.SECRET_NETWORK:
        case PresetNetworkId.OSMOSIS:
          keyPair = await this._createCosmosKeypairByImportPrivateKey(
            opts.privateKey,
            (chain.prefix as Bech32Config)?.bech32PrefixAccAddr
          );
          if (this._checkDuplicateAccount(keyPair.address)) {
            return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
          }
          signatureAlgorithm = SignatureAlgorithm.secp256k1;
          break;

        default:
          keyPair = await this._createEthKeypairByImportPrivateKey(
            opts.privateKey
          );
          signatureAlgorithm = SignatureAlgorithm.secp256k1;
      }
      const account: BaseAccount = {
        address: keyPair.address,
        //address: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852', for test
        publicKey: keyPair.publicKey,
        coinType: chain.coinType,
        hdPathCoinType: 0,
        hdPathAccount: 0,
        hdPathChange: 0,
        hdPathIndex: 0,
        hdWalletName: opts.name,
        hdWalletId: hdWalletId,
        accountName: '',
        signatureAlgorithm,
        accountCreateType: AccountCreateType.PRIVATE_KEY,
        chainCustomId: chain.id,
      };
      const secret: Secret = {
        privateKey: keyPair.privateKey,
        mnemonic: '',
        address: keyPair.address,
        hdWalletId: hdWalletId,
      };
      tempAccounts.push(account);
      tempSecrets.push(secret);
    }
    const currentChain: Provider = networkPreferenceService.getProviderConfig();
    if (currentChain) {
      currentAccount = tempAccounts.find(
        (c: BaseAccount) => c.chainCustomId === currentChain.id
      );
    }
    this.accounts = [...this.accounts, ...tempAccounts];
    this.secrets = [...this.secrets, ...tempSecrets];

    this.setUnlocked();
    this._persistAllAccount();
    return Promise.resolve(currentAccount);
  }

  /**
   * Create Account
   *
   * Create account by mnemonic
   *
   * @param {ICreateAccountOpts}
   * @returns {Promise<BaseAccount>}
   */
  async createAccount(
    opts: Pick<ICreateAccountOpts, 'name' | 'mnemonic'>
  ): Promise<BaseAccount> {
    const createOpts: Pick<
      ICreateAccountOpts,
      'name' | 'mnemonic' | 'addressIndex'
    > = {
      name: opts.name,
      mnemonic: opts.mnemonic,
      addressIndex: 0,
    };
    return this._createAccountByImportMnemonic(createOpts);
  }

  /**
   * Add Account
   *
   * Add a new address by hd path index
   *
   * @param {IAddAccountOpts}
   * @returns {Promise<Boolean>}
   */
  async addAccount(opts: IAddAccountOpts): Promise<boolean> {
    const currentHdWalletSecret: Secret[] = this.secrets.filter(
      (a: Secret) => a.hdWalletId === opts.hdWalletId
    );
    const currentHdWalletAccount: BaseAccount[] = this.accounts.filter(
      (a: BaseAccount) => a.hdWalletId === opts.hdWalletId
    );
    if (
      currentHdWalletSecret.length === 0 ||
      currentHdWalletAccount.length === 0
    )
      return Promise.reject(new Error('no account found'));
    const mnemonic: string = currentHdWalletSecret[0].mnemonic;
    currentHdWalletAccount.sort(
      (a: BaseAccount, b: BaseAccount) => b.hdPathIndex - a.hdPathIndex
    );
    const maxIndex = currentHdWalletAccount[0].hdPathIndex;
    let hdPathIndex = maxIndex;
    if (currentHdWalletAccount[0].deletedHdPathIndex) {
      while (
        currentHdWalletAccount[0].deletedHdPathIndex.includes(hdPathIndex + 1)
      ) {
        hdPathIndex++;
      }
    }
    const createOpts: ICreateAccountOpts = {
      name: opts.hdWalletName,
      mnemonic: mnemonic,
      addressIndex: hdPathIndex + 1,
      accountName: opts.accountName,
    };

    await this._createAccountByImportMnemonic(
      createOpts,
      opts.hdWalletId as string
    );
    return Promise.resolve(true);
  }

  /**
   * Create Account
   *
   * Create an account by importing mnemonic
   *
   * @param {ICreateAccountOpts} opts
   *
   * @param {ICreateAccountOpts} hdWalletId - id that added while wallet create
   *
   * @returns {Promise<BaseAccount>} A Promise that resolves to the account.
   */
  private _createAccountByImportMnemonic(
    opts: ICreateAccountOpts,
    hdWalletId?: string
  ): Promise<BaseAccount> {
    if (!bip39.validateMnemonic(opts.mnemonic)) {
      return Promise.reject(new BitError(ErrorCode.INVALID_MNEMONIC));
    }
    if (!hdWalletId && this._checkDuplicateHdWalletName(opts.name)) {
      return Promise.reject(new BitError(ErrorCode.WALLET_NAME_REPEAT));
    }

    if (
      opts.accountName &&
      hdWalletId &&
      this._checkDuplicateIndexName(opts!.accountName, hdWalletId)
    ) {
      return Promise.reject(new BitError(ErrorCode.WALLET_NAME_REPEAT));
    }

    if (!hdWalletId) {
      hdWalletId = nanoid();
    }
    const supportProviders = networkPreferenceService.getSupportProviders();
    const hdPath: Bip44HdPath = {
      account: 0,
      change: 0,
      addressIndex: opts.addressIndex as number,
    };
    let newDisplayAccount: BaseAccount = {
      address: '',
      coinType: CoinType.ETH,
      publicKey: '',
      hdPathCoinType: 0,
      hdPathAccount: 0,
      hdPathChange: 0,
      hdPathIndex: 0,
      hdWalletName: '',
      hdWalletId: '',
      accountName: '',
      countOfPhrase: 0,
      signatureAlgorithm: SignatureAlgorithm.secp256k1,
      accountCreateType: AccountCreateType.MNEMONIC,
      chainCustomId: '',
    };
    const currentCoinType =
      networkPreferenceService.getProviderConfig().coinType;
    for (const p of supportProviders) {
      let keyPair: Pick<KeyPair, 'privateKey' | 'publicKey' | 'address'>;
      let signatureAlgorithm: SignatureAlgorithm,
        countOfPhrase: number,
        coinType: CoinType,
        hdPathCoinType: number,
        chainCustomId: PresetNetworkId | string;
      switch (p.coinType) {
        case CoinType.ETH:
          keyPair = this._createEthKeypairByMnemonic(opts.mnemonic, hdPath);
          if (this._checkDuplicateAccount(keyPair.address)) {
            return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
          }
          signatureAlgorithm = SignatureAlgorithm.secp256k1;
          countOfPhrase = 12;
          coinType = p.coinType;
          hdPathCoinType = p.coinType;
          chainCustomId = PresetNetworkId.ETHEREUM;
          break;
        case CoinType.COSMOS:
          switch (p.id) {
            case PresetNetworkId.COSMOS_HUB:
            default:
              hdPath.coinType = CoinType.COSMOS;
              keyPair = this._createCosmosKeypairByMnemonic(
                opts.mnemonic,
                hdPath,
                (p.prefix as Bech32Config).bech32PrefixAccAddr
              );
              if (this._checkDuplicateAccount(keyPair.address)) {
                return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
              }
              signatureAlgorithm = SignatureAlgorithm.secp256k1;
              countOfPhrase = 12;
              coinType = p.coinType;
              hdPathCoinType = p.coinType;
              chainCustomId = PresetNetworkId.COSMOS_HUB;
              break;
            case PresetNetworkId.OSMOSIS:
              hdPath.coinType = CoinType.COSMOS;
              keyPair = this._createCosmosKeypairByMnemonic(
                opts.mnemonic,
                hdPath,
                (p.prefix as Bech32Config).bech32PrefixAccAddr
              );
              if (this._checkDuplicateAccount(keyPair.address)) {
                return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
              }
              signatureAlgorithm = SignatureAlgorithm.secp256k1;
              countOfPhrase = 12;
              coinType = p.coinType;
              hdPathCoinType = p.coinType;
              chainCustomId = PresetNetworkId.OSMOSIS;
              break;
          }
          break;
        case CoinType.SECRET_NETWORK:
          hdPath.coinType = CoinType.SECRET_NETWORK;
          keyPair = this._createCosmosKeypairByMnemonic(
            opts.mnemonic,
            hdPath,
            (p.prefix as Bech32Config).bech32PrefixAccAddr
          );
          if (this._checkDuplicateAccount(keyPair.address)) {
            return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
          }
          signatureAlgorithm = SignatureAlgorithm.secp256k1;
          countOfPhrase = 12;
          coinType = p.coinType;
          hdPathCoinType = p.coinType;
          chainCustomId = PresetNetworkId.SECRET_NETWORK;
          break;
        default:
          keyPair = this._createEthKeypairByMnemonic(opts.mnemonic, hdPath);
          if (this._checkDuplicateAccount(keyPair.address)) {
            return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
          }
          signatureAlgorithm = SignatureAlgorithm.secp256k1;
          countOfPhrase = 12;
          coinType = p.coinType;
          hdPathCoinType = p.coinType;
          chainCustomId = PresetNetworkId.ETHEREUM;
      }
      const account: BaseAccount = {
        address: keyPair.address,
        coinType,
        publicKey: keyPair.publicKey,
        hdPathCoinType,
        hdPathAccount: 0,
        hdPathChange: 0,
        hdPathIndex: opts.addressIndex as number,
        hdWalletName: opts.name,
        hdWalletId: hdWalletId as string,
        accountName: opts.accountName || `account ${hdPath.addressIndex + 1}`,
        countOfPhrase,
        signatureAlgorithm,
        accountCreateType: AccountCreateType.MNEMONIC,
        chainCustomId,
      };
      if (coinType === currentCoinType) {
        newDisplayAccount = Object.assign(account, {});
      }
      const secret: Secret = {
        privateKey: keyPair.privateKey,
        mnemonic: opts.mnemonic,
        address: keyPair.address,
        hdWalletId: hdWalletId as string,
      };

      this.accounts.push(account);
      this.secrets.push(secret);
    }
    this.setUnlocked();
    this._persistAllAccount();
    return Promise.resolve(newDisplayAccount);
  }

  /**
   * Persist Account
   *
   * Persist all account to storage
   *
   * @returns {Promise<Boolean>}
   */
  private async _persistAllAccount(): Promise<boolean> {
    if (!this.password) {
      return Promise.reject(new Error('no password found'));
    }
    const encryptedSecret = await encrypt.encrypt(
      this.password as string,
      this.secrets as unknown as Buffer
    );
    this.store.updateState({
      secret: encryptedSecret,
      account: JSON.stringify(this.accounts),
    });
    return Promise.resolve(true);
  }

  /**
   * Create Key Pair
   *
   * Create key pair with private key and public key
   *
   * @param {String} privateKey - private key that can generate public key and address
   *
   * @returns {KeyPair}
   */
  private _createEthKeypairByImportPrivateKey(
    privateKey: string
  ): Promise<KeyPair> {
    try {
      const buffer = toBuffer(privateKey);
      isValidPrivate(buffer);
      return Promise.resolve(
        new EthKey().generateWalletFromPrivateKey(privateKey)
      );
    } catch (e) {
      console.error(e);
      return Promise.reject(new BitError(ErrorCode.INVALID_PRIVATE_KEY));
    }
  }

  private _createCosmosKeypairByImportPrivateKey(
    privateKey: string,
    addressPrefix: string
  ): Promise<KeyPair> {
    try {
      const buffer = toBuffer(privateKey);
      isValidPrivate(buffer);
      return Promise.resolve(
        new CosmosKey().generateWalletFromPrivateKey(privateKey, addressPrefix)
      );
    } catch (e) {
      console.error(e);
      return Promise.reject(new BitError(ErrorCode.INVALID_PRIVATE_KEY));
    }
  }

  /**
   * Create Key Pair
   *
   * Create key pair with private key and public key
   *
   * @param {String} mnemonic - mnemonic that can generate private key
   *
   * @param {Bip44HdPath}
   *
   * @returns {KeyPair}
   */
  private _createEthKeypairByMnemonic(
    mnemonic: string,
    hdPath: Bip44HdPath
  ): KeyPair {
    return new EthKey().generateWalletFromMnemonic(mnemonic, hdPath);
  }

  private _createCosmosKeypairByMnemonic(
    mnemonic: string,
    hdPath: Bip44HdPath,
    prefix: string
  ): KeyPair {
    return new CosmosKey().generateWalletFromMnemonic(
      mnemonic,
      hdPath,
      '',
      prefix
    );
  }

  /**
   * Set Locked
   * This method deallocates all secrets, and effectively locks MetaMask.
   *
   * @emits KeyringController#lock
   * @returns {Promise<Object>} A Promise that resolves to the state.
   */
  async setLocked(): Promise<void> {
    this.password = null;
    this.secrets = [];
    this._setIsUnlocked(false);
  }

  /**
   * Submit Password
   *
   * Attempts to decrypt the current vault and load its keyrings
   * into memory.
   *
   * Temporarily also migrates any old-style vaults first, as well.
   * (Pre MetaMask 3.0.0)
   *
   * @emits KeyringController#unlock
   * @param {string} password - The keyring controller password.
   * @returns {Promise<Object>} A Promise that resolves to the state.
   */
  async submitPassword(password: string): Promise<void> {
    await this.verifyPassword(password);
    this.password = password;
    try {
      this.secrets = await this.unlockSecret(password);
      this.setUnlocked();
    } catch (e) {
      console.error('key rings', e);
    }
  }

  /**
   * Verify Password
   *
   * Attempts to decrypt the current vault with a given password
   * to verify its validity.
   *
   * @param {string} password
   */
  async verifyPassword(password: string): Promise<boolean> {
    const encryptedBooted = this.store.getState().booted;
    if (!encryptedBooted) {
      return Promise.reject(new Error('there is no booted'));
    }
    const checksumPassed = await encrypt
      .decrypt(password, encryptedBooted)
      .catch((e) => {
        return Promise.reject(new BitError(ErrorCode.WRONG_PSD));
      });
    return Promise.resolve(Boolean(checksumPassed));
  }

  /**
   * Get Private Key
   *
   * Get private key by address
   *
   * @param {string} address - the current account address
   *
   * @returns {Promise<String>} the current account private key.
   */
  getPrivateKeyByAddress(address: string): Promise<string> {
    const secret = this.secrets.find((s: Secret) => s.address === address);
    if (secret) return Promise.resolve(secret.privateKey);
    return Promise.resolve('');
  }

  /**
   * Sign Ethereum Transaction
   *
   * Signs an Ethereum transaction object.
   *
   * @param {Object} stdTx - The transaction to sign.
   *
   * @param {Object} opts - Signing options.
   * @returns {Promise<Object>} The signed transaction object.
   */
  signTransaction(stdTx, opts = {}) {
    const currentChain = networkPreferenceService.getProviderConfig().coinType;
    switch (currentChain) {
      case CoinType.ETH:
        return this._signEthTx(stdTx, opts);
      default:
        return this._signEthTx(stdTx, opts);
    }
  }

  private _signEthTx(stdTx, opts = {}): any {
    const currentAddress = preference.getCurrentAccount()?.address;
    const privateKey = this.secrets.find(
      (s: Secret) => s.address === currentAddress
    )?.privateKey;
    if (!privateKey)
      return Promise.reject(new Error('can not found private key'));
    return new EthKey().signTx(stdTx, privateKey);
  }

  /**
   * Sign Message
   *
   * Attempts to sign the provided message parameters.
   *
   * @param {Object} msgParams - The message parameters to sign.
   *
   * @param {Object} opts - Signing options.
   *
   * @returns {Promise<Buffer>} The raw signature.
   */
  signMessage(msg: any, opts = {}): any {
    const currentChain = networkPreferenceService.getProviderConfig().coinType;
    switch (currentChain) {
      case CoinType.ETH:
        return this._signEthMsg(msg, opts);
      default:
        return this._signEthMsg(msg, opts);
    }
  }

  private _signEthMsg(msg: any, opts = {}): any {
    const currentAddress = preference.getCurrentAccount()?.address;
    const privateKeyHex = this.secrets.find(
      (s: Secret) => s.address === currentAddress
    )?.privateKey;
    if (!privateKeyHex)
      return Promise.reject(new Error('can not found private key'));
    const stripped = ethUtil.stripHexPrefix(privateKeyHex);
    const privateKeyBuffer = Buffer.from(stripped, 'hex');
    return EthKey.signMessage(stripped, msg); //TODO (Jayce) typeof Private Key is Buffer?
  }

  /**
   * Sign Personal Message
   *
   * Attempts to sign the provided message paramaters.
   * Prefixes the hash before signing per the personal sign expectation.
   *
   * @param {Object} msgParams - The message parameters to sign.
   * @returns {Promise<Buffer>} The raw signature.
   */
  signPersonalMessage(msg, opts = {}): any {
    const currentChain = networkPreferenceService.getProviderConfig().coinType;
    switch (currentChain) {
      case CoinType.ETH:
        return this._signEthPersonalMessage(msg, opts);
      default:
        return this._signEthPersonalMessage(msg, opts);
    }
  }

  private _signEthPersonalMessage(msg: any, opts = {}): any {
    const currentAddress = preference.getCurrentAccount()?.address;
    const privateKeyHex = this.secrets.find(
      (s: Secret) => s.address === currentAddress
    )?.privateKey;
    if (!privateKeyHex)
      return Promise.reject(new Error('can not found private key'));
    const stripped = ethUtil.stripHexPrefix(privateKeyHex);
    const privateKeyBuffer = Buffer.from(stripped, 'hex');
    return EthKey.signPersonalMessage(stripped, msg); //TODO (Jayce) typeof Private Key is Buffer?
  }

  /**
   * Sign Typed Data
   * (EIP712 https://github.com/ethereum/EIPs/pull/712#issuecomment-329988454)
   *
   * @param {Object} msgParams - The message parameters to sign.
   * @returns {Promise<Buffer>} The raw signature.
   */
  signTypedMessage(msg, opts = { version: 'V1' }): any {
    const currentChain = networkPreferenceService.getProviderConfig().coinType;
    switch (currentChain) {
      case CoinType.ETH:
        return this._signEthSignTypedMessage(msg, opts);
      default:
        return this._signEthSignTypedMessage(msg, opts);
    }
  }

  private _signEthSignTypedMessage(msg: any, opts = { version: 'V1' }): string {
    const currentAddress = preference.getCurrentAccount()?.address;
    const privateKeyHex = this.secrets.find(
      (s: Secret) => s.address === currentAddress
    )?.privateKey;
    if (!privateKeyHex) throw new Error('can not found private key');
    const stripped = ethUtil.stripHexPrefix(privateKeyHex);
    const privateKeyBuffer = Buffer.from(stripped, 'hex');
    return EthKey.signTypedData(stripped, msg, opts); //TODO (Jayce) typeof Private Key is Buffer?
  }

  /**
   * Get encryption public key
   *
   * Get encryption public key for using in encrypt/decrypt process.
   *
   * @param {Object} address - The address to get the encryption public key for.
   * @returns {Promise<Buffer>} The public key.
   */
  getEncryptionPublicKey(_address) {
    const currentChain = networkPreferenceService.getProviderConfig().coinType;
    switch (currentChain) {
      case CoinType.ETH:
        return this._getEthEncryptionPublicKey();
      default:
        return this._getEthEncryptionPublicKey();
    }
  }

  private _getEthEncryptionPublicKey() {
    const currentAddress = preference.getCurrentAccount()?.address;
    const privateKeyHex = this.secrets.find(
      (s: Secret) => s.address === currentAddress
    )?.privateKey;
    if (!privateKeyHex) throw new Error('can not found private key');
    const stripped = ethUtil.stripHexPrefix(privateKeyHex);
    const privateKeyBuffer = Buffer.from(stripped, 'hex');
    return EthKey.getEncryptionPublicKey(stripped); //TODO (Jayce) typeof Private Key is Buffer?
  }

  /**
   * Decrypt Message
   *
   * Attempts to decrypt the provided message parameters.
   *
   * @param {Object} msgParams - The decryption message parameters.
   * @returns {Promise<Buffer>} The raw decryption result.
   */
  decryptMessage(encryptData, opts = {}) {
    const currentChain = networkPreferenceService.getProviderConfig().coinType;
    switch (currentChain) {
      case CoinType.ETH:
        return this._decryptEthMessage(encryptData);
      default:
        return this._decryptEthMessage(encryptData);
    }
  }

  private _decryptEthMessage(encryptData) {
    const currentAddress = preference.getCurrentAccount()?.address;
    const privateKeyHex = this.secrets.find(
      (s: Secret) => s.address === currentAddress
    )?.privateKey;
    if (!privateKeyHex) throw new Error('can not found private key');
    const stripped = ethUtil.stripHexPrefix(privateKeyHex);
    //const privateKeyBuffer = Buffer.from(stripped, 'hex')
    return EthKey.decryptMessage(stripped, encryptData); //TODO (Jayce) typeof Private Key is Buffer?
  }

  /**
   * Unlock Secret
   *
   * Unlock Secret By Using Password
   *
   * @param {String} password - The password witch can unlock the wallet
   *
   * @returns {Promise<Secret[]>}
   */
  async unlockSecret(password: string): Promise<Secret[]> {
    const encryptedSecret = this.store.getState().secret;
    if (!encryptedSecret) {
      return Promise.reject(new Error('there is no secret'));
    }
    const secrets: Secret[] = await encrypt
      .decrypt(password, encryptedSecret)
      .catch((e) => {
        console.error(e);
      });
    this.password = password;
    return Promise.resolve(secrets);
  }

  async getCurrentChainAccounts(): Promise<BaseAccount[]> {
    const currentChain: Provider = networkPreferenceService.getProviderConfig();
    const { coinType, id } = currentChain;
    const currentAccount = preference.getCurrentAccount();
    let accounts: BaseAccount[] = [];
    if (!currentAccount) {
      return Promise.reject(new Error('no account found'));
    }

    accounts = this.accounts.filter((a: BaseAccount) =>
      coinType === CoinType.ETH
        ? a.coinType === coinType && a.hdWalletId === currentAccount.hdWalletId
        : a.hdWalletId === currentAccount.hdWalletId && a.chainCustomId === id
    );
    return Promise.resolve(accounts);
  }

  getAccountList(useCurrentChain = false): DisplayWalletManage {
    const coinType = networkPreferenceService.getProviderConfig().coinType;
    const accounts: DisplayWalletManage = {
      hdAccount: [],
      simpleAccount: [],
    };
    const cloned: BaseAccount[] = cloneDeep(this.accounts);
    cloned.forEach((c: BaseAccount) => {
      switch (c.accountCreateType) {
        case AccountCreateType.MNEMONIC:
          if (useCurrentChain && coinType && coinType !== c.coinType) return;
          if (
            accounts.hdAccount.some((a: any) => a.hdWalletId === c.hdWalletId)
          ) {
            accounts.hdAccount
              .find((a: any) => a.hdWalletId === c.hdWalletId)
              ?.accounts.push(c);
          } else {
            accounts.hdAccount.push({
              hdWalletId: c.hdWalletId,
              hdWalletName: c.hdWalletName,
              accounts: [c],
            });
          }
          break;
        case AccountCreateType.PRIVATE_KEY:
          accounts.simpleAccount.push(c);
          break;
      }
    });

    return accounts;
  }

  getAccountListByHdWalletId(hdWalletId: string): BaseAccount[] {
    return cloneDeep(this.accounts).filter(
      (a: BaseAccount) => a.hdWalletId === hdWalletId
    );
    /* const displayAccounts: DisplayAccountManage[] = [];
    if (accounts && accounts.length > 0) {
      accounts.forEach((a: BaseAccount) => {
        const match = displayAccounts.find(
          (da: DisplayAccountManage) => da.hdPathIndex === a.hdPathIndex
        );
        if (match) {
          match.accounts.push(a);
        } else {
          displayAccounts.push({
            accountName: a.accountName,
            hdPathIndex: a.hdPathIndex,
            accounts: [a],
          });
        }
      });
    }

    return displayAccounts; */
  }

  getAccountAllList() {
    return this.accounts;
  }

  /**
   * Get Accounts
   *
   * Returns the public addresses of all current accounts
   * managed by all currently unlocked keyrings.
   *
   * @returns {Promise<Array<string>>} The array of accounts.
   */
  async getAccounts(): Promise<string[]> {
    return this.accounts.map((a: BaseAccount) => a.address);
  }

  /**
   * Unlock Secrets
   *
   * Unlock the secrets.
   *
   * @emits KeyringController#unlock
   */
  setUnlocked(): void {
    this._setIsUnlocked(true);
    this.emit('unlock');
  }

  async removeHdWalletsByHdWalletId(hdWalletId: string): Promise<void> {
    this.accounts = this.accounts.filter(
      (a: BaseAccount) => a.hdWalletId !== hdWalletId
    );
    this.secrets = this.secrets.filter(
      (a: Secret) => a.hdWalletId !== hdWalletId
    );
    await this._persistAllAccount();
  }

  async renameHdWalletByHdWalletId(
    hdWalletId: string,
    walletName: string
  ): Promise<boolean> {
    if (this._checkDuplicateHdWalletName(walletName)) {
      return Promise.reject(new BitError(ErrorCode.WALLET_NAME_REPEAT));
    }
    this.accounts.forEach((a: BaseAccount) => {
      if (a.hdWalletId === hdWalletId) {
        a.hdWalletName = walletName;
      }
    });
    await this._persistAllAccount();
    return Promise.resolve(true);
  }

  async getMnemonicByHdWalletId(hdWalletId: string): Promise<string> {
    const secrets: Secret[] = this.secrets.filter(
      (a: Secret) => a.hdWalletId === hdWalletId
    );
    if (!secrets || secrets.length === 0)
      return Promise.reject('there is no mnemonic for this id');
    return secrets[0].mnemonic;
  }

  async getPrivateKeyByHdWalletId(
    hdWalletId: string,
    address?: string
  ): Promise<string> {
    const secrets: Secret[] = this.secrets.filter(
      (a: Secret) =>
        a.hdWalletId === hdWalletId && (address ? address === a.address : true)
    );
    if (!secrets || secrets.length === 0)
      return Promise.reject('there is no private key for this id');
    return secrets[0].privateKey;
  }

  async deleteDisplayAccount(
    hdWalletId: string,
    addressIndex: number
  ): Promise<void> {
    const shouldDeleteAccountAddressSet = new Set<string>();
    this.accounts = this.accounts.filter((a: BaseAccount) => {
      if (!(a.hdWalletId === hdWalletId && a.hdPathIndex === addressIndex)) {
        return true;
      } else if (
        a.hdWalletId === hdWalletId &&
        a.hdPathIndex === addressIndex
      ) {
        shouldDeleteAccountAddressSet.add(a.address);
      }
    });
    this.accounts.forEach((a: BaseAccount) => {
      if (a.hdWalletId === hdWalletId && a.hdPathIndex !== addressIndex) {
        if (a.deletedHdPathIndex) {
          a.deletedHdPathIndex.push(addressIndex);
        } else {
          a.deletedHdPathIndex = [addressIndex];
        }
      }
    });
    this.secrets = this.secrets.filter(
      (a: Secret) => !shouldDeleteAccountAddressSet.has(a.address)
    );
    await this._persistAllAccount();
  }

  /**
   * Rename display account
   *
   * rename display account
   *
   * @returns {Promise<boolean>}
   */
  async renameDisplayAccount(
    hdWalletId: string,
    accountName: string,
    addressIndex: number
  ): Promise<boolean> {
    if (this._checkDuplicateIndexName(accountName, hdWalletId)) {
      return Promise.reject(new BitError(ErrorCode.WALLET_NAME_REPEAT));
    }
    this.accounts.forEach((a: BaseAccount) => {
      if (a.hdWalletId === hdWalletId && a.hdPathIndex === addressIndex) {
        a.accountName = accountName;
      }
    });
    await this._persistAllAccount();
    return Promise.resolve(true);
  }
}

export default new KeyringService();
