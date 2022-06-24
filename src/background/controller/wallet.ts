import {
  keyringService,
  preferenceService,
  networkPreferenceService,
  notificationService,
  permissionService,
  sessionService,
  TokenService,
  txController,
  networkController,
  gasFeeController,
  knownMethodService,
  contactBookService,
  latestBlockDataHub,
  cosmosTxController,
  cosmosFeeService,
} from 'background/service';
import { ContactBookItem } from '../service/contactBook';
import BaseController from './base';
import { INTERNAL_REQUEST_ORIGIN } from 'constants/index';
import {
  AccountCreateType,
  BaseAccount,
  CreateAccountOpts,
  DisplayAccountManage,
  DisplayWalletManage,
  HdAccountStruct,
  ImportAccountOpts,
} from 'types/extend';
import provider from './provider';
import BitError from 'error';
import { defaultNetworks, PresetNetworkId } from 'constants/defaultNetwork';
import { ErrorCode } from 'constants/code';
import { CoinType, Ecosystem, Provider } from 'types/network';
import { AddTokenOpts, Token } from 'types/token';
import { KnownMethodData } from 'background/service/knownMethod';
import { HexString } from 'constants/transaction';
import { CustomGasSettings } from 'types/tx';
import { BigNumberish } from 'ethers';
import { CosmosChainInfo } from 'types/cosmos';
import { KeplrGetKeyResponseInterface } from 'types/keyBase';

export class WalletController extends BaseController {
  isBooted = () => keyringService.isBooted();

  verifyPassword = (password: string) =>
    keyringService.verifyPassword(password);

  sendRequest = (data) => {
    return provider({
      data,
      session: {
        name: 'Teleport',
        origin: INTERNAL_REQUEST_ORIGIN,
        icon: './images/icons/128.png',
      },
    });
  };

  updateAndApproveTransaction = (txMeta) =>
    txController.updateAndApproveTransaction(txMeta);

  getApproval = () => notificationService.getApproval();

  resolveApproval = (data) => notificationService.resolveApproval(data);

  rejectApproval = (data) => notificationService.rejectApproval(data);

  unlock = async (password: string) => {
    await keyringService.submitPassword(password);
    sessionService.broadcastEvent('unlock');
  };

  isUnlocked = () => keyringService.getIsUnlocked();

  lockWallet = async () => {
    await keyringService.setLocked();
    sessionService.broadcastEvent('accountsChanged', []);
    sessionService.broadcastEvent('lock');
  };

  getAllProviders = () => networkPreferenceService.getAllProviders();

  useProviderById = (id: PresetNetworkId | string) => {
    const provider = networkPreferenceService.getProvider(id);
    if (!provider) {
      throw new BitError(
        Object.values(PresetNetworkId).includes(id as PresetNetworkId)
          ? ErrorCode.DEFAULT_NETWORK_PROVIDER_PRESET_MISSING
          : ErrorCode.CUSTOM_NETWORK_PROVIDER_MISSING
      );
    }
    networkPreferenceService.setProviderConfig(provider);
    return provider;
  };

  getCosmosProviderByChainId = (id: string) =>
    networkPreferenceService.getCosmosChainInfo(id);

  moveNetwork = (e: Ecosystem, f: number, d: number) =>
    networkPreferenceService.moveNetwork(e, f, d);

  addCustomNetwork = async (
    nickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string
  ) => {
    const network = networkPreferenceService.addCustomNetwork(
      nickname,
      rpcUrl,
      chainId,
      ticker,
      blockExplorerUrl
    );
    await TokenService.addCustomToken({
      symbol: ticker || 'ETH',
      name: '',
      decimal: 18,
      chainCustomId: network.id,
      isNative: true,
    });

    try {
      networkPreferenceService.setProviderConfig({
        ...network,
        type: 'rpc',
      });
    } catch (error: any) {
      /** @TODO handle potential ACCOUNT_DOES_NOT_EXIST */
      // if (error.code == ErrorCode.ACCOUNT_DOES_NOT_EXIST) {

      // }
      console.error('addCustomNetwork::error: ', error);
    }
    return network;
  };

