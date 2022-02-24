import { ObservableStorage } from 'background/utils/obsStorage';
import eventBus from 'eventBus';
import { EVENTS } from 'constants/index';
// import { nanoid } from 'nanoid';
import { Transaction, TransactionHistoryStore } from './typing';

class TransactionHistoryService {
  store: ObservableStorage<TransactionHistoryStore>;

  constructor() {
    this.store = new ObservableStorage<TransactionHistoryStore>(
      'transaction_history',
      {
        transactions: {},
      }
    );

    eventBus.addEventListener('fetchTransactionsData', () => {
      this.pushDataToUI(this.store.getState().transactions);
    });

    this.store.subscribe((newState) => {
      this.pushDataToUI(newState.transactions);
    });
  }

  pushDataToUI(params: Record<string, Transaction>) {
    eventBus.emit(EVENTS.broadcastToUI, {
      method: 'syncTransactionsData',
      params,
    });
  }

  addTransactionToList(txData: Transaction) {
    // const randomId = nanoid()
    // this.store.transactions[txData.id] = txData
    this.store.updateState({
      transactions: {
        ...this.getTransactionList(),
        [txData.id]: txData,
      },
    });
  }

  addTransactionsToList(txList: Transaction[]) {
    for (const tx of txList) {
      this.addTransactionToList(tx);
    }
  }
  getTransactionList() {
    return this.store.getState().transactions;
  }
}

export default new TransactionHistoryService();
