import { createPersistStore } from 'background/utils';
import { networkPreferenceService } from 'background/service';
import { CoinType, Ecosystem, Provider } from 'types/network';
export interface ContactBookItem {
  name: string;
  address: string;
  ecosystem: string;
  id: string;
}

type ContactBookStore = Record<string, ContactBookItem | undefined>;

class ContactBook {
  store!: ContactBookStore;

  init = async () => {
    this.store = await createPersistStore<ContactBookStore>({
      name: 'contactBook',
      template: {},
    });
  };

  getContactByAddress = (address: string) => {
    return this.store[address.toLowerCase()];
  };

  addContact = (data) => {
    const { ecosystem, id } = networkPreferenceService.getProviderConfig();
    this.store[data.address.toLowerCase()] = { ...data, ecosystem, id };
  };
  addContactByDefaultName = (address: string) => {
    const len = this.listContacts().length;
    const name = `addr-${len}`;
    this.addContact({ name, address });
  };

  removeContact = (address: string) => {
    this.store[address.toLowerCase()] = undefined;
  };

  updateContact = (data: ContactBookItem) => {
    const { ecosystem, id } = networkPreferenceService.getProviderConfig();
    this.store[data.address.toLowerCase()] = { ...data, ecosystem, id };
  };

  listContacts = (): ContactBookItem[] => {
    const list = Object.values(this.store);
    return list.filter((item): item is ContactBookItem => !!item) || [];
  };
  listContactsByChain = (): ContactBookItem[] => {
    const { ecosystem, id } = networkPreferenceService.getProviderConfig();
    const list = Object.values(this.store);
    return (
      list.filter((item): item is ContactBookItem => {
        if (ecosystem === Ecosystem.EVM) {
          return !!item && item.ecosystem === Ecosystem.EVM;
        }
        if (ecosystem === Ecosystem.COSMOS) {
          return !!item && item.id === id;
        }
        return !!item;
      }) || []
    );
  };
}

export default new ContactBook();
