import cloneDeep from 'lodash/cloneDeep';
import { sessionService, i18n } from './index';
import { browser } from 'webextension-polyfill-ts';
import { BaseAccount } from 'types/extend';
import { ObservableStorage } from 'background/utils/obsStorage';

export interface PreferenceStore {
  currentAccount: BaseAccount | undefined | null;
  locale: string;
  isDefaultWallet: boolean;
  currentCurrency: string;
  manualLocked: boolean;
}

const SUPPORT_LOCALES = ['en', 'zh_CN'];

class PreferenceService {
  store: ObservableStorage<PreferenceStore>;
  popupOpen = false;

  constructor() {
    this.store = new ObservableStorage<PreferenceStore>('preference', {
      currentAccount: undefined,
      locale: 'en',
      isDefaultWallet: false,
      currentCurrency: 'ETH',
      manualLocked: false,
    });
  }

  get storeState() {
    return this.store.getState();
  }

  init = async () => {
    let defaultLang = 'en';
    const acceptLangs = await this.getAcceptLanguages();
    if (acceptLangs.length > 0) {
      defaultLang = acceptLangs[0];
    }

    if (!this.storeState.locale) {
      // this.storeState.locale = defaultLang;
      this.store.updateState({
        locale: defaultLang,
      });
    }
    i18n.changeLanguage(this.storeState.locale);
    if (
      this.storeState.isDefaultWallet === undefined ||
      this.storeState.isDefaultWallet === null
    ) {
      // this.storeState.isDefaultWallet = true;
      this.store.updateState({
        isDefaultWallet: true,
      });
    }
  };

  setIsDefaultWallet = (isDefaultWallet: boolean) => {
    // this.storeState.isDefaultWallet = val;
    this.store.updateState({
      isDefaultWallet,
    });
  };

  getIsDefaultWallet = () => {
    return this.storeState.isDefaultWallet;
  };

  getAcceptLanguages = async () => {
    let langs = await browser.i18n.getAcceptLanguages();
    if (!langs) langs = [];
    return langs
      .map((lang) => lang.replace(/-/g, '_'))
      .filter((lang) => SUPPORT_LOCALES.includes(lang));
  };

  getCurrentAccount = (): BaseAccount | undefined | null => {
    return cloneDeep(this.storeState.currentAccount);
  };

  setCurrentAccount = (account: BaseAccount) => {
    // this.storeState.currentAccount = account;
    this.store.updateState({
      currentAccount: account,
    });
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
     * in order to use `this.storeState.locale`
     */
    // return this.storeState.locale;

    return 'en';
  };

  setLocale = (locale: string) => {
    // this.storeState.locale = locale;
    this.store.updateState({
      locale,
    });
    i18n.changeLanguage(locale);
  };

  getCurrentCurrency = () => {
    return this.storeState.currentCurrency;
  };

  setCurrentCurrency = (currentCurrency: string) => {
    // this.storeState.currentCurrency = currentCurrency;
    this.store.updateState({
      currentCurrency,
    });
  };

  getManualLocked = () => {
    return this.storeState.manualLocked;
  };

  setManualLocked = (manualLocked: boolean) => {
    this.store.updateState({
      manualLocked,
    });
  };
}

export default new PreferenceService();
