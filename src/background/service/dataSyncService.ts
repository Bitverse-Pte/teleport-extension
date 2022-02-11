import eventBus from 'eventBus';
import { EVENTS } from 'constants/index';
import { ObservableStore } from '@metamask/obs-store';

type DataSyncStoresDict = Record<string, ObservableStore<unknown>>;

class DataSyncService {
  stores: DataSyncStoresDict;
  constructor(stores: DataSyncStoresDict) {
    this.stores = stores;
    // this keeps syncing data from the UI
    this._registerListener();
  }

  private _registerListener() {
    Object.entries(this.stores).forEach(([storageName, s]) => {
      s.subscribe((state) => {
        eventBus.emit(EVENTS.broadcastToUI, {
          // UI listen `dataSyncService.${storageName}`
          method: `dataSyncService.${storageName}`,
          params: state,
        });
      });
    });
    Object.keys(this.stores).forEach((storageName) => {
      eventBus.addEventListener(`dataSyncService.fetch.${storageName}`, () => {
        this.pushStateToUI(storageName);
      });
    });
  }

  pushStateToUI(storageName: string) {
    if (!this.stores[storageName]) {
      throw new Error(
        `Storage '${storageName}' are not in the DataSyncService`
      );
    }
    const state = this.stores[storageName].getState();
    eventBus.emit(EVENTS.broadcastToUI, {
      // UI listen `dataSyncService.${storageName}`
      method: `dataSyncService.${storageName}`,
      params: state,
    });
  }

  pushAllStateToUI() {
    Object.keys(this.stores).forEach((storageName) => {
      return this.pushStateToUI(storageName);
    });
  }

  private handleMessageFromUI(message: string[]): void {
    if (message[0] === 'fetch_all') {
      return this.pushAllStateToUI();
    }

    // matched
    message
      .filter((storageName) => {
        return !!this.stores[storageName];
      })
      .forEach((name) => {
        return this.pushStateToUI(name);
      });

    // notMatched
    message
      .filter((storageName) => {
        return !this.stores[storageName];
      })
      .forEach((name) =>
        console.error(`handleMessageFromUI::error: Storage ${name} not found.`)
      );
  }
}

export default DataSyncService;
