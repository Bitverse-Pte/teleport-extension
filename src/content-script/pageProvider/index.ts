// this script is injected into webpage's context
import { EventEmitter } from 'events';
import { ethErrors, serializeError } from 'eth-rpc-errors';
import BroadcastChannelMessage from 'utils/message/broadcastChannelMessage';
import PushEventHandlers from './pushEventHandlers';
import { domReadyCall, $ } from './utils';
import ReadyPromise from './readyPromise';
import DedupePromise from './dedupePromise';
import { CosmosProvider } from './cosmosProvider';
import { OfflineSigner } from '@cosmjs/launchpad';
import { SecretUtils } from 'secretjs/types/enigmautils';
import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { Keplr } from 'types/cosmos';

const log = (event, ...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `%c [teleport] (${new Date().toTimeString().substr(0, 8)}) ${event}`,
      'font-weight: bold; background-color: #6AB5FF; color: white;',
      ...args
    );
  }
};

interface StateProvider {
  accounts: string[] | null;
  isConnected: boolean;
  isUnlocked: boolean;
  initialized: boolean;
  isPermanentlyDisconnected: boolean;
}

export class EthereumProvider extends EventEmitter {
  chainId: string | null = null;
  selectedAddress: string | null = null;
  /**
   * The network ID of the currently connected Ethereum chain.
   * @deprecated
   */
  networkVersion: string | null = null;
  isTeleportWallet = true;
  isMetaMask = false;

  _isConnected = false;
  _initialized = false;
  _isUnlocked = false;

  _state: StateProvider = {
    accounts: null,
    isConnected: false,
    isUnlocked: false,
    initialized: false,
    isPermanentlyDisconnected: false,
  };

  _metamask = {
    isUnlocked: () => {
      return new Promise((resolve) => {
        resolve(this._isUnlocked);
      });
    },
  };

  private _pushEventHandlers: PushEventHandlers;
  private _requestPromise = new ReadyPromise(2);
  private _dedupePromise = new DedupePromise([
    // remove the rpc dedupe check
    // 'personal_sign',
    // 'wallet_addEthereumChain',
    // 'eth_sendTransaction',
    // 'eth_signTypedData',
    // 'eth_signTypedData_v1',
    // 'eth_signTypedData_v3',
    // 'eth_signTypedData_v4',
  ]);
  private _bcm: BroadcastChannelMessage;

  constructor({
    bcm,
    maxListeners = 200,
  }: {
    bcm: BroadcastChannelMessage;
    maxListeners?: number;
  }) {
    super();
    this._bcm = bcm;
    this.setMaxListeners(maxListeners);
    this.initialize();
    this.shimLegacy();
    this._pushEventHandlers = new PushEventHandlers(this);
  }