  addCustomCosmosNetwork = async (chainInfo: CosmosChainInfo) => {
    /** @TODO this is for test only.
     * remove this function only when
     * `window.keplr.suggestChainInfo` was implemented
     */
    try {
      const network = await networkPreferenceService.suggestCosmosChainInfo(
        chainInfo,
        'foo'
      );
      networkPreferenceService.setProviderConfig(network);
      return network;
    } catch (error: any) {
      /** @TODO handle potential ACCOUNT_DOES_NOT_EXIST */
      if (error.code == ErrorCode.ACCOUNT_DOES_NOT_EXIST) {
        console.debug('account not exist, shall create here...');
      }
      console.error('addCustomCosmosNetwork::error: ', error);
    }
  };

  editCustomNetwork = (
    id: string,
    newNickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string,
    coinType = CoinType.ETH,
    chainName = 'ETH'
  ) => {
    networkPreferenceService.editCustomNetwork(
      id,
      newNickname,
      rpcUrl,
      chainId,
      ticker,
      blockExplorerUrl,
      coinType,
      chainName
    );
  };

  removeCustomNetwork = (idToBeRm: string) =>
    networkPreferenceService.removeCustomNetwork(idToBeRm);

  getCurrentNetwork = () => {
    return networkPreferenceService.networkStore.getState();
  };

  getLocale = () => preferenceService.getLocale();

  setLocale = (locale: string) => preferenceService.setLocale(locale);

  useCurrentSelectedNetwork = () => {
    const { provider } = networkPreferenceService.networkStore.getState();
    console.debug('useCurrentSelectedNetwork use provider:', provider);
    // reset once again
    try {
      networkPreferenceService.setProviderConfig(provider);
    } catch (error: any) {
      if (error.code == ErrorCode.ACCOUNT_DOES_NOT_EXIST) {
        /** error will be ignored, as it will 100% occurred in the first time (no account)
         *  but will be log message as warn */
        console.warn('useCurrentSelectedNetwork::error: no account for now');
      } else {
        console.error(
          `useCurrentSelectedNetwork::error #${
            error.code || 'No Error Code'
          }: `,
          error
        );
      }
    }
  };

  getCurrentCurrency = () => preferenceService.getCurrentCurrency();

  getConnectedSite = (session) => permissionService.getConnectedSite(session);

  getConnectedSitesByAccount = (account: string) =>
    permissionService.getConnectedSitesByAccount(account);

  getConnectedSitesByChainId = (chainId: string) =>
    permissionService.getConnectedSitesByChainId(chainId);

  removeConnectedSite = (origin: string, account: string) =>
    permissionService.removeConnectedSite(origin, account);

  removeConnectedSiteByChainId = (origin: string, chainId: string) =>
    permissionService.removeConnectedSiteByChainId(origin, chainId);

  getPrivateKey = async (password: string, hdWalletId: string) => {
    await this.verifyPassword(password);
    return await keyringService.getPrivateKeyByHdWalletId(hdWalletId);
  };

  setPassword = (password?: string) => keyringService.setPassword(password);

  importHdWalletByMnemonic = async (
    opts: Required<CreateAccountOpts>
  ): Promise<void> => {
    this.setPassword(opts.password);
    const account: BaseAccount = await keyringService.createAccount({
      name: opts.name,
      mnemonic: opts.mnemonic as string,
    });
    if (account) {
      keyringService.boot();
      this._setCurrentAccount(account);
    }
  };

  createHdWallet = async (
    opts: Pick<CreateAccountOpts, 'password' | 'name'>
  ): Promise<string> => {
    const mnemonic = await keyringService.generateMnemonic();
    await this.importHdWalletByMnemonic({
      name: opts.name,
      password: opts.password as string,
      mnemonic,
    });
    return mnemonic;
  };

  importKeyringByPrivateKey = async (opts: ImportAccountOpts) => {
    this.setPassword(opts.password);
    const account = await keyringService.createAccountByImportPrivateKey(opts);
    if (account) {
      keyringService.boot();
      return this._setCurrentAccount(account);
    }
  };

