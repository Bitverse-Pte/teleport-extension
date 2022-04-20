import LRU from 'lru-cache';
import { createPersistStore } from 'background/utils';
import { CHAINS_ENUM, INTERNAL_REQUEST_ORIGIN } from 'constants/index';

export interface ConnectedSite {
  origin: string;
  icon: string;
  name: string;
  chain: CHAINS_ENUM;
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
  hasPerssmion = (origin: string, account?: string) => {
    if (!this.lruCache) return;
    if (origin === INTERNAL_REQUEST_ORIGIN) return true;
    if (account) {
      const _value = this.lruCache.peek(origin);
      return _value?.accounts?.includes(account);
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
    if (i && i > -1) {
      site.accounts = site.accounts.splice(i, 1);
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

  // getRecentConnectSites = (max = 12) => {
  //   const values = this.lruCache?.values() || [];
  //   const topSites: ConnectedSite[] = [];
  //   const signedSites: ConnectedSite[] = [];
  //   const connectedSites: ConnectedSite[] = [];
  //   for (let i = 0; i < values.length; i++) {
  //     const item = values[i];
  //     if (item.isTop) {
  //       topSites.push(item);
  //     } else if (item.isSigned) {
  //       signedSites.push(item);
  //     } else {
  //       connectedSites.push(item);
  //     }
  //   }
  //   return [...topSites, ...signedSites, ...connectedSites].slice(0, max) || [];
  // };

  // getConnectedSites = () => {
  //   return this.lruCache?.values() || [];
  // };

  // topConnectedSite = (origin: string) => {
  //   const site = this.getConnectedSite(origin);
  //   if (!site || !this.lruCache) return;
  //   this.updateConnectSite(origin, {
  //     ...site,
  //     isTop: true,
  //   });
  // };

  // unpinConnectedSite = (origin: string) => {
  //   const site = this.getConnectedSite(origin);
  //   if (!site || !this.lruCache) return;
  //   this.updateConnectSite(origin, {
  //     ...site,
  //     isTop: false,
  //   });
  // };

  // getSitesByDefaultChain = (chain: CHAINS_ENUM) => {
  //   if (!this.lruCache) return [];
  //   return this.lruCache.values().filter((item) => item.chain === chain);
  // };

  // isInternalOrigin = (origin: string) => {
  //   return origin === INTERNAL_REQUEST_ORIGIN;
  // };
}

export default new PermissionService();
