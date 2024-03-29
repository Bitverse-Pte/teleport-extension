import { CHAINS, CHAIN_TO_RPC_URL_MAP } from 'constants/chain';
import {
  getDefaultNetworkIdsByEcoSystem,
  defaultNetworks,
  PresetNetworkId,
} from 'constants/defaultNetwork';
import {
  CoinType,
  Ecosystem,
  Network,
  NetworkBg2UIMessage,
  NetworkController,
  Provider,
} from 'types/network';
import { ErrorCode } from 'constants/code';
import BitError from 'error';
import { providerFromEngine } from 'eth-json-rpc-middleware';
import Eth from 'ethjs';
import {
  keyringService,
  preferenceService,
  sessionService,
  TokenService,
} from '../index';
import { ObservableStorage } from '../../utils/obsStorage';
import EventEmitter from 'events';
import log from 'loglevel';
import { PollingBlockTracker } from 'eth-block-tracker';
import {
  INFURA_BLOCKED_KEY,
  INFURA_PROVIDER_TYPES,
  NETWORK_TYPE_RPC,
  NETWORK_TYPE_TO_ID_MAP,
} from 'constants/network';
import createInfuraClient from './createInfuraClient';
import createJsonRpcClient from './createJsonRpcClient';
import { JsonRpcEngine } from 'json-rpc-engine';
import EthQuery from 'eth-query';
import assert from 'assert';
import createMetamaskMiddleware, {
  CreateMetamaskMiddlewareParams,
} from './createMetamaskMiddleware';
import getFetchWithTimeout from 'utils/fetch-with-timeout';
import { isPrefixedFormattedHexString, isSafeChainId } from './util';
import {
  createSwappableProxy,
  createEventEmitterProxy,
} from 'swappable-obj-proxy';
const env = process.env.METAMASK_ENV;
const fetchWithTimeout = getFetchWithTimeout(1000 * 30);
import {
  RINKEBY,
  MAINNET,
  MAINNET_CHAIN_ID,
  RINKEBY_CHAIN_ID,
} from 'constants/network';
import { ComposedStore, ObservableStore } from '@metamask/obs-store';
import { ComposedStorage } from 'background/utils/obsComposeStore';
import { nanoid } from 'nanoid';
import { parseStringTemplate } from 'utils/string';
import { addHexPrefix } from 'ethereumjs-util';
import { AccountCreateType, BaseAccount } from 'types/extend';
// import { ChainUpdaterService, InteractionService } from '../cosmos';
import { ChainIdHelper } from 'utils/cosmos/chainId';
import { CosmosChainInfo } from 'types/cosmos';
import { parsedKeplrChainInfoAsTeleportCosmosProvider } from '../cosmos/utils/provider.utils';
import { ChainInfoSchema } from './cosmos/validation/chainInfoSchema';
import { CosmosChainUpdaterService } from './cosmos/updater';

const toHexString = (val: string | number) =>
  addHexPrefix(Number(val).toString(16));

let defaultProviderConfigOpts = defaultNetworks['ethereum'] as Provider;
if (process.env.IN_TEST === 'true') {
  defaultProviderConfigOpts = defaultNetworks['rinkeby'] as Provider;
}

const defaultProviderConfig: Provider = {
  ticker: 'ETH',
  ...defaultProviderConfigOpts,
};

const defaultNetworkDetailsState = {
  EIPS: { 1559: false },
};

export const NETWORK_EVENTS = {
  // Fired after the actively selected network is changed
  NETWORK_DID_CHANGE: 'networkDidChange',
  // Fired when the actively selected network *will* change
  NETWORK_WILL_CHANGE: 'networkWillChange',
  // Fired when Infura returns an error indicating no support
  INFURA_IS_BLOCKED: 'infuraIsBlocked',
  // Fired when not using an Infura network or when Infura returns no error, indicating support
  INFURA_IS_UNBLOCKED: 'infuraIsUnblocked',
};

interface CustomNetworkList {
  // ecosystem => list of network
  networks: Network[];

  // ecosytems => list of network's ID by order
  orderOfNetworks: Record<Ecosystem, string[]>;
}

type OldCustomNetworks = Record<number, Network>;
function isOldCustomNetworksStore(
  a: CustomNetworkList | OldCustomNetworks
): a is OldCustomNetworks {
  return !(a as CustomNetworkList).orderOfNetworks;
}

interface NetworkPreferenceStore {
  customNetworks: CustomNetworkList;
  networkController: NetworkController;
}

//                        Chain ID => EIP1559 implement status
type StatusBookFor1559Impl = Record<string, boolean | undefined>;