  getCurrentChainTokens() {
    const chainCustomId = networkPreferenceService.getProviderConfig().id;
    return TokenService.getAllTokens(chainCustomId);
  }

  getSameChainsByCoinType = (coinType: CoinType) =>
    networkPreferenceService.getSameChainsByCoinType(coinType);

  changeAccount = (account: BaseAccount) =>
    preferenceService.setCurrentAccount(account);

  changeAccountByWalletId = (
    hdWalletId: string,
    ecosystem: Ecosystem,
    accountCreateType: AccountCreateType
  ) => {
    return keyringService.changeAccountByWallet(
      hdWalletId,
      ecosystem,
      accountCreateType
    );
  };

  addCurrentChainAccountByWalletId = async (hdWalletId) => {
    const account = await keyringService.addCurrentChainAccountByWalletId(
      hdWalletId
    );
    if (account) {
      keyringService.boot();
      return this._setCurrentAccount(account);
    }
  };

  isDefaultWallet = () => preferenceService.getIsDefaultWallet();

  setIsDefaultWallet = (val: boolean) =>
    preferenceService.setIsDefaultWallet(val);

  _setCurrentAccount = async (account: BaseAccount) => {
    preferenceService.setCurrentAccount(account);
  };

  public removeHdWalletsByHdWalletId(name: string): Promise<void> {
    return keyringService.removeHdWalletsByHdWalletId(name);
  }

  public renameHdWalletByHdWalletId(
    hdWalletId: string,
    name: string
  ): Promise<boolean> {
    return keyringService.renameHdWalletByHdWalletId(hdWalletId, name);
  }

  public getPrivateKeyByHdWalletId(
    hdWalletId: string,
    address?: string
  ): Promise<string> {
    return keyringService.getPrivateKeyByHdWalletId(hdWalletId, address);
  }

  public getMnemonicByHdWalletId(name: string): Promise<string> {
    return keyringService.getMnemonicByHdWalletId(name);
  }

  public addNewDisplayAccountByExistKeyring(
    hdWalletId: string,
    accountName: string
  ): Promise<boolean> {
    let hdWalletName = '';
    const currentHdWalletIdAccounts = keyringService
      .getAccountAllList()
      .filter((a: BaseAccount) => a.hdWalletId === hdWalletId);
    if (currentHdWalletIdAccounts && currentHdWalletIdAccounts.length > 0) {
      hdWalletName = currentHdWalletIdAccounts[0].hdWalletName;
    }
    return keyringService.addAccount({
      hdWalletId,
      hdWalletName,
      accountName,
    });
  }

  public deleteDisplayAccountByExistKeyringAndIndex(
    hdWalletId: string,
    addressIndex: number
  ): Promise<void> {
    return keyringService.deleteDisplayAccount(hdWalletId, addressIndex);
  }

  public deleteAccountsByChainCustomId(chainCustomId: string): Promise<void> {
    return keyringService.deleteAccountsByChainCustomId(chainCustomId);
  }

  public renameDisplayAccount(
    hdWalletId: string,
    name: string,
    addressIndex: number
  ): Promise<boolean> {
    return keyringService.renameDisplayAccount(hdWalletId, name, addressIndex);
  }

  getAccountList(useCurrentChain?: boolean): Promise<DisplayWalletManage> {
    return Promise.resolve(keyringService.getAccountList(useCurrentChain));
  }

  getWalletList(useCurrentEcosystem?: boolean): Promise<HdAccountStruct[]> {
    return Promise.resolve(keyringService.getWalletList(useCurrentEcosystem));
  }

  getCurrentChainAccounts(): Promise<BaseAccount[]> {
    return keyringService.getCurrentChainAccounts();
  }

  getAccountByAddress(hexAddress: HexString): Promise<BaseAccount | undefined> {
    const find = keyringService
      .getAccountAllList()
      .find((ac) => ac.address === hexAddress);
    return Promise.resolve(find);
  }

  getAccountListByHdWalletId(hdWalletId: string): Promise<BaseAccount[]> {
    return Promise.resolve(
      keyringService.getAccountListByHdWalletId(hdWalletId)
    );
  }

