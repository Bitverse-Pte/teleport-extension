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
} from 'background/service';
import { ContactBookItem } from '../service/contactBook';
import BaseController from './base';
import { INTERNAL_REQUEST_ORIGIN } from 'constants/index';
import {
  BaseAccount,
  CreateAccountOpts,
  DisplayAccountManage,
  DisplayWalletManage,
  ImportAccountOpts,
} from 'types/extend';
import provider from './provider';
import BitError from 'error';
import { defaultNetworks } from 'constants/defaultNetwork';
import { ErrorCode } from 'constants/code';
import { CoinType, Provider } from 'types/network';
import { AddTokenOpts, Token } from 'types/token';
import { KnownMethodData } from 'background/service/knownMethod';
import { HexString } from 'constants/transaction';
import { BigNumberish } from 'ethers';

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

  useDefaultNetwork = (chain: string) => {
    const network = defaultNetworks[chain];
    if (!network) {
      throw new BitError(ErrorCode.DEFAULT_NETWORK_PROVIDER_PRESET_MISSING);
    }
    return networkPreferenceService.setProviderConfig(network);
  };

  getAllProviders = () => networkPreferenceService.getAllProviders();

  fetchCustomProviders = () => networkPreferenceService.getCustomNetworks();

  useCustomNetwork = (idx: number) => {
    const network = networkPreferenceService.getCustomNetworks()[idx];
    return networkPreferenceService.setProviderConfig({
      ...network,
      type: 'rpc',
    });
  };

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

    return network;
  };

  findCustomNetwork = (nickname: string) => {
    const matchedIdx = networkPreferenceService
      .getCustomNetworks()
      .findIndex((n) => n.nickname === nickname);
    if (matchedIdx === -1) {
      throw new BitError(ErrorCode.CUSTOM_NETWORK_PROVIDER_MISSING);
    }
    return matchedIdx;
  };

  editCustomNetwork = (
    matchedIdx: number,
    newNickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string,
    coinType = CoinType.ETH,
    chainName = 'ETH'
  ) => {
    const state = networkPreferenceService.getCustomNetworks();
    const isSymbolChanged = ticker != state[matchedIdx].ticker;
    if (isSymbolChanged) {
      // change symbol of custom token
      TokenService.changeCustomTokenProfile(state[matchedIdx].id, {
        symbol: ticker,
      });
    }
    state[matchedIdx] = {
      ...state[matchedIdx],
      nickname: newNickname,
      rpcUrl,
      chainId,
      coinType,
      ticker,
      chainName,
      rpcPrefs: {
        blockExplorerUrl,
      },
    };
    networkPreferenceService.customNetworksStore.putState(state);
  };

  removeCustomNetwork = (idxToBeRm: number) => {
    const originalList = networkPreferenceService.getCustomNetworks();
    networkPreferenceService.customNetworksStore.putState(
      originalList.filter((_, idx) => idx !== idxToBeRm)
    );
  };

  getCurrentNetwork = () => {
    return networkPreferenceService.networkStore.getState();
  };

  getLocale = () => preferenceService.getLocale();

  setLocale = (locale: string) => preferenceService.setLocale(locale);

  useCurrentSelectedNetwork = () => {
    const { provider } = networkPreferenceService.networkStore.getState();
    console.debug('useCurrentSelectedNetwork use provider:', provider);
    // reset once again
    networkPreferenceService.setProviderConfig(provider);
  };

  getCurrentCurrency = () => preferenceService.getCurrentCurrency();

  getConnectedSite = (session) => permissionService.getConnectedSite(session);

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

  public getPrivateKeyByHdWalletId(name: string): Promise<string> {
    return keyringService.getPrivateKeyByHdWalletId(name);
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

  getTokenBalancesAsync = (showHideToken?: boolean): Promise<Token[]> => {
    const account = preferenceService.getCurrentAccount();
    let chainCustomId;
    const currentProvider = this.getCurrentChain();
    if (currentProvider) chainCustomId = currentProvider.id;
    if (account) {
      return TokenService.getBalancesAsync(
        account.address,
        chainCustomId
        //showHideToken
      );
    } else {
      return Promise.reject(new Error('no account found'));
    }
  };

  getTokenBalancesSync = (showHideToken?: boolean): Promise<Token[]> => {
    const account = preferenceService.getCurrentAccount();
    let chainCustomId;
    const currentProvider = this.getCurrentChain();
    if (currentProvider) chainCustomId = currentProvider.id;
    if (account && chainCustomId) {
      return TokenService.getBalancesSync(
        account.address,
        chainCustomId
        //showHideToken
      );
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

  queryToken = (rpc: string, contractAddress: string) => {
    const account = preferenceService.getCurrentAccount();
    if (account) {
      return TokenService.queryToken(account.address, rpc, contractAddress);
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

  getChains = () => networkPreferenceService.getAllProviders();

  queryTokenPrices = () => TokenService.queryTokenPrices();

  // TODO (Jayce) follows are test code
  testUnlock = () => this.unlock('Q1!qqqqq');

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
  getGasFeeTimeEstimate = (maxPriorityFeePerGas: string, maxFeePerGas: string) =>
    gasFeeController.getTimeEstimate(maxPriorityFeePerGas, maxFeePerGas);
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
}

export default new WalletController();
