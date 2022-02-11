import cloneDeep from 'lodash/cloneDeep';
import { createPersistStore } from 'background/utils';
import { sessionService, i18n, permissionService } from './index';
import { EVENTS } from 'constants/index';
import { browser } from 'webextension-polyfill-ts';
import { BaseAccount } from 'types/extend';
import eventBus from 'eventBus';
import permission from './permission';

export interface PreferenceStore {
  currentAccount: BaseAccount | undefined | null;
  locale: string;
  isDefaultWallet: boolean;
  currentCurrency: string;
}

const SUPPORT_LOCALES = ['en', 'zh_CN'];

class PreferenceService {
  store!: PreferenceStore;
  popupOpen = false;

  init = async () => {
    let defaultLang = 'en';
    const acceptLangs = await this.getAcceptLanguages();
    if (acceptLangs.length > 0) {
      defaultLang = acceptLangs[0];
    }
    this.store = await createPersistStore<PreferenceStore>({
      name: 'preference',
      template: {
        currentAccount: undefined,
        locale: defaultLang,
        isDefaultWallet: false,
        currentCurrency: 'ETH',
      },
    });
    if (!this.store.locale) {
      this.store.locale = defaultLang;
    }
    i18n.changeLanguage(this.store.locale);
    if (
      this.store.isDefaultWallet === undefined ||
      this.store.isDefaultWallet === null
    ) {
      this.store.isDefaultWallet = true;
    }

    // push to UI
    eventBus.addEventListener(
      'fetchPreferenceStore',
      this.pushStoreToUI.bind(this)
    );
  };

  pushStoreToUI() {
    eventBus.emit(EVENTS.broadcastToUI, {
      method: 'onPreferenceUpdate',
      params: { ...this.store },
    });
  }

  setIsDefaultWallet = (val: boolean) => {
    this.store.isDefaultWallet = val;
  };

  getIsDefaultWallet = () => {
    return this.store.isDefaultWallet;
  };

  getAcceptLanguages = async () => {
    let langs = await browser.i18n.getAcceptLanguages();
    if (!langs) langs = [];
    return langs
      .map((lang) => lang.replace(/-/g, '_'))
      .filter((lang) => SUPPORT_LOCALES.includes(lang));
  };

  getCurrentAccount = (): BaseAccount | undefined | null => {
    return cloneDeep(this.store.currentAccount);
  };

  setCurrentAccount = (account: BaseAccount) => {
    this.store.currentAccount = account;
    if (account) {
      sessionService.broadcastEvent('accountsChanged', [account.address]);
    }
  };

  setPopupOpen = (isOpen) => {
    this.popupOpen = isOpen;
  };

  getPopupOpen = () => this.popupOpen;

  getSelectedAddress() {
    return this.getCurrentAccount()!.address;
  }

  getLocale = () => {
    /**
     * Disabled for the 1st version
     * @todo: refine Chinese and other locale
     * in order to use `this.store.locale`
     */
    // return this.store.locale;

    return 'en';
  };

  setLocale = (locale: string) => {
    this.store.locale = locale;
    i18n.changeLanguage(locale);
  };

  getCurrentCurrency = () => {
    return this.store.currentCurrency;
  };

  setCurrentCurrency = (currency: string) => {
    this.store.currentCurrency = currency;
  };
}

export default new PreferenceService();