  getCurrentChain(): Provider {
    return networkPreferenceService.getProviderConfig();
  }

  getTokenBalancesAsync = (): Promise<Token[]> => {
    const account = preferenceService.getCurrentAccount();
    const { id, ecosystem } = this.getCurrentChain();
    if (account) {
      return TokenService.getBalancesAsync(account.address, id, ecosystem);
    } else {
      return Promise.reject(new Error('no account found'));
    }
  };

  getTokenBalancesSync = (
    chainId?: PresetNetworkId | string,
    address?: string
  ): Promise<Token[]> => {
    let customChainId, tempAddress;
    const { id } = this.getCurrentChain();
    if (chainId) {
      const chains: Provider[] = networkPreferenceService.getSupportProviders();
      const chain: Provider | undefined = chains.find(
        (c: Provider) => c.chainId === chainId
      );
      if (chain) customChainId = chain.id;
    } else {
      customChainId = id;
    }
    if (address) {
      tempAddress = address;
    } else {
      const account = preferenceService.getCurrentAccount();
      if (account) {
        tempAddress = account.address;
      } else {
        return Promise.reject(new Error('no account found'));
      }
    }
    if (customChainId && tempAddress) {
      return TokenService.getBalancesSync(tempAddress, customChainId);
    } else {
      return Promise.reject(new Error('no account found'));
    }
  };

  getTokenBalanceAsync = (tokenId?: string): Promise<Token | undefined> => {
    if (!tokenId) {
      const currentChainTokens: Token[] = this.getCurrentChainTokens();
      if (currentChainTokens && currentChainTokens.length) {
        tokenId = currentChainTokens.find((t: Token) => t.isNative)?.tokenId;
      }
      if (!tokenId) return Promise.reject(new Error('no token id found'));
    }
    const account = preferenceService.getCurrentAccount();
    if (account) {
      return TokenService.getBalanceAsync(account.address, tokenId);
    } else {
      return Promise.reject(new Error('no account found'));
    }
  };

  getTokenBalanceSync = (tokenId?: string): Promise<Token | undefined> => {
    if (!tokenId) {
      const currentChainTokens: Token[] = this.getCurrentChainTokens();
      if (currentChainTokens && currentChainTokens.length) {
        tokenId = currentChainTokens.find((t: Token) => t.isNative)?.tokenId;
      }
      if (!tokenId) return Promise.reject(new Error('no token id found'));
    }
    const account = preferenceService.getCurrentAccount();
    if (account) {
      return TokenService.getBalanceSync(account.address, tokenId);
    } else {
      return Promise.reject(new Error('no account found'));
    }
  };

  queryToken = (chainCustomId: string, contractAddress: string) => {
    const account = preferenceService.getCurrentAccount();
    if (account) {
      return TokenService.queryToken(
        account.address,
        chainCustomId,
        contractAddress
      );
    } else {
      return Promise.reject(new Error('no account found'));
    }
  };

  setTokenDisplay(tokenId: string, display: boolean): Promise<boolean> {
    return TokenService.setTokenDisplay(tokenId, display);
  }

  addCustomToken(tokenParams: AddTokenOpts): Promise<boolean> {
    return TokenService.addCustomToken(tokenParams);
  }

  queryTokenPrices = (tokenId?: string) =>
    TokenService.queryTokenPrices('usd', tokenId);

  getKey(chainId): KeplrGetKeyResponseInterface | null {
    return keyringService.getKeplrCompatibleKey(chainId);
  }

  generateMissedAccounts() {
    return keyringService.generateMissedAccounts();
  }

  hasMissedAccounts() {
    const missed = keyringService.getMissedAccountsForAllChain();
    return missed.length > 0;
  }

