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
  CompareAccountsForCompatible,
  DisplayAccountManage,
  DisplayWalletManage,
  HdAccountStruct,
  ImportAccountOpts,
  Secret,
} from 'types/extend';
import {
  networkPreferenceService,
  preferenceService,
} from 'background/service';
import BitError from 'error';
import { ErrorCode } from 'constants/code';
import { nanoid } from 'nanoid';
import { EthKey } from '../keyManager/eth/EthKey';
import { CosmosKey } from '../keyManager/cosmos/CosmosKey';
import {
  Bip44HdPath,
  KeplrGetKeyResponseInterface,
  KeyPair,
  SignatureAlgorithm,
} from 'types/keyBase';
import cloneDeep from 'lodash/cloneDeep';
import { CoinType, Ecosystem, Provider } from 'types/network';
import secp256k1_1 from 'ethereum-cryptography/secp256k1';
import { Bech32Config } from 'types/cosmos';
import { PresetNetworkId } from 'constants/defaultNetwork';
import { Bech32Address } from 'utils/cosmos/bech32';
import { transformHexAddress2Bech32 } from 'background/utils/hexstring-utils';

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

    let accounts = [];
    if (initState?.account) {
      accounts = JSON.parse(initState.account as string);
      //v0.3
      accounts.forEach((a: BaseAccount) => {
        if (!a.chainCustomId) a.chainCustomId = PresetNetworkId.ETHEREUM;
        if (!a.ecosystem) a.ecosystem = Ecosystem.EVM;
      });
    }
    this.accounts = accounts;
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

  /* private _checkDuplicatePrivateKeyWalletName(
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
  } */

  /**
   * Get Private Key
   *
   * Get private key by address
   *
   * @param {string} address - the current account address
   *
   * @returns {Promise<String>} the current account private key.
   */
  public getPrivateKeyByAddress(address) {
    return this.secrets.find((s) => s.address === address)?.privateKey;
  }

  private _checkDuplicateAccount(
    address: string,
    accountCreateType: AccountCreateType,
    customChainId?: PresetNetworkId | string
  ): boolean {
    const exist = this.accounts.some(
      (a: BaseAccount) =>
        a.address === address &&
        accountCreateType === a.accountCreateType &&
        (customChainId ? a.chainCustomId === customChainId : true)
    );
    if (exist) {
      console.error('this address is duplicated', address);
      console.error(this.accounts);
    }
    return exist;
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
    const hdWalletId: string = nanoid();
    for (const chain of opts.chains) {
      // same wallet name can not exist bellow the same chain
      if (this._checkDuplicateHdWalletName(opts.name)) {
        return Promise.reject(new BitError(ErrorCode.WALLET_NAME_REPEAT));
      }
      let keyPair: Pick<KeyPair, 'privateKey' | 'publicKey' | 'address'>;
      let signatureAlgorithm: SignatureAlgorithm, ecosystem: Ecosystem;
      switch (chain.ecosystem) {
        case Ecosystem.EVM:
          keyPair = await this._createEthKeypairByImportPrivateKey(
            opts.privateKey
          );
          if (
            this._checkDuplicateAccount(
              keyPair.address,
              AccountCreateType.PRIVATE_KEY
            )
          ) {
            return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
          }
          signatureAlgorithm = SignatureAlgorithm.secp256k1;
          ecosystem = Ecosystem.EVM;
          break;
        case Ecosystem.COSMOS:
          if (chain.coinType === CoinType.ETH) {
            keyPair = await this._createEthKeypairByImportPrivateKey(
              opts.privateKey
            );
            keyPair.address = transformHexAddress2Bech32(
              keyPair.address,
              (chain.prefix as Bech32Config)?.bech32PrefixAccAddr
            );
          } else {
            keyPair = await this._createCosmosKeypairByImportPrivateKey(
              opts.privateKey,
              (chain.prefix as Bech32Config)?.bech32PrefixAccAddr
            );
          }

          if (
            this._checkDuplicateAccount(
              keyPair.address,
              AccountCreateType.PRIVATE_KEY
            )
          ) {
            return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
          }
          signatureAlgorithm = SignatureAlgorithm.secp256k1;
          ecosystem = Ecosystem.COSMOS;
          break;

        default:
          keyPair = await this._createEthKeypairByImportPrivateKey(
            opts.privateKey
          );
          signatureAlgorithm = SignatureAlgorithm.secp256k1;
          ecosystem = Ecosystem.EVM;
      }
      const account: BaseAccount = {
        address: keyPair.address,
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
        ecosystem,
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
      if (!currentAccount) {
        let destChainCustomId;
        const ethChainCustomId: PresetNetworkId | string =
            PresetNetworkId.ETHEREUM,
          cosmosChainId: PresetNetworkId | string = PresetNetworkId.COSMOS_HUB;
        if (tempAccounts[0].ecosystem === Ecosystem.COSMOS) {
          destChainCustomId = cosmosChainId;
        } else if (tempAccounts[0].ecosystem === Ecosystem.EVM) {
          destChainCustomId = ethChainCustomId;
        }
        currentAccount = tempAccounts.find(
          (c: BaseAccount) => c.chainCustomId === destChainCustomId
        );
        const provider =
          networkPreferenceService.getProvider(destChainCustomId);
        if (provider)
          networkPreferenceService.setProviderConfig(provider, false);
      }
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
  async addAccount(opts: IAddAccountOpts): Promise<BaseAccount> {
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

    const newAccount = await this._createAccountByImportMnemonic(
      createOpts,
      opts.hdWalletId as string
    );
    return Promise.resolve(newAccount);
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
      ecosystem: Ecosystem.EVM,
    };
    const { id } = networkPreferenceService.getProviderConfig();
    const accountList: BaseAccount[] = [];
    const secretList: Secret[] = [];
    for (const p of supportProviders) {
      let keyPair: Pick<KeyPair, 'privateKey' | 'publicKey' | 'address'>;
      hdPath.coinType = p.coinType;
      switch (p.ecosystem) {
        case Ecosystem.EVM:
          keyPair = this._createEthKeypairByMnemonic(opts.mnemonic, hdPath);
          if (
            this._checkDuplicateAccount(
              keyPair.address,
              AccountCreateType.MNEMONIC
            )
          ) {
            return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
          }
          break;
        case Ecosystem.COSMOS:
          if (p.coinType === CoinType.ETH) {
            keyPair = this._createEthKeypairByMnemonic(opts.mnemonic, hdPath);
            keyPair.address = transformHexAddress2Bech32(
              keyPair.address,
              (p.prefix as Bech32Config)?.bech32PrefixAccAddr
            );
          } else {
            keyPair = this._createCosmosKeypairByMnemonic(
              opts.mnemonic,
              hdPath,
              (p.prefix as Bech32Config).bech32PrefixAccAddr
            );
          }

          if (
            this._checkDuplicateAccount(
              keyPair.address,
              AccountCreateType.MNEMONIC
            )
          ) {
            return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
          }
          break;
        default:
          keyPair = this._createEthKeypairByMnemonic(opts.mnemonic, hdPath);
          if (
            this._checkDuplicateAccount(
              keyPair.address,
              AccountCreateType.MNEMONIC
            )
          ) {
            return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
          }
      }
      const account: BaseAccount = {
        address: keyPair.address,
        coinType: p.coinType,
        publicKey: keyPair.publicKey,
        hdPathCoinType: p.coinType,
        hdPathAccount: 0,
        hdPathChange: 0,
        hdPathIndex: opts.addressIndex as number,
        hdWalletName: opts.name,
        hdWalletId: hdWalletId as string,
        accountName: opts.accountName || `account ${hdPath.addressIndex + 1}`,
        countOfPhrase: 12,
        signatureAlgorithm: SignatureAlgorithm.secp256k1,
        accountCreateType: AccountCreateType.MNEMONIC,
        chainCustomId: p.id,
        ecosystem: p.ecosystem,
      };
      if (p.id === id) {
        newDisplayAccount = Object.assign(account, {});
      }
      const secret: Secret = {
        privateKey: keyPair.privateKey,
        mnemonic: opts.mnemonic,
        address: keyPair.address,
        hdWalletId: hdWalletId as string,
      };

      accountList.push(account);
      secretList.push(secret);
    }
    this.accounts = [...this.accounts, ...accountList];
    this.secrets = [...this.secrets, ...secretList];
    this.setUnlocked();
    this._persistAllAccount();
    return Promise.resolve(newDisplayAccount);
  }

  addCurrentChainAccountByWalletId(hdWalletId: string): Promise<BaseAccount> {
    let mnemonic, baseHdWallet;
    const hdWalletSecrets: Secret[] = this.secrets.filter(
      (s: Secret) => s.hdWalletId === hdWalletId
    );
    const hdWallets: BaseAccount[] = this.accounts.filter(
      (s: BaseAccount) => s.hdWalletId === hdWalletId
    );
    if (hdWalletSecrets) {
      mnemonic = hdWalletSecrets[0].mnemonic;
    }
    if (hdWallets) {
      baseHdWallet = hdWallets[0];
    }

    const { ecosystem, id, coinType, prefix } =
      networkPreferenceService.getProviderConfig();
    const hdPath: Bip44HdPath = {
      account: 0,
      change: 0,
      addressIndex: 0,
    };
    const createdAccount: BaseAccount = {
      address: '',
      coinType,
      publicKey: '',
      hdPathCoinType: coinType,
      hdPathAccount: 0,
      hdPathChange: 0,
      hdPathIndex: 0,
      hdWalletName: baseHdWallet?.hdWalletName,
      hdWalletId,
      accountName: `account ${hdPath.addressIndex + 1}`,
      countOfPhrase: 0,
      signatureAlgorithm: SignatureAlgorithm.secp256k1,
      accountCreateType: AccountCreateType.MNEMONIC,
      chainCustomId: id,
      ecosystem,
    };

    let keyPair: Pick<KeyPair, 'privateKey' | 'publicKey' | 'address'>;
    switch (ecosystem) {
      case Ecosystem.EVM:
        keyPair = this._createEthKeypairByMnemonic(mnemonic, hdPath);
        if (
          this._checkDuplicateAccount(
            keyPair.address,
            AccountCreateType.MNEMONIC
          )
        ) {
          return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
        }
        break;
      case Ecosystem.COSMOS:
        if (coinType === CoinType.ETH) {
          keyPair = this._createEthKeypairByMnemonic(mnemonic, hdPath);
          keyPair.address = transformHexAddress2Bech32(
            keyPair.address,
            (prefix as Bech32Config)?.bech32PrefixAccAddr
          );
        } else {
          keyPair = this._createCosmosKeypairByMnemonic(
            mnemonic,
            hdPath,
            (prefix as Bech32Config).bech32PrefixAccAddr
          );
        }
        if (
          this._checkDuplicateAccount(
            keyPair.address,
            AccountCreateType.MNEMONIC
          )
        ) {
          return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
        }
        break;
      default:
        keyPair = this._createEthKeypairByMnemonic(mnemonic, hdPath);
        if (
          this._checkDuplicateAccount(
            keyPair.address,
            AccountCreateType.MNEMONIC
          )
        ) {
          return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
        }
    }
    createdAccount.address = keyPair.address;
    createdAccount.publicKey = keyPair.publicKey;
    const secret: Secret = {
      privateKey: keyPair.privateKey,
      mnemonic: mnemonic,
      address: keyPair.address,
      hdWalletId: hdWalletId as string,
    };

    this.accounts.push(createdAccount);
    this.secrets.push(secret);
    this.setUnlocked();
    this._persistAllAccount();
    return Promise.resolve(createdAccount);
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
      return Promise.reject(new BitError(ErrorCode.WALLET_WAS_LOCKED));
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
    const { ecosystem, id } = currentChain;
    const currentAccount = preference.getCurrentAccount();
    let accounts: BaseAccount[] = [];
    if (!currentAccount) {
      return Promise.reject(new Error('no account found'));
    }

    accounts = this.accounts.filter((a: BaseAccount) =>
      ecosystem === Ecosystem.EVM
        ? a.ecosystem === Ecosystem.EVM &&
          a.hdWalletId === currentAccount.hdWalletId
        : a.hdWalletId === currentAccount.hdWalletId && a.chainCustomId === id
    );
    return Promise.resolve(accounts);
  }

  changeAccountByWallet(
    destHdWalletId: string,
    destEcosystem: Ecosystem,
    destAccountCreateType: AccountCreateType
  ) {
    const { id, ecosystem } = networkPreferenceService.getProviderConfig();
    const currentAccount = preference.getCurrentAccount();

    const ethChainCustomId: PresetNetworkId | string = PresetNetworkId.ETHEREUM,
      cosmosChainId: PresetNetworkId | string = PresetNetworkId.COSMOS_HUB;
    let destChainCustomId;
    if (destEcosystem === Ecosystem.COSMOS) {
      destChainCustomId = cosmosChainId;
    } else if (destEcosystem === Ecosystem.EVM) {
      destChainCustomId = ethChainCustomId;
    }

    if (!currentAccount) throw Error('no current account found');
    const srcEcosystem = ecosystem;
    const srcAccountCreateType = currentAccount?.accountCreateType;

    if (srcAccountCreateType === AccountCreateType.MNEMONIC) {
      if (destAccountCreateType === AccountCreateType.MNEMONIC) {
        const accounts = this.accounts.filter((a: BaseAccount) => {
          return (
            a.hdWalletId === destHdWalletId &&
            ((srcEcosystem !== Ecosystem.EVM && a.chainCustomId === id) ||
              (srcEcosystem === Ecosystem.EVM && a.ecosystem === Ecosystem.EVM))
          );
        });
        let account = accounts.find(
          (a: BaseAccount) => a.hdPathIndex === currentAccount?.hdPathIndex
        );
        if (!account) account = accounts[0];
        if (!account) throw Error('no account found');
        preferenceService.setCurrentAccount(account);
      } else {
        if (srcEcosystem === destEcosystem) {
          const account = this.accounts.find((a: BaseAccount) => {
            return (
              a.hdWalletId === destHdWalletId &&
              ((srcEcosystem !== Ecosystem.EVM && a.chainCustomId === id) ||
                srcEcosystem === Ecosystem.EVM)
            );
          });
          if (!account) throw Error('no account found');
          preferenceService.setCurrentAccount(account);
        } else {
          const account = this.accounts.find((a: BaseAccount) => {
            return (
              a.hdWalletId === destHdWalletId &&
              a.chainCustomId === destChainCustomId
            );
          });
          if (!account) throw Error('no account found');
          preferenceService.setCurrentAccount(account);
          const provider =
            networkPreferenceService.getProvider(destChainCustomId);
          if (provider)
            networkPreferenceService.setProviderConfig(provider, false);
        }
      }
    } else if (srcAccountCreateType === AccountCreateType.PRIVATE_KEY) {
      if (destAccountCreateType === AccountCreateType.MNEMONIC) {
        const accounts: BaseAccount[] = this.accounts.filter(
          (a: BaseAccount) => {
            return (
              a.hdWalletId === destHdWalletId &&
              ((srcEcosystem !== Ecosystem.EVM && a.chainCustomId === id) ||
                srcEcosystem === Ecosystem.EVM)
            );
          }
        );
        if (!accounts?.length) throw Error('no account found');
        preferenceService.setCurrentAccount(accounts[0]);
      } else {
        if (srcEcosystem === destEcosystem) {
          const account = this.accounts.find((a: BaseAccount) => {
            return (
              a.hdWalletId === destHdWalletId &&
              ((srcEcosystem !== Ecosystem.EVM && a.chainCustomId === id) ||
                srcEcosystem === Ecosystem.EVM)
            );
          });
          if (!account) throw Error('no account found');
          preferenceService.setCurrentAccount(account);
        } else {
          const account = this.accounts.find((a: BaseAccount) => {
            return (
              a.hdWalletId === destHdWalletId &&
              a.chainCustomId === destChainCustomId
            );
          });
          if (!account) throw Error('no account found');
          preferenceService.setCurrentAccount(account);
          const provider =
            networkPreferenceService.getProvider(destChainCustomId);
          if (provider)
            networkPreferenceService.setProviderConfig(provider, false);
        }
      }
    }
  }

  getWalletList(useCurrentEcosystem = false): HdAccountStruct[] {
    const { ecosystem } = networkPreferenceService.getProviderConfig();
    const accounts: HdAccountStruct[] = [];
    const cloned: BaseAccount[] = cloneDeep(this.accounts);
    cloned.forEach((c: BaseAccount) => {
      if (
        useCurrentEcosystem &&
        c.accountCreateType === AccountCreateType.PRIVATE_KEY
      ) {
        //compatible, there is no `ecosystem` filed in BaseAccount
        if (
          (c.ecosystem && c.ecosystem !== ecosystem) ||
          (!c.ecosystem && ecosystem === Ecosystem.EVM)
        )
          return;
      }
      if (accounts.some((a: any) => a.hdWalletId === c.hdWalletId)) {
        accounts
          .find((a: any) => a.hdWalletId === c.hdWalletId)
          ?.accounts.push(c);
      } else {
        accounts.push({
          hdWalletId: c.hdWalletId,
          hdWalletName: c.hdWalletName,
          accounts: [c],
        });
      }
    });

    return accounts;
  }

  getAccountList(useCurrentChain = false): DisplayWalletManage {
    const { coinType, id } = networkPreferenceService.getProviderConfig();
    const accounts: DisplayWalletManage = {
      hdAccount: [],
      simpleAccount: [],
    };
    const cloned: BaseAccount[] = cloneDeep(this.accounts);
    cloned.forEach((c: BaseAccount) => {
      switch (c.accountCreateType) {
        case AccountCreateType.MNEMONIC:
          //if (useCurrentChain && ((coinType && coinType !== c.coinType) || (id && id !== c.chainCustomId))) return;
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
  async getAccounts(): Promise<BaseAccount[]> {
    return cloneDeep(this.accounts) as BaseAccount[];
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

  async deleteAccountsByChainCustomId(chainCustomId: string): Promise<void> {
    if (!this.password) {
      return Promise.reject(new BitError(ErrorCode.WALLET_WAS_LOCKED));
    }
    this.accounts = this.accounts.filter(
      (a: BaseAccount) => a.chainCustomId !== chainCustomId
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

  private _getKey(account: BaseAccount): KeplrGetKeyResponseInterface {
    const { address, publicKey, hdWalletName, signatureAlgorithm } = account;
    const addressBuf = Bech32Address.fromBech32(address).address,
      publicKeyBuf = Buffer.from(publicKey, 'hex');
    return {
      name: hdWalletName,
      algo:
        signatureAlgorithm === SignatureAlgorithm.secp256k1 ? 'secp256k1' : '',
      pubKey: publicKeyBuf,
      address: addressBuf,
      bech32Address: address,
      isNanoLedger: false,
    } as KeplrGetKeyResponseInterface;
  }

  public getKeplrCompatibleKey(chainId): KeplrGetKeyResponseInterface | null {
    const chains: Provider[] = networkPreferenceService.getSupportProviders();
    const chain: Provider | undefined = chains.find(
      (c: Provider) => c.chainId === chainId
    );
    if (chain) {
      const { id } = chain;
      const accounts = cloneDeep(this.accounts);
      const currentAccount: BaseAccount | null | undefined =
        preferenceService.getCurrentAccount();
      if (currentAccount) {
        const { hdPathIndex, ecosystem, accountCreateType, hdWalletId } =
          currentAccount;
        if (accountCreateType === AccountCreateType.PRIVATE_KEY) {
          if (ecosystem !== Ecosystem.COSMOS) {
            return null;
          } else {
            const currentChainAccounts: BaseAccount[] = accounts.filter(
              (a: BaseAccount) =>
                a.chainCustomId === id && a.hdWalletId === hdWalletId
            );
            if (currentChainAccounts?.length > 0) {
              return this._getKey(currentChainAccounts[0]);
            } else {
              return null;
            }
          }
        } else {
          const currentChainAccounts: BaseAccount[] = accounts.filter(
            (a: BaseAccount) =>
              a.chainCustomId === id &&
              a.hdWalletId === hdWalletId &&
              a.hdPathIndex === hdPathIndex
          );
          if (currentChainAccounts?.length > 0) {
            return this._getKey(currentChainAccounts[0]);
          } else {
            return null;
          }
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  public generateMissedAccounts() {
    if (!this.getIsUnlocked()) throw new BitError(ErrorCode.WALLET_WAS_LOCKED);
    const wallets: CompareAccountsForCompatible[] =
      this.getMissedAccountsForAllChain();
    console.log('missed accounts', wallets);
    this._generateAccounts(wallets);
  }

  private async _generateAccounts(wallets: CompareAccountsForCompatible[]) {
    const accountList: BaseAccount[] = [];
    const secretList: Secret[] = [];

    for (const wallet of wallets) {
      for (const chain of wallet.chains) {
        if (wallet.accountCreateType === AccountCreateType.MNEMONIC) {
          for (const account of (wallet as any).accounts) {
            const hdPath: Bip44HdPath = {
              account: 0,
              change: 0,
              addressIndex: account.hdPathIndex,
              coinType: chain.coinType,
            };
            const createdAccount: BaseAccount = {
              address: '',
              coinType: chain.coinType,
              publicKey: '',
              hdPathCoinType: chain.coinType,
              hdPathAccount: 0,
              hdPathChange: 0,
              hdPathIndex: account.hdPathIndex,
              hdWalletName: wallet.hdWalletName,
              hdWalletId: wallet.hdWalletId,
              accountName: account.accountName,
              countOfPhrase: 0,
              signatureAlgorithm: SignatureAlgorithm.secp256k1,
              accountCreateType: AccountCreateType.MNEMONIC,
              chainCustomId: chain.id,
              ecosystem: chain.ecosystem,
            };

            let keyPair: Pick<KeyPair, 'privateKey' | 'publicKey' | 'address'>;
            switch (chain.ecosystem) {
              case Ecosystem.EVM:
                keyPair = this._createEthKeypairByMnemonic(
                  wallet.mnemonic as string,
                  hdPath
                );
                if (
                  this._checkDuplicateAccount(
                    keyPair.address,
                    AccountCreateType.MNEMONIC
                  )
                ) {
                  return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
                }
                break;
              case Ecosystem.COSMOS:
                if (chain.coinType === CoinType.ETH) {
                  keyPair = this._createEthKeypairByMnemonic(
                    wallet.mnemonic as string,
                    hdPath
                  );
                  keyPair.address = transformHexAddress2Bech32(
                    keyPair.address,
                    (chain.prefix as Bech32Config)?.bech32PrefixAccAddr
                  );
                } else {
                  keyPair = this._createCosmosKeypairByMnemonic(
                    wallet.mnemonic as string,
                    hdPath,
                    (chain.prefix as Bech32Config).bech32PrefixAccAddr
                  );
                }
                if (
                  this._checkDuplicateAccount(
                    keyPair.address,
                    AccountCreateType.MNEMONIC,
                    chain.id
                  )
                ) {
                  return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
                }
                break;
              default:
                keyPair = this._createEthKeypairByMnemonic(
                  wallet.mnemonic as string,
                  hdPath
                );
                if (
                  this._checkDuplicateAccount(
                    keyPair.address,
                    AccountCreateType.MNEMONIC
                  )
                ) {
                  return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
                }
            }
            createdAccount.address = keyPair.address;
            createdAccount.publicKey = keyPair.publicKey;
            const secret: Secret = {
              privateKey: keyPair.privateKey,
              mnemonic: wallet.mnemonic as string,
              address: keyPair.address,
              hdWalletId: wallet.hdWalletId,
            };
            accountList.push(createdAccount);
            secretList.push(secret);
          }
        } else if (wallet.accountCreateType === AccountCreateType.PRIVATE_KEY) {
          const createdAccount: BaseAccount = {
            address: '',
            coinType: chain.coinType,
            publicKey: '',
            hdPathCoinType: chain.coinType,
            hdPathAccount: 0,
            hdPathChange: 0,
            hdPathIndex: 0,
            hdWalletName: wallet.hdWalletName,
            hdWalletId: wallet.hdWalletId,
            accountName: '',
            countOfPhrase: 0,
            signatureAlgorithm: SignatureAlgorithm.secp256k1,
            accountCreateType: AccountCreateType.PRIVATE_KEY,
            chainCustomId: chain.id,
            ecosystem: chain.ecosystem,
          };

          let keyPair: Pick<KeyPair, 'privateKey' | 'publicKey' | 'address'>;
          switch (chain.ecosystem) {
            case Ecosystem.EVM:
              keyPair = await this._createEthKeypairByImportPrivateKey(
                (wallet as any).privateKey
              );
              if (
                this._checkDuplicateAccount(
                  keyPair.address,
                  AccountCreateType.PRIVATE_KEY
                )
              ) {
                return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
              }
              break;
            case Ecosystem.COSMOS:
              if (chain.coinType === CoinType.ETH) {
                keyPair = await this._createEthKeypairByImportPrivateKey(
                  (wallet as any).privateKey
                );
                keyPair.address = transformHexAddress2Bech32(
                  keyPair.address,
                  (chain.prefix as Bech32Config)?.bech32PrefixAccAddr
                );
              } else {
                keyPair = await this._createCosmosKeypairByImportPrivateKey(
                  (wallet as any).privateKey,
                  (chain.prefix as Bech32Config)?.bech32PrefixAccAddr
                );
              }
              if (
                this._checkDuplicateAccount(
                  keyPair.address,
                  AccountCreateType.PRIVATE_KEY,
                  chain.id
                )
              ) {
                return Promise.reject(new BitError(ErrorCode.ADDRESS_REPEAT));
              }

              break;

            default:
              keyPair = await this._createEthKeypairByImportPrivateKey(
                (wallet as any).privateKey
              );
          }
          createdAccount.address = keyPair.address;
          createdAccount.publicKey = keyPair.publicKey;
          const secret: Secret = {
            privateKey: keyPair.privateKey,
            mnemonic: wallet.mnemonic as string,
            address: keyPair.address,
            hdWalletId: wallet.hdWalletId,
          };
          accountList.push(createdAccount);
          secretList.push(secret);
        }
      }
    }
    this.accounts = [...this.accounts, ...accountList];
    this.secrets = [...this.secrets, ...secretList];
    await this._persistAllAccount();
  }

  public getMissedAccountsForAllChain(): CompareAccountsForCompatible[] {
    const accounts: BaseAccount[] = cloneDeep(this.accounts);
    const secret: Secret[] = cloneDeep(this.secrets);
    // accounts bellow evm chains are not missed;
    const chains: Provider[] = networkPreferenceService
      .getSupportProviders()
      .filter((c: Provider) => c.ecosystem !== Ecosystem.EVM);
    const difference: CompareAccountsForCompatible[] = [];

    const walletIdMap: Record<string, BaseAccount[]> = {};
    accounts.forEach((a: BaseAccount) => {
      if (walletIdMap[a.hdWalletId]) {
        walletIdMap[a.hdWalletId].push(a);
      } else {
        walletIdMap[a.hdWalletId] = [a];
      }
    });

    for (const walletId in walletIdMap) {
      const { accountCreateType, ecosystem, hdWalletName } =
        walletIdMap[walletId][0];
      let currentChains = chains,
        mnemonic,
        privateKey;
      if (accountCreateType === AccountCreateType.PRIVATE_KEY) {
        currentChains = chains.filter(
          (c: Provider) => c.ecosystem === ecosystem
        );
        privateKey = secret.find(
          (s: Secret) => s.hdWalletId === walletId
        )?.privateKey;
      } else if (accountCreateType === AccountCreateType.MNEMONIC) {
        mnemonic = secret.find(
          (s: Secret) => s.hdWalletId === walletId
        )?.mnemonic;
      }
      currentChains.forEach((c: Provider) => {
        if (
          walletIdMap[walletId].every(
            (a: BaseAccount) => a.chainCustomId !== c.id
          )
        ) {
          const diffItem = difference.find(
            (d: CompareAccountsForCompatible) => d.hdWalletId === walletId
          );
          if (diffItem) {
            diffItem.chains.push(c);
          } else {
            const d: CompareAccountsForCompatible = {
              hdWalletId: walletId,
              hdWalletName,
              mnemonic,
              privateKey,
              accountCreateType,
              accounts: [],
              chains: [c],
            };
            if (accountCreateType === AccountCreateType.MNEMONIC) {
              walletIdMap[walletId].forEach((a: BaseAccount) => {
                if (
                  (d as any).accounts.every(
                    (account: { hdPathIndex: number; accountName }) =>
                      account.hdPathIndex !== a.hdPathIndex
                  )
                ) {
                  (d as any).accounts.push({
                    hdPathIndex: a.hdPathIndex,
                    accountName: a.accountName,
                  });
                }
              });
            }
            difference.push(d);
          }
        }
      });
    }
    return difference;
  }
}

export default new KeyringService();
