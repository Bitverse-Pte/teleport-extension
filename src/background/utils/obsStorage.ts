import { ObservableStore } from '@metamask/obs-store';
import { browser } from 'webextension-polyfill-ts';
import { debounce } from 'debounce';

export class ObservableStorage<T> extends ObservableStore<T> {
  public readonly storageName: string;
  constructor(storageName: string, initState?: T) {
    super(initState as T);
    this.storageName = storageName;
    this.syncToLocal = debounce(this.syncToLocal.bind(this), 1000);
    browser.storage.local.get(null).then((result) => {
      if (result[storageName]) {
        // storage exist, fetch it and cache them
        // _putState does not emit event
        this._putState(result[storageName]);
      } else {
        // storage not exist, writing initState to local
        browser.storage.local.set({ [storageName]: initState });
      }
    });
    /**
     * register a listener to read state changes
     * and sync them back to browser.storage.local
     */
    this.subscribe(async (state) => {
      await this.syncToLocal(state);
    });
  }

  private async syncToLocal(state: T): Promise<void> {
    await browser.storage.local.set({ [this.storageName]: state });
    console.debug(
      `State synced to browser.storage.local["${this.storageName}"]`
    );
  }
}
