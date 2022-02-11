import { ObservableStore } from '@metamask/obs-store';
import { browser } from 'webextension-polyfill-ts';
import { debounce } from 'debounce';

export class ComposedStorage<T> extends ObservableStore<T> {
  public readonly storageName: string;
  private _children: Record<keyof T, ObservableStore<T[keyof T]>>;

  constructor(
    storageName: string,
    children: Record<keyof T, ObservableStore<T[keyof T]>>
  ) {
    // Typecast: Preserve existing behavior
    super({} as unknown as T);
    this.storageName = storageName;
    // this.syncToLocal = debounce(this.syncToLocal.bind(this), 1000)

    // subscribe to children
    this._children = children || {};
    Object.keys(this._children).forEach((childKey) => {
      const child = this._children[childKey];
      this._addChild(childKey, child);
    });

    // some async initialization happened here
    this.init();
    console.debug(
      'ComposedStorage constructed, current state:',
      this.getState()
    );
  }

  private async init() {
    // read from browser storage
    const result = await browser.storage.local.get(null);
    const { storageName } = this;

    if (result[storageName]) {
      // storage exist, fetch it and cache them
      const existedStorageContent = result[storageName];
      Object.keys(this._children).forEach((childKey) => {
        this._children[childKey].putState(existedStorageContent[childKey]);
      });
    } else {
      // storage not exist, create them with preset value
      const initState: any = {};
      Object.keys(this._children).forEach((childKey) => {
        initState[childKey] = this._children[childKey].getState();
      });
      await browser.storage.local.set({ [storageName]: initState });
    }

    // after init, open the persist listener
    this.subscribe(async (state) => {
      await this.syncToLocal(state);
    });
  }

  _addChild(childKey: string, child: ObservableStore<T[keyof T]>) {
    const updateFromChild = (childValue: T[keyof T]) => {
      const state = this.getState();
      state[childKey] = childValue;
      this.putState(state);
    };

    child.subscribe(updateFromChild);
    updateFromChild(child.getState());
  }

  private async syncToLocal(state: T): Promise<void> {
    await browser.storage.local.set({ [this.storageName]: state });
    console.debug(
      `State synced to browser.storage.local["${this.storageName}"]`
    );
  }
}