class NetworkPreferenceService extends EventEmitter {
  // persistence storage
  // _store!: ObservableStorage<NetworkPreferenceStore>;
  networkStore: ObservableStore<NetworkController>;
  customNetworksStore: ObservableStore<CustomNetworkList>;
  impl1559Status!: ObservableStorage<StatusBookFor1559Impl>;

  // metamask required
  _infuraProjectId: string | null = null;
  _baseProviderParams!: CreateMetamaskMiddlewareParams;
  private _providerProxy: ReturnType<typeof createSwappableProxy>;
  private _blockTrackerProxy: ReturnType<typeof createEventEmitterProxy> | null;
  private _blockTracker!: PollingBlockTracker | null;
  private _provider!: any;
  private _store: ComposedStorage<NetworkPreferenceStore>;
  cosmosChainUpdater: CosmosChainUpdaterService;

  // UI communication

  constructor() {
    // protected readonly interactionKeeper: InteractionService,
    // protected readonly chainUpdaterKeeper: ChainUpdaterService,
    super();

    this.customNetworksStore = new ObservableStore<CustomNetworkList>({
      networks: [
        {
          id: PresetNetworkId.TELE_TEST,
          nickname: 'Teleport Testnet',
          rpcUrl: 'https://evm-rpc.testnet.teleport.network',
          rpcPrefs: {
            blockExplorerUrl: 'https://evm-explorer.testnet.teleport.network',
          },
          chainId: '0x1f41',
          ticker: 'TELE',
          chainName: 'ETH',
          coinType: CoinType.ETH,
          ecosystem: Ecosystem.EVM,
          prefix: '0x',
        },
      ],
      orderOfNetworks: {
        [Ecosystem.EVM]: [
          ...getDefaultNetworkIdsByEcoSystem(Ecosystem.EVM),
          PresetNetworkId.TELE_TEST,
        ],
        [Ecosystem.COSMOS]: [
          ...getDefaultNetworkIdsByEcoSystem(Ecosystem.COSMOS),
        ],
        [Ecosystem.POLKADOT]: [
          ...getDefaultNetworkIdsByEcoSystem(Ecosystem.POLKADOT),
        ],
      },
    });
    this.networkStore = new ObservableStore<NetworkController>({
      network: '0x1',
      provider: defaultProviderConfig,
      networkDetails: {
        // change this if you change predefined `networkController.provider`
        // ETH Mainnet is 1559 active
        EIPS: { '1559': true },
      },
    });
    this._store = new ComposedStorage<NetworkPreferenceStore>(
      'network_preference',
      {
        networkController: this.networkStore,
        customNetworks: this.customNetworksStore,
      }
    );
    this.impl1559Status = new ObservableStorage('EIP1559NetworkImplCache', {
      // ETH Mainnet is widely known for implement EIP 1559
      '0x1': true,
    });

    this._store.subscribe((state) => {
      console.debug(
        'NetworkPreferenceService::ComposedStorage is updated, current state',
        state
      );
    });
    this.on(NETWORK_EVENTS.NETWORK_DID_CHANGE, this.lookupNetwork);

    /**
     * Cosmos related
     */
    this.cosmosChainUpdater = new CosmosChainUpdaterService(this);

    setTimeout(this._customNetworkStoreMigration.bind(this), 5 * 1000);
  }