  providers() {
    console.log(networkPreferenceService.getProviderConfig());
    console.log(networkPreferenceService.getAllProviders());
  }
  estimateGas(estimateGasParams) {
    return new Promise((resolve, reject) => {
      const ethQuery = networkPreferenceService.getCurrentEth();
      return ethQuery.estimateGas(estimateGasParams, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res.toString(16));
      });
    });
  }
  readAddressAsContract = async (address) => {
    let contractCode;
    try {
      contractCode = await networkController.getCurrentEth().getCode(address);
    } catch (e) {
      contractCode = null;
    }

    const isContractAddress =
      contractCode && contractCode !== '0x' && contractCode !== '0x0';
    return { contractCode, isContractAddress };
  };
  testSendEvent() {
    txController.testSendEvent();
  }
  getGasFeeEstimatesAndStartPolling(pollToken) {
    return gasFeeController.getGasFeeEstimatesAndStartPolling(pollToken);
  }
  getGasFeeTimeEstimate = (
    maxPriorityFeePerGas: string,
    maxFeePerGas: string
  ) => gasFeeController.getTimeEstimate(maxPriorityFeePerGas, maxFeePerGas);
  fetchGasFeeEstimates() {
    return gasFeeController.fetchGasFeeEstimates();
  }
  async newUnapprovedTransaction(txParams, opts) {
    return await txController.newUnapprovedTransaction(txParams, opts);
  }
  getUnapprovedTxCount() {
    return txController.getUnapprovedTxCount();
  }
  getTxState() {
    return txController.getState();
  }
  cancelTransaction(txId: string) {
    return txController.cancelTransaction(txId);
  }
  updateTransaction = (data: any) => txController.updateTransaction(data);
  createCancelTransaction(
    originalTxId: string,
    customGasSettings: CustomGasSettings,
    options: any = {}
  ) {
    return txController.createCancelTransaction(
      originalTxId,
      customGasSettings,
      options
    );
  }
  createSpeedUpTransaction(
    originalTxId: string,
    customGasSettings: CustomGasSettings,
    options: any = {}
  ) {
    return txController.createSpeedUpTransaction(
      originalTxId,
      customGasSettings,
      options
    );
  }
  setPopupOpen(val: boolean) {
    preferenceService.setPopupOpen(val);
  }
  addKnownMethodData = (fourBytePrefix: string, data: KnownMethodData) => {
    return knownMethodService.addKnownMethodData(fourBytePrefix, data);
  };
  getTxHistory() {
    return txController.txStateManager.getTransactionList();
  }
  addContact = (data: ContactBookItem) => {
    contactBookService.addContact(data);
  };
  fetchLatestBlockDataNow() {
    return latestBlockDataHub.fetchLatestBlockNow();
  }
  addContactByDefaultName = (address) => {
    contactBookService.addContactByDefaultName(address);
  };
  updateContact = (data: ContactBookItem) => {
    contactBookService.updateContact(data);
  };
  removeContact = (address: string) => {
    contactBookService.removeContact(address);
  };
  listContact = () => contactBookService.listContacts();
  getContactByAddress = (address: string) =>
    contactBookService.getContactByAddress(address);

  getManualLocked = () => preferenceService.getManualLocked();

  setManualLocked = (locked: boolean) =>
    preferenceService.setManualLocked(locked);
  generateCosmosMsg = async (
    amount: string,
    currency,
    recipient: string,
    memo = '',
    stdFee = {}
  ) => {
    return await cosmosTxController.cosmos.generateMsg(
      amount,
      currency,
      recipient,
      memo,
      stdFee
    );
  };
  sendCosmosToken = async (
    amount: string,
    currency,
    recipient: string,
    memo = '',
    stdFee = {},
    signOptions,
    onTxEvents
  ) => {
    await cosmosTxController.cosmos.processSendToken(
      amount,
      currency,
      recipient,
      memo,
      stdFee,
      signOptions,
      onTxEvents
    );
  };

  getCosmosStdFee = (feeType, sendCurrency) => {
    return cosmosFeeService.toStdFee(feeType, sendCurrency);
  };
  getCosmosFeeTypePrimitive = (feeType, sendCurrency) => {
    return cosmosFeeService.getFeeTypePrimitive(feeType, sendCurrency);
  };
  getCosmosFeeTypePretty = (feeType, sendCurrency) => {
    return cosmosFeeService.getFeeTypePretty(feeType, sendCurrency);
  };
}

export default new WalletController();
