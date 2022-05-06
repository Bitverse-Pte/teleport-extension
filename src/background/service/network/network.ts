import { CHAINS, CHAIN_TO_RPC_URL_MAP } from 'constants/chain';
import {
  getDefaultNetworkIdsByEcoSystem,
  defaultNetworks,
  PresetNetworkId,
} from 'constants/defaultNetwork';
import { BigNumber, utils } from 'ethers';
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
import { ethers } from 'ethers';
import Eth from 'ethjs';
import { sessionService, TokenService } from '../index';
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

  // UI communication

  constructor() {
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

    /**
     * Fix `chainId` issues with
     * - uncessary padding 0
     * - pure decimal number
     */
    const { networks } = this.customNetworksStore.getState();
    this.customNetworksStore.updateState({
      networks: networks.map((n) => ({
        ...n,
        chainId: utils.hexValue(BigNumber.from(n.chainId).toHexString()),
      })),
    });

    /**
     * @TODO new preset network migration need to implement
     * migration on `orderOfNetworks` too
     */
  }

  checkIsCustomNetworkNameLegit(newNickname: string) {
    const nicknames = this.getCustomNetworks().map((n) => n.nickname);
    if (nicknames.includes(newNickname)) {
      throw new BitError(ErrorCode.CUSTOM_NETWORK_NAME_DUPLICATED);
    }
  }

  addCustomNetwork(
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
      chainId: utils.hexValue(BigNumber.from(chainId).toHexString()),
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

  editCustomNetwork(
    providerId: string,
    newNickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string,
    coinType = CoinType.ETH,
    chainName = 'ETH'
  ) {
    const networks = this.getCustomNetworks();
    const matchedProvider = this.getCustomNetwork(providerId);

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
      chainId: utils.hexValue(BigNumber.from(chainId).toHexString()),
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
    return newSettings;
  }

  removeCustomNetwork(idToBeRm: string): boolean {
    const { networks, orderOfNetworks } = this.customNetworksStore.getState();
    const providerToBeRemoved = this.getCustomNetwork(idToBeRm);
    if (!providerToBeRemoved) {
      throw new BitError(ErrorCode.CUSTOM_NETWORK_PROVIDER_MISSING);
    }
    const removedCustomNetworks = networks.filter(
      (n) => n.id !== providerToBeRemoved.id
    );
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

  getCustomNetworks(): Network[] {
    const { networks } = this.customNetworksStore.getState();
    return networks;
  }

  getCustomNetwork(id: string): Network | undefined {
    const { networks } = this.customNetworksStore.getState();
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
    const { type } = this.getProviderConfig();
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
  setProviderConfig(config: Provider) {
    const copiedConfig = config;
    copiedConfig.rpcUrl = parseStringTemplate(copiedConfig.rpcUrl, {
      INFURA_API_KEY: process.env.INFURA_PROJECT_ID as string,
    });
    this.networkStore.updateState({
      previousProviderStore: this.getProviderConfig(),
      provider: copiedConfig,
    });
    this._switchNetwork(copiedConfig);
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

  getAllProviders(): Provider[] {
    const presetProviders = Object.values(defaultNetworks).filter((val) => {
      // no null, undefined and no empty object
      return Boolean(val) && Object.keys(val).length > 0;
    });
    const customProviders: Provider[] = this.getCustomNetworks().map((p) => ({
      ...p,
      type: 'rpc',
    }));

    return [...presetProviders, ...customProviders];
  }

  getSupportProviders(): Provider[] {
    const presetProviders = Object.values(defaultNetworks);
    const supportProviders: Provider[] = [];
    presetProviders.forEach((p: Provider) => {
      if (
        supportProviders.every((subP: Provider) => subP.coinType !== p.coinType)
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
}

export default new NetworkPreferenceService();