  /**
   * @todo: remove this in next release
   */
  private _customNetworkStoreMigration() {
    console.debug('_customNetworkStoreMigration start');
    const customNetworks = this.customNetworksStore.getState() as
      | CustomNetworkList
      | OldCustomNetworks;
    if (isOldCustomNetworksStore(customNetworks)) {
      const networks = Object.values(customNetworks);
      this.customNetworksStore.updateState({
        networks: networks,
        orderOfNetworks: {
          [Ecosystem.EVM]: [
            ...getDefaultNetworkIdsByEcoSystem(Ecosystem.EVM),
            ...networks.map((n) => n.id),
          ],
          [Ecosystem.COSMOS]: [
            ...getDefaultNetworkIdsByEcoSystem(Ecosystem.COSMOS),
          ],
          [Ecosystem.POLKADOT]: [
            ...getDefaultNetworkIdsByEcoSystem(Ecosystem.POLKADOT),
          ],
        },
      });
    } else {
      console.debug('No more migration');
    }

    const { networks } = this.customNetworksStore.getState();
    const migratedNetworks = networks.map((n) => {
      const updatedObj = { ...n };
      /**
       * Fix `chainId` issues with
       * - uncessary padding 0
       * - pure decimal number
       */
      if (!updatedObj.ecosystem) {
        /**
         * issue due to type changes, fix `undefined` to avoid future errors
         */
        updatedObj.ecosystem = Ecosystem.EVM;
      }
      if (updatedObj.ecosystem === Ecosystem.EVM) {
        updatedObj.chainId = toHexString(n.chainId);
      }
      return updatedObj;
    });
    this.customNetworksStore.updateState({
      networks: migratedNetworks,
    });

    /**
     * new preset network migration need to implement
     * migration on `orderOfNetworks` too
     */
    const { orderOfNetworks } = this.customNetworksStore.getState();
    const presetNids: Record<Ecosystem, string[]> = {
      [Ecosystem.EVM]: getDefaultNetworkIdsByEcoSystem(Ecosystem.EVM),
      [Ecosystem.COSMOS]: getDefaultNetworkIdsByEcoSystem(Ecosystem.COSMOS),
      [Ecosystem.POLKADOT]: getDefaultNetworkIdsByEcoSystem(Ecosystem.POLKADOT),
    };
    const _tmpNetworkOrder = { ...orderOfNetworks };
    (Object.keys(orderOfNetworks) as Ecosystem[]).map((ecoSystem) => {
      const notInList = presetNids[ecoSystem].filter(
        (n) => !orderOfNetworks[ecoSystem].includes(n)
      );
      if (notInList.length > 0)
        _tmpNetworkOrder[ecoSystem] = [
          ..._tmpNetworkOrder[ecoSystem],
          ...notInList,
        ];
    });
    this.customNetworksStore.updateState({
      orderOfNetworks: _tmpNetworkOrder,
    });

    /**
     * update (if) current cosmos provider
     */
    const currentProvider = this.getProviderConfig();
    if (currentProvider.ecosystem === Ecosystem.COSMOS) {
      const updatedProvider =
        this.cosmosChainUpdater.putUpdatedPropertyToProvider(currentProvider);
      this.setProviderConfig(updatedProvider);
    }
  }

  checkIsCustomNetworkNameLegit(newNickname: string) {
    const nicknames = this._getCustomNetworks().map((n) => n.nickname);
    if (nicknames.includes(newNickname)) {
      throw new BitError(ErrorCode.CUSTOM_NETWORK_NAME_DUPLICATED);
    }
  }

  addCustomEthereumProvider(
    nickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string,
    coinType = CoinType.ETH,
    chainName = 'ETH',
    ecosystem = Ecosystem.EVM,
    prefix = '0x'
  ) {
    this.checkIsCustomNetworkNameLegit(nickname);
    const network: Network = {
      id: nanoid(),
      nickname,
      rpcPrefs: {
        blockExplorerUrl,
      },
      rpcUrl,
      chainId: toHexString(chainId),
      coinType,
      chainName,
      ticker,
      ecosystem,
      prefix,
    };
    const { networks, orderOfNetworks } = this.customNetworksStore.getState();
    this.customNetworksStore.updateState({
      networks: [...networks, network],
      orderOfNetworks: {
        ...orderOfNetworks,
        [ecosystem]: [...orderOfNetworks[ecosystem], network.id],
      },
    });
    return network;
  }

  moveNetwork(
    ecoSystem: Ecosystem,
    fromIndex: number,
    destinationIndex: number
  ) {
    const { orderOfNetworks } = this.customNetworksStore.getState();
    const reorderedNetworkCategory = Array.from(orderOfNetworks[ecoSystem]);

    const tmpNetworkId = reorderedNetworkCategory[fromIndex];

    // remove the source item
    reorderedNetworkCategory.splice(fromIndex, 1);
    // and insert after the destination
    reorderedNetworkCategory.splice(destinationIndex, 0, tmpNetworkId);
    this.customNetworksStore.updateState({
      orderOfNetworks: {
        ...orderOfNetworks,
        [ecoSystem]: reorderedNetworkCategory,
      },
    });
  }

  editCustomEthereumProvider(
    providerId: string,
    newNickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string,
    coinType = CoinType.ETH,
    chainName = 'ETH'
  ) {
    const networks = this._getCustomNetworks();
    const matchedProvider = this._getCustomNetwork(providerId);

    if (!matchedProvider) {
      throw new BitError(ErrorCode.CUSTOM_NETWORK_PROVIDER_MISSING);
    }
    const matchedIdx = networks.findIndex((n) => n.id === matchedProvider.id);

    const isSymbolChanged = ticker != matchedProvider.ticker;
    if (isSymbolChanged) {
      // change symbol of custom token
      TokenService.changeCustomTokenProfile(matchedProvider.id, {
        symbol: ticker,
      });
    }
    const newSettings = {
      ...matchedProvider,
      nickname: newNickname,
      rpcUrl,
      chainId: toHexString(chainId),
      coinType,
      ticker,
      chainName,
      rpcPrefs: {
        blockExplorerUrl,
      },
    };
    networks[matchedIdx] = newSettings;
    this.customNetworksStore.updateState({
      networks,
    });

    try {
      this.setProviderConfig({
        ...newSettings,
        type: 'rpc',
      });
    } catch (error: any) {
      if (error.code == ErrorCode.ACCOUNT_DOES_NOT_EXIST) {
        /** error will be ignored, as it will 100% occurred in the first time (no account)
         *  but will be log message as warn */
        console.warn('editCustomNetwork::error: no account for now');
      } else {
        console.error(
          `editCustomNetwork::error #${error.code || 'No Error Code'}: `,
          error
        );
      }
    }
    return newSettings;
  }

