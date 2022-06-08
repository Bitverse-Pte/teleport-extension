import LRU from 'lru-cache';
import { createPersistStore } from 'background/utils';
import { CHAINS_ENUM, INTERNAL_REQUEST_ORIGIN } from 'constants/index';

export interface ConnectedSite {
  origin: string;
  icon: string;
  name: string;
  chain: CHAINS_ENUM;
  chainIds: string[];
  e?: number;
  isSigned: boolean;
  isTop: boolean;
  accounts: string[];
}

export type PermissionStore = {
  dumpCache: ReadonlyArray<LRU.Entry<string, ConnectedSite>>;
};

class PermissionService {
  store: PermissionStore = {
    dumpCache: [],
  };
  lruCache: LRU<string, ConnectedSite> | undefined;

  init = async () => {
    const storage = await createPersistStore<PermissionStore>({
      name: 'permission',
    });
    this.store = storage || this.store;

    this.lruCache = new LRU();
    const cache: ReadonlyArray<LRU.Entry<string, ConnectedSite>> = (
      this.store.dumpCache || []
    ).map((item) => ({
      k: item.k,
      v: item.v,
      e: 0,
    }));
    this.lruCache.load(cache);
  };

  sync = () => {
    if (!this.lruCache) return;
    this.store.dumpCache = this.lruCache.dump();
  };

  getWithoutUpdate = (key: string) => {
    if (!this.lruCache) return;

    return this.lruCache.peek(key);
  };

  addConnectedSite = (
    origin: string,
    name: string,
    icon: string,
    defaultChain: CHAINS_ENUM,
    isSigned = false,
    account?: string
  ) => {
    if (!this.lruCache) return;
    if (!account) return;
    if (this.lruCache.has(origin)) {
      let _value = this.lruCache.get(origin);
      // init accounts array if no accouts in record
      if (!_value?.accounts) {
        _value = {
          ...(_value as ConnectedSite),
          accounts: [],
        };
      }
      if (!_value?.accounts.includes(account)) {
        _value?.accounts.push(account);
      }
      this.lruCache.set(origin, {
        ..._value,
        origin,
        name,
        icon,
        chain: defaultChain,
        isSigned,
        isTop: false,
      } as ConnectedSite);
    } else {
      this.lruCache.set(origin, {
        origin,
        name,
        icon,
        chain: defaultChain,
        isSigned,
        isTop: false,
        accounts: [account],
      } as ConnectedSite);
    }

    this.sync();
  };

  addConnectedSite4CosmosNetwork = (
    origin: string,
    name: string,
    icon: string,
    chainId: string
  ) => {
    if (!this.lruCache) return;
    if (!chainId) return;
    if (this.lruCache.has(origin)) {
      let site = this.lruCache.get(origin);
      if (!site?.chainIds) {
        site = {
          ...(site as ConnectedSite),
          chainIds: [],
        };
      }
      if (!site?.chainIds.includes(chainId)) {
        site?.chainIds.push(chainId);
      }
      this.lruCache.set(origin, {
        ...site,
        origin,
        name,
        icon,
      } as ConnectedSite);
    } else {
      this.lruCache.set(origin, {
        origin,
        name,
        icon,
        chainIds: [chainId],
      } as ConnectedSite);
    }
    this.sync();
  };

  touchConnectedSite = (origin) => {
    if (!this.lruCache) return;
    if (origin === INTERNAL_REQUEST_ORIGIN) return;
    this.lruCache.get(origin);
    this.sync();
  };

  updateConnectSite = (
    origin: string,
    value: Partial<ConnectedSite>,
    partialUpdate?: boolean
  ) => {
    if (!this.lruCache || !this.lruCache.has(origin)) return;
    if (origin === INTERNAL_REQUEST_ORIGIN) return;

    if (partialUpdate) {
      const _value = this.lruCache.get(origin);
      this.lruCache.set(origin, { ..._value, ...value } as ConnectedSite);
    } else {
      this.lruCache.set(origin, value as ConnectedSite);
    }

    this.sync();
  };

  // TODO: typo
  hasPerssmion = ({
    origin,
    account,
    chainId,
  }: {
    origin: string;
    account?: string;
    chainId?: string;
  }) => {
    if (!this.lruCache) return;
    if (origin === INTERNAL_REQUEST_ORIGIN) return true;
    if (account) {
      const _value = this.lruCache.peek(origin);
      return _value?.accounts?.includes(account);
    }
    if (chainId) {
      const _value = this.lruCache.peek(origin);
      return _value?.chainIds?.includes(chainId);
    }
    return this.lruCache.has(origin);
  };

  removeConnectedSite = (origin: string, account: string) => {
    if (!this.lruCache) return;
    const site = this.lruCache.get(origin);
    if (!site) {
      return;
    }
    const i = site.accounts.indexOf(account);
    if (i > -1) {
      site.accounts.splice(i, 1);
    }
    if (!site.accounts?.length) {
      this.lruCache.del(origin);
    } else {
      this.lruCache.set(origin, site);
    }
    this.sync();
  };

  getConnectedSite = (origin: string) => {
    return this.lruCache?.get(origin);
  };

  getConnectedSitesByAccount = (account: string): ConnectedSite[] => {
    const values = this.lruCache?.values() || [];
    return values.filter((item) => item.accounts.includes(account));
  };
}

export default new PermissionService();
