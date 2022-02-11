import { ObservableStorage } from 'background/utils/obsStorage';
// import { nanoid } from 'nanoid';

export interface KnownMethodData {
  name?: string;
  params?: { type: string }[];
}
export type KnownMethodDict = Record<string, KnownMethodData | undefined>;

class KnownMethodService {
  store: ObservableStorage<KnownMethodDict>;

  constructor() {
    this.store = new ObservableStorage<KnownMethodDict>(
      'known_method',
      /**
       * Some preset for common methods
       */
      {
        '0xd0e30db0': {
          name: 'deposit',
          params: [],
        },
        '0x23b872dd': {
          name: 'transferFrom',
          params: [
            {
              type: 'address',
            },
            {
              type: 'address',
            },
            {
              type: 'uint256',
            },
          ],
        },
        '0xa9059cbb': {
          name: 'transfer',
          params: [
            {
              type: 'address',
            },
            {
              type: 'uint256',
            },
          ],
        },
      }
    );
  }

  get knownMethodDict() {
    return this.store.getState();
  }

  addKnownMethodData(fourBytePrefix: string, data: KnownMethodData) {
    this.store.updateState({
      [fourBytePrefix]: data,
    });
  }

  getKnownMethodData(fourBytePrefix: string) {
    return this.knownMethodDict[fourBytePrefix];
  }
}

export default new KnownMethodService();