  async removeCustomNetwork(idToBeRm: string): Promise<boolean> {
    const { networks, orderOfNetworks } = this.customNetworksStore.getState();
    const providerToBeRemoved = this._getCustomNetwork(idToBeRm);
    if (!providerToBeRemoved) {
      throw new BitError(ErrorCode.CUSTOM_NETWORK_PROVIDER_MISSING);
    }
    const removedCustomNetworks = networks.filter(
      (n) => n.id !== providerToBeRemoved.id
    );
    /**
     * Cleanup account for old provider
     * only when it's a Cosmos Provider
     */
    if (providerToBeRemoved.ecosystem === Ecosystem.COSMOS) {
      await keyringService.deleteAccountsByChainCustomId(
        providerToBeRemoved.id
      );
      TokenService.removeTokensByCustomChainId(providerToBeRemoved.id);
    }
    const removedCustomOrdering = orderOfNetworks[
      providerToBeRemoved.ecosystem
    ].filter((nId) => nId !== providerToBeRemoved.id);
    this.customNetworksStore.updateState({
      networks: removedCustomNetworks,
      orderOfNetworks: {
        ...orderOfNetworks,
        [providerToBeRemoved.ecosystem]: removedCustomOrdering,
      },
    });
    // is rm successful
    return networks.length > removedCustomNetworks.length;
  }

  private _getCustomNetworks(): Network[] {
    const { networks } = this.customNetworksStore.getState();
    return networks;
  }

  private _getCustomNetwork(id: string): Network | undefined {
    const networks = this._getCustomNetworks();
    return networks.find((n) => n.id === id);
  }

  isChainEnable1559(chainId: string): boolean {
    const cache = this.impl1559Status.getState();
    return cache[chainId] === true;
  }

  cacheChainEnable1559(chainId: string) {
    const network = {};
    network[chainId] = true;
    this.impl1559Status.updateState(network);
  }

  async markCurrentNetworkEIPStatus(name: string, isEnabled: boolean) {
    const { networkDetails } = this.networkStore.getState();
    if (networkDetails.EIPS[name] === isEnabled) {
      /**
       * avoid useless data push of `ObservableStore`
       * only change the state if they are not equal
       */
      return;
    }
    networkDetails.EIPS[name] = isEnabled;
    this.networkStore.updateState({
      networkDetails,
    });
  }

  /**
   * These are moved from metamask's network.js
   *
   *
   *
   */

  /**
   * Sets the Infura project ID
   *
   * @param {string} projectId - The Infura project ID
   * @throws {Error} if the project ID is not a valid string
   * @return {void}
   */
  setInfuraProjectId(projectId: string): void {
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('Invalid Infura project ID');
    }