  initialize = async () => {
    document.addEventListener(
      'visibilitychange',
      this._requestPromiseCheckVisibility
    );
    this._bcm.connect().on('message', this._handleBackgroundMessage);
    domReadyCall(() => {
      const origin = top?.location.origin;
      const icon =
        ($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
        ($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;

      const name =
        document.title ||
        ($('head > meta[name="title"]') as HTMLMetaElement)?.content ||
        origin;

      this._bcm.request({
        method: 'tabCheckin',
        params: { icon, name, origin },
      });

      this._requestPromise.check(2);
    });

    try {
      const { chainId, accounts, networkVersion, isUnlocked }: any =
        await this.request({
          method: 'getProviderState',
        });
      if (isUnlocked) {
        this._isUnlocked = true;
        this._state.isUnlocked = true;
      }
      this.chainId = chainId;
      this.networkVersion = networkVersion;
      this.emit('connect', { chainId });
      this._pushEventHandlers.chainChanged({
        chain: chainId,
        networkVersion,
      });
      this._pushEventHandlers.accountsChanged(accounts);
    } catch {
      //
    } finally {
      this._initialized = true;
      this._state.initialized = true;
      this.emit('_initialized');
    }
  };

  private _requestPromiseCheckVisibility = () => {
    if (document.visibilityState === 'visible') {
      this._requestPromise.check(1);
      this._requestPromise.check(2);
    } else {
      this._requestPromise.uncheck(1);
    }
  };

  private _handleBackgroundMessage = ({ event, data }) => {
    log('[push event]', event, data);
    if (this._pushEventHandlers[event]) {
      return this._pushEventHandlers[event](data);
    }

    this.emit(event, data);
  };

  isConnected = () => {
    return this._isConnected;
  };

  // TODO: support multi request!
  request = async (data) => {
    return this._dedupePromise.call(data.method, () => this._request(data));
  };

  _request = async (data) => {
    if (!data) {
      throw ethErrors.rpc.invalidRequest();
    }

    this._requestPromiseCheckVisibility();

    return this._requestPromise.call(() => {
      log('[request]', JSON.stringify(data, null, 2));

      return this._bcm
        .request(data)
        .then((res) => {
          log('[response: success]', data.method, res);
          return res;
        })
        .catch((err) => {
          log('[response: error]', data.method, err);
          throw err;
        });
    });
  };

  // shim to matamask legacy api
  sendAsync = (payload, callback) => {
    const { method, params, ...rest } = payload;
    this.request({ method, params })
      .then((result) => callback(null, { ...rest, method, result }))
      .catch((error) => callback(error, { ...rest, method, error }));
  };

  send = (payload, callback?) => {
    if (typeof payload === 'string' && (!callback || Array.isArray(callback))) {
      // send(method, params? = [])
      return this.request({
        method: payload,
        params: callback,
      }).then((result) => ({
        id: undefined,
        jsonrpc: '2.0',
        result,
      }));
    }

    if (typeof payload === 'object' && typeof callback === 'function') {
      return this.sendAsync(payload, callback);
    }

    let result;
    switch (payload.method) {
      case 'eth_accounts':
        result = this.selectedAddress ? [this.selectedAddress] : [];
        break;

      case 'eth_coinbase':
        result = this.selectedAddress || null;
        break;

      case 'net_version':
        result = this.networkVersion || null;
        break;

      default:
        throw new Error('sync method doesnt support');
    }

    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result,
    };
  };

  shimLegacy = () => {
    const legacyMethods = [
      ['enable', 'eth_requestAccounts'],
      ['net_version', 'net_version'],
    ];

    for (const [_method, method] of legacyMethods) {
      this[_method] = () => this.request({ method });
    }
  };
}

declare global {
  interface Window {
    ethereum: EthereumProvider;
    web3: {
      currentProvider: EthereumProvider;
    };
    teleport: EthereumProvider;
    teleportC?: Keplr;
    keplr?: Keplr;
    getOfflineSigner?: (chainId: string) => OfflineSigner & OfflineDirectSigner;
    getOfflineSignerOnlyAmino?: (chainId: string) => OfflineSigner;
    getOfflineSignerAuto?: (
      chainId: string
    ) => Promise<OfflineSigner | OfflineDirectSigner>;
    getEnigmaUtils?: (chainId: string) => SecretUtils;
  }
}

// add INIT_PROVIDER event listener for init ethereum provider and inject to window
window.addEventListener('message', function (event) {
  // We only accept messages from ourselves
  if (event.source != window) return;

  if (event.data.type && event.data.type == 'INIT_TELEPORT_PROVIDER') {
    const channelName = event.data.channelName;
    const bcm = new BroadcastChannelMessage(channelName);
    const provider = new EthereumProvider({ bcm });
    const cosmosProvider = new CosmosProvider({ bcm });
    provider
      .request({
        method: 'isDefaultWallet',
        params: [],
      })
      .then((isDefaultWallet: any) => {
        // set provider isMetamask attribute as isDefaultWallet to fit different dapp scenario
        provider.isMetaMask = isDefaultWallet;
        if (isDefaultWallet) {
          Object.defineProperty(window, 'ethereum', {
            value: new Proxy(provider, {
              deleteProperty: () => true,
            }),
            writable: false,
          });
        }
      });

    if (!window.ethereum) {
      window.ethereum = new Proxy(provider, {
        deleteProperty: () => true,
      });

      window.web3 = {
        currentProvider: window.ethereum,
      };
    }
    window.teleport = new Proxy(provider, {
      deleteProperty: () => true,
    });
    window.dispatchEvent(new Event('ethereum#initialized'));

    init(
      provider,
      cosmosProvider,
      (chainId: string) => cosmosProvider.getOfflineSigner(chainId),
      (chainId: string) => cosmosProvider.getOfflineSignerOnlyAmino(chainId),
      (chainId: string) => cosmosProvider.getOfflineSignerAuto(chainId),
      (chainId: string) => cosmosProvider.getEnigmaUtils(chainId)
    );
    window.dispatchEvent(new Event('cosmos#initialized'));
  }
});

function init(
  provider: EthereumProvider,
  keplr: Keplr,
  getOfflineSigner: (chainId: string) => OfflineSigner & OfflineDirectSigner,
  getOfflineSignerOnlyAmino: (chainId: string) => OfflineSigner,
  getOfflineSignerAuto: (
    chainId: string
  ) => Promise<OfflineSigner | OfflineDirectSigner>,
  getEnigmaUtils: (chainId: string) => SecretUtils
) {
  provider
    .request({
      method: 'isDefaultWallet',
      params: [],
    })
    .then((isDefaultWallet: any) => {
      if (isDefaultWallet) {
        window.keplr = keplr;
        window.getOfflineSigner = getOfflineSigner;
        window.getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino;
        window.getOfflineSignerAuto = getOfflineSignerAuto;
        window.getEnigmaUtils = getEnigmaUtils;
      }
    });

  if (!window.keplr) {
    window.keplr = keplr;
  }

  if (!window.teleportC) {
    window.teleportC = keplr;
  }

  if (!window.getOfflineSigner) {
    window.getOfflineSigner = getOfflineSigner;
  }
  if (!window.getOfflineSignerOnlyAmino) {
    window.getOfflineSignerOnlyAmino = getOfflineSignerOnlyAmino;
  }
  if (!window.getOfflineSignerAuto) {
    window.getOfflineSignerAuto = getOfflineSignerAuto;
  }
  if (!window.getEnigmaUtils) {
    window.getEnigmaUtils = getEnigmaUtils;
  }
}