    this._infuraProjectId = projectId;
  }

  initializeProvider(providerParams: CreateMetamaskMiddlewareParams) {
    this._baseProviderParams = providerParams;
    const { type, rpcUrl, chainId } = this.getProviderConfig();
    this._configureProvider({ type, rpcUrl, chainId });
    this.lookupNetwork();
  }

  // return the proxies so the references will always be good
  getProviderAndBlockTracker() {
    const provider = this._providerProxy;
    const blockTracker = this._blockTrackerProxy;
    return { provider, blockTracker };
  }

  /**
   * Method to return the latest block for the current network
   * @returns {Object} Block header
   */
  getLatestBlock(): Promise<any> {
    return new Promise((resolve, reject) => {
      const { provider } = this.getProviderAndBlockTracker();
      const ethQuery = new EthQuery(provider);
      ethQuery.sendAsync(
        { method: 'eth_getBlockByNumber', params: ['latest', false] },
        (err, block) => {
          if (err) {
            return reject(err);
          }
          return resolve(block);
        }
      );
    });
  }

  /**
   * Method to check if the block header contains fields that indicate EIP 1559
   * support (baseFeePerGas).
   * @returns {Promise<boolean>} true if current network supports EIP 1559
   */
  async getEIP1559Compatibility(): Promise<boolean> {
    const { EIPS } = this.networkStore.getState().networkDetails;
    if (EIPS[1559] !== undefined) {
      // only return directly if true, otherwise query
      return EIPS[1559];
    }

    const latestBlock = await this.getLatestBlock();
    const supportsEIP1559 =
      latestBlock && latestBlock.baseFeePerGas !== undefined;
    this.setNetworkEIPSupport(1559, supportsEIP1559);
    return supportsEIP1559;
  }

  verifyNetwork() {
    // Check network when restoring connectivity:
    if (this.isNetworkLoading()) {
      this.lookupNetwork();
    }
  }

  getNetworkState() {
    return this.networkStore.getState().network;
  }

  setNetworkState(network: string) {
    this.networkStore.updateState({
      network,
    });
  }

  /**
   * Set EIP support indication in the networkDetails store
   * @param {number|string} EIPNumber - The number of the EIP to mark support for
   * @param {boolean} isSupported - True if the EIP is supported
   */
  setNetworkEIPSupport(EIPNumber: number | string, isSupported: boolean) {
    const { networkDetails } = this.networkStore.getState();
    networkDetails.EIPS[EIPNumber] = isSupported;
    this.networkStore.updateState({
      networkDetails,
    });
  }

  /**
   * Reset EIP support to default (no support)
   */
  clearNetworkDetails() {
    this.networkStore.updateState({
      networkDetails: { ...defaultNetworkDetailsState },
    });
  }

  isNetworkLoading() {
    return this.getNetworkState() === 'loading';
  }

  lookupNetwork() {
    // Prevent firing when provider is not defined.
    if (!this._provider) {
      log.warn(
        'NetworkController - lookupNetwork aborted due to missing provider'
      );
      return;
    }
    const { type, ecosystem } = this.getProviderConfig();
    if (ecosystem !== Ecosystem.EVM) {
      console.warn(
        'Skipped lookupNetwork, because it is designed for EVM provider'
      );
      return;
    }

    const chainId = this.getCurrentChainId();
    if (!chainId) {
      log.warn(
        'NetworkController - lookupNetwork aborted due to missing chainId'
      );
      this.setNetworkState('loading');
      // keep network details in sync with network state
      this.clearNetworkDetails();
      return;
    }

    // Ping the RPC endpoint so we can confirm that it works
    const ethQuery = new EthQuery(this._provider);
    const initialNetwork = this.getNetworkState();
    const isInfura = INFURA_PROVIDER_TYPES.includes(type);

    if (isInfura) {
      const _tmpInfuraType = type === 'ethereum' ? 'mainnet' : type;
      this._checkInfuraAvailability(_tmpInfuraType);
    } else {
      this.emit(NETWORK_EVENTS.INFURA_IS_UNBLOCKED);
    }

    ethQuery.sendAsync({ method: 'net_version' }, (err, networkVersion) => {
      const currentNetwork = this.getNetworkState();
      if (initialNetwork === currentNetwork) {
        if (err) {
          this.setNetworkState('loading');
          // keep network details in sync with network state
          this.clearNetworkDetails();
          return;
        }

        this.setNetworkState(networkVersion);
        // look up EIP-1559 support
        this.getEIP1559Compatibility();
      }
    });
  }

  getCurrentChainId() {
    const { type, chainId: configChainId } = this.getProviderConfig();
    return NETWORK_TYPE_TO_ID_MAP[type]?.chainId || configChainId;
  }

  // /**
  //  * @deprecated, use setProviderConfig will do
  //  * @param id
  //  * @param rpcUrl
  //  * @param chainId
  //  * @param ticker
  //  * @param nickname
  //  * @param rpcPrefs
  //  */
  // setRpcTarget(
  //   id: string,
  //   rpcUrl: string,
  //   chainId: string,
  //   ticker = 'ETH',
  //   nickname = '',
  //   rpcPrefs: { blockExplorerUrl?: string } = {}
  // ) {
  //   assert.ok(
  //     isPrefixedFormattedHexString(chainId),
  //     `Invalid chain ID "${chainId}": invalid hex string.`
  //   );
  //   assert.ok(
  //     isSafeChainId(parseInt(chainId, 16)),
  //     `Invalid chain ID "${chainId}": numerical value greater than max safe value.`
  //   );
  //   this.setProviderConfig({
  //     id,
  //     type: NETWORK_TYPE_RPC,
  //     rpcUrl,
  //     chainId,
  //     ticker,
  //     nickname,
  //     rpcPrefs,
  //     coinType: CoinType.ETH,
  //     chainName: 'ETH',
  //   });
  // }

  // async setProviderType(type: Provider['type']) {
  //   assert.notStrictEqual(
  //     type,
  //     NETWORK_TYPE_RPC,
  //     `NetworkController - cannot call "setProviderType" with type "${NETWORK_TYPE_RPC}". Use "setRpcTarget"`
  //   );
  //   assert.ok(
  //     INFURA_PROVIDER_TYPES.includes(type),
  //     `Unknown Infura provider type "${type}".`
  //   );
  //   const { chainId } = NETWORK_TYPE_TO_ID_MAP[type];
  //   this.setProviderConfig({
  //     type,
  //     id: type,
  //     rpcUrl: '',
  //     chainId,
  //     ticker: 'ETH',
  //     nickname: '',
  //     rpcPrefs: {},
  //     category: 'OTHERS',
  //     coinType: CoinType.ETH,
  //     chainName: 'ETH',
  //   });
  // }

  resetConnection() {
    this.setProviderConfig(this.getProviderConfig());
  }

  /**
   * Sets the provider config and switches the network.
   */
  setProviderConfig(
    config: Provider,
    shouldSetDestinationChainAccount = true,
    skipSameEcosystemCheck = false
  ) {
    if (
      shouldSetDestinationChainAccount &&
      !this._checkAccountExistWithChain(config)
    )
      throw new BitError(ErrorCode.ACCOUNT_DOES_NOT_EXIST);
    if (
      !skipSameEcosystemCheck &&
      !this._isSameEcosystemForCurrentAccount(config)
    ) {
      throw new BitError(ErrorCode.NORMAL_WALLET_SWITCH_EVM_ONLY);
    }
    const copiedConfig = config;
    copiedConfig.rpcUrl = parseStringTemplate(copiedConfig.rpcUrl, {
      INFURA_API_KEY: process.env.INFURA_PROJECT_ID as string,
    });
    if (
      shouldSetDestinationChainAccount &&
      !(
        this.getProviderConfig().ecosystem === Ecosystem.EVM &&
        config.ecosystem === Ecosystem.EVM
      )
    ) {
      this._setDestinationChainAccount(config);
    }
    this.networkStore.updateState({
      previousProviderStore: this.getProviderConfig(),
      provider: copiedConfig,
    });

    if (config.ecosystem === Ecosystem.EVM) {
      /**
       * Only trigger this fn when provider is EVM ecosystem
       */
      this._switchNetwork(copiedConfig);
    }
  }

  private _checkAccountExistWithChain(chain: Provider): boolean {
    const allAccounts: BaseAccount[] = keyringService.getAccountAllList();
    return (
      (chain.ecosystem === Ecosystem.EVM &&
        allAccounts.some((a: BaseAccount) => a.ecosystem === Ecosystem.EVM)) ||
      (chain.ecosystem !== Ecosystem.EVM &&
        allAccounts.some((a: BaseAccount) => a.chainCustomId === chain.id))
    );
  }

  private _isSameEcosystemForCurrentAccount(chain: Provider): boolean {
    const currentWallet = preferenceService.getCurrentAccount();
    const isNormalWallet =
      currentWallet?.accountCreateType === AccountCreateType.PRIVATE_KEY;
    /**
     * MNEMONIC account do not care about ecosystem,
     * only normal wallet (wallet that imported by private key)
     */
    if (!isNormalWallet) return true;

    /**
     * `true` that if:
     * - is normal wallet
     * - or it's same ecosystem with current wallet
     */
    return currentWallet.ecosystem === chain.ecosystem;
  }

  private _setDestinationChainAccount(chain: Provider) {
    const allAccounts: BaseAccount[] = keyringService.getAccountAllList();
    const currentAccount: BaseAccount | null | undefined =
      preferenceService.getCurrentAccount();
    if (!currentAccount) throw Error('current account not found');
    const { accountCreateType, hdWalletId, hdPathIndex, ecosystem } =
      currentAccount;
    const destAccount = allAccounts.find((a: BaseAccount) => {
      const isBothSideEVM =
        chain.ecosystem === Ecosystem.EVM && a.ecosystem === Ecosystem.EVM;
      return (
        a.hdWalletId === hdWalletId &&
        /** account that matched to the provider,
         * or they are both EVM eco, so stick with ETH mainnet account */
        (chain.id === a.chainCustomId || isBothSideEVM) &&
        (accountCreateType === AccountCreateType.MNEMONIC
          ? a.hdPathIndex === hdPathIndex
          : true)
      );
    });
    if (!destAccount) throw Error('account not found');
    preferenceService.setCurrentAccount(destAccount);
  }

  rollbackToPreviousProvider() {
    const config = this.networkStore.getState().previousProviderStore;
    if (!config) {
      // @todo: no previous provider to rollback with
      throw new BitError();
    }
    this.networkStore.updateState({
      provider: config,
    });
    this._switchNetwork(config);
  }

  getProviderConfig(): Provider {
    return this.networkStore.getState().provider;
  }

  getSameChainsByCoinType(coinType: CoinType): Provider[] {
    const providers: Provider[] = this.getAllProviders();
    const chains: Provider[] = [];
    providers.forEach((c: Provider) => {
      if (c.coinType === coinType) chains.push(c);
    });
    return chains;
  }

  /**
   * @returns all network providers in the extension
   */
  getAllProviders(): Provider[] {
    const presetProviders = Object.values(defaultNetworks).filter((val) => {
      // no null, undefined and no empty object
      return Boolean(val) && Object.keys(val).length > 0;
    });
    const customProviders: Provider[] = this._getCustomNetworks().map((p) => ({
      ...p,
      type: 'rpc',
    }));

    return [...presetProviders, ...customProviders].map((p) => {
      if (p.ecosystem === Ecosystem.COSMOS) {
        /**
         * Apply updated infos to the cosmos provider
         */
        return this.cosmosChainUpdater.putUpdatedPropertyToProvider(p);
      } else {
        return p;
      }
    });
  }

  getProvider(id: PresetNetworkId | string): Provider | undefined {
    const networks = this.getAllProviders();
    return networks.find((n) => n.id === id);
  }

  useProviderById(id: PresetNetworkId | string, shouldSetDestChainAcc = true) {
    const provider = this.getProvider(id);
    if (!provider) {
      throw new BitError(
        Object.values(PresetNetworkId).includes(id as PresetNetworkId)
          ? ErrorCode.DEFAULT_NETWORK_PROVIDER_PRESET_MISSING
          : ErrorCode.CUSTOM_NETWORK_PROVIDER_MISSING
      );
    }
    this.setProviderConfig(provider, shouldSetDestChainAcc);
    return provider;
  }

  getSupportProviders(): Provider[] {
    const supportProviders: Provider[] = [];
    this.getAllProviders().forEach((p: Provider) => {
      if (
        (p.ecosystem === Ecosystem.EVM &&
          supportProviders.every(
            (subP: Provider) => subP.ecosystem !== Ecosystem.EVM
          )) ||
        p.ecosystem !== Ecosystem.EVM
      ) {
        supportProviders.push(p);
      }
    });
    return supportProviders;
  }

  getNetworkIdentifier() {
    const provider = this.getProviderConfig();
    return provider.type === NETWORK_TYPE_RPC ? provider.rpcUrl : provider.type;
  }

  //
  // Private
  //

  private async _checkInfuraAvailability(network: string) {
    const rpcUrl = `https://${network}.infura.io/v3/${this._infuraProjectId}`;

    let networkChanged = false;
    this.once(NETWORK_EVENTS.NETWORK_DID_CHANGE, () => {
      networkChanged = true;
    });

    try {
      const response = await fetchWithTimeout(rpcUrl, {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        }),
      });

      if (networkChanged) {
        return;
      }

      if (response.ok) {
        this.emit(NETWORK_EVENTS.INFURA_IS_UNBLOCKED);
      } else {
        const responseMessage = await response.json();
        if (networkChanged) {
          return;
        }
        if (responseMessage.error === INFURA_BLOCKED_KEY) {
          this.emit(NETWORK_EVENTS.INFURA_IS_BLOCKED);
        }
      }
    } catch (err) {
      log.warn('TeleportWallet - Infura availability check failed', err);
    }
  }

  private _switchNetwork(opts: Provider) {
    // Indicate to subscribers that network is about to change
    this.emit(NETWORK_EVENTS.NETWORK_WILL_CHANGE);
    // Set loading state
    this.setNetworkState('loading');
    // Reset network details
    this.clearNetworkDetails();
    // Configure the provider appropriately
    this._configureProvider(opts);
    // Notify subscribers that network has changed
    this.emit(NETWORK_EVENTS.NETWORK_DID_CHANGE, opts.type);

    // Frank added based on MM

    // should use observable in the future
    sessionService.broadcastEvent('chainChanged', {
      chain: opts.chainId,
      networkVersion: opts.chainId,
    });
  }

  private _configureProvider({
    type,
    rpcUrl,
    chainId,
  }: {
    type: string;
    rpcUrl: string;
    chainId: string | number;
  }) {
    // infura type-based endpoints
    const isInfura = INFURA_PROVIDER_TYPES.includes(type);
    if (isInfura) {
      this._configureInfuraProvider(type, this._infuraProjectId as string);
      // url-based rpc endpoints
    } else {
      this._configureStandardProvider(rpcUrl, chainId);
    }
  }

  private _configureInfuraProvider(type, projectId: string) {
    log.info('NetworkController - configureInfuraProvider', type);
    const _tmpInfuraType = type === 'ethereum' ? 'mainnet' : type;
    const networkClient = createInfuraClient({
      network: _tmpInfuraType,
      projectId,
    });
    this._setNetworkClient(networkClient);
  }

  _configureStandardProvider(rpcUrl: string, chainId) {
    log.info('NetworkController - configureStandardProvider', rpcUrl);
    const networkClient = createJsonRpcClient({ rpcUrl, chainId });
    this._setNetworkClient(networkClient);
  }

  _setNetworkClient({
    networkMiddleware,
    blockTracker,
  }: ReturnType<typeof createJsonRpcClient>) {
    const metamaskMiddleware = createMetamaskMiddleware(
      this._baseProviderParams
    );
    const engine = new JsonRpcEngine();
    engine.push(metamaskMiddleware);
    engine.push(networkMiddleware);
    const provider = providerFromEngine(engine);
    this._setProviderAndBlockTracker({ provider, blockTracker });
  }

  _setProviderAndBlockTracker({
    provider,
    blockTracker,
  }: {
    provider: ReturnType<typeof providerFromEngine>;
    blockTracker: PollingBlockTracker;
  }) {
    // update or initialize proxies
    if (this._providerProxy) {
      this._providerProxy.setTarget(provider);
    } else {
      this._providerProxy = createSwappableProxy(provider);
    }
    if (this._blockTrackerProxy) {
      this._blockTrackerProxy.setTarget(blockTracker);
    } else {
      this._blockTrackerProxy = createEventEmitterProxy(blockTracker, {
        eventFilter: 'skipInternal',
      });
    }
    // set new provider and blockTracker
    this._provider = provider;
    this._blockTracker = blockTracker;
  }
  getCurrentEth() {
    const { rpcUrl } = this.networkStore.getState().provider;
    return new Eth(new Eth.HttpProvider(rpcUrl));
  }
  getEthByNetwork(rpcUrl: string) {
    return new Eth(new Eth.HttpProvider(rpcUrl));
  }

  getCosmosChainInfo(cosmosChainId: string): Provider {
    const chainInfo = this.getAllProviders().find((chainInfo) => {
      return (
        ChainIdHelper.parse(chainInfo.chainId).identifier ===
        ChainIdHelper.parse(cosmosChainId).identifier
      );
    });

    if (!chainInfo) {
      throw new Error(`There is no cosmos chain info for ${cosmosChainId}`);
    }
    return chainInfo;
  }

  /**
   * extended for cosmos ecosystem
   */
  getChainCoinType(chainId: string): number {
    const chainInfo = this.getCosmosChainInfo(chainId);

    if (!chainInfo) {
      throw new Error(`There is no chain info for ${chainId}`);
    }

    return chainInfo.coinType;
  }

  hasChainInfo(chainId: string): boolean {
    return (
      this.getAllProviders().find((chainInfo) => {
        return (
          ChainIdHelper.parse(chainInfo.chainId).identifier ===
          ChainIdHelper.parse(chainId).identifier
        );
      }) != null
    );
  }

  async suggestCosmosChainInfo(
    // env: Env,
    chainInfo: CosmosChainInfo,
    origin: string
  ) {
    chainInfo = await ChainInfoSchema.validateAsync(chainInfo, {
      stripUnknown: true,
    });

    const newCosmosProvider =
      parsedKeplrChainInfoAsTeleportCosmosProvider(chainInfo);
    console.debug(
      'suggestCosmosChainInfo::newCosmosProvider:',
      newCosmosProvider
    );
    this.checkIsCustomNetworkNameLegit(newCosmosProvider.nickname);
    const { networks, orderOfNetworks } = this.customNetworksStore.getState();
    this.customNetworksStore.updateState({
      networks: [...networks, newCosmosProvider],
      orderOfNetworks: {
        ...orderOfNetworks,
        [Ecosystem.COSMOS]: [
          ...orderOfNetworks[Ecosystem.COSMOS],
          newCosmosProvider.id,
        ],
      },
    });
    // add custom token
    await TokenService.addCustomToken({
      symbol: chainInfo.currencies[0].coinDenom,
      name: chainInfo.currencies[0].coinDenom.toUpperCase(),
      decimal: chainInfo.currencies[0].coinDecimals,
      denom: chainInfo.currencies[0].coinMinimalDenom,
      chainCustomId: newCosmosProvider.id,
      icon: chainInfo.currencies[0].coinImageUrl,
      isNative: true,
    });
    /** @TODO add account for this network needed, so no error in `setProviderConfig` */
    return newCosmosProvider;
  }
}

export default new NetworkPreferenceService();
