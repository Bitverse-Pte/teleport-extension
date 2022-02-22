import { createSelector } from 'reselect';
// import {
//   PRIORITY_STATUS_HASH,
//   PENDING_STATUS_HASH,
// } from '../helpers/constants/transactions';
import {
  PRIORITY_STATUS_HASH,
  PENDING_STATUS_HASH,
  TransactionStatuses,
  TransactionTypes,
  TransactionGroup,
  Transaction,
} from 'constants/transaction';
import { hexToDecimal } from '../utils/conversion';
import txHelper from '../helpers/utils/tx-helper';

// import {
//   TransactionStatuses,
//   TransactionTypes,
// } from '../../shared/constants/transaction';
// import { transactionMatchesNetwork } from '../../shared/modules/transaction.utils';
import { getCurrentChainId, getSelectedAddress } from './selectors';
import { RootState } from '../reducer';
import { BigNumber } from 'ethers';
import { pickBy } from 'lodash';
import { transactionMatchesNetwork } from 'background/service/transactions/lib/util';
// import { getSelectedAddress } from '.';

export const unapprovedTxsSelector = (state: RootState) => {
  const { chainId } = state.network.provider;
  return pickBy(
    state.transactions,
    (transaction) =>
      transaction.status === TransactionStatuses.UNAPPROVED &&
      transactionMatchesNetwork(transaction, chainId)
  );
};

export const incomingTxListSelector = (state: RootState) => {
  //   const { showIncomingTransactions } = state.metamask.featureFlags;
  //   if (!showIncomingTransactions) {
  return [];
  //   }

  //   const {
  //     network,
  //     provider: { chainId },
  //   } = state.network;
  //   const selectedAddress = getSelectedAddress(state);
  //   return Object.values(state.metamask.incomingTransactions).filter(
  //     (tx) =>
  //       tx.txParams.to === selectedAddress &&
  //       transactionMatchesNetwork(tx, chainId, network),
  //   );
};
export const unapprovedMsgsSelector = (state: RootState) => ({});
// state.metamask.unapprovedMsgs;
export const currentNetworkTxListSelector = (state: RootState) => {
  // state.metamask.currentNetworkTxList;
  const { chainId } = state.network.provider;
  return Object.values(state.transactions).filter((tx) => {
    return BigNumber.from(tx.chainId).eq(chainId);
  });
};
export const unapprovedPersonalMsgsSelector = (state: RootState) => ({});
// state.metamask.unapprovedPersonalMsgs;
export const unapprovedDecryptMsgsSelector = (state: RootState) => ({});
// state.metamask.unapprovedDecryptMsgs;
export const unapprovedEncryptionPublicKeyMsgsSelector = (
  state: RootState
) => ({});
// state.metamask.unapprovedEncryptionPublicKeyMsgs;
export const unapprovedTypedMessagesSelector = (state: RootState) => ({});
// state.metamask.unapprovedTypedMessages;

export const selectedAddressTxListSelector = createSelector(
  getSelectedAddress,
  currentNetworkTxListSelector,
  (selectedAddress, transactions = []) => {
    const isSelectedAddress = (from: string) => from === selectedAddress;
    return transactions.filter(({ txParams }) =>
      isSelectedAddress(txParams.from)
    );
  }
);

export const unapprovedMessagesSelector = createSelector(
  unapprovedMsgsSelector,
  unapprovedPersonalMsgsSelector,
  unapprovedDecryptMsgsSelector,
  unapprovedEncryptionPublicKeyMsgsSelector,
  unapprovedTypedMessagesSelector,
  getCurrentChainId,
  (
    unapprovedMsgs = {},
    unapprovedPersonalMsgs = {},
    unapprovedDecryptMsgs = {},
    unapprovedEncryptionPublicKeyMsgs = {},
    unapprovedTypedMessages = {},
    chainId
  ) =>
    txHelper(
      /**
       * since unapproved tx is in `transactions` already
       * there is no needd to put them here.
       */
      {},
      unapprovedMsgs,
      unapprovedPersonalMsgs,
      unapprovedDecryptMsgs,
      unapprovedEncryptionPublicKeyMsgs,
      unapprovedTypedMessages,
      chainId
    ) || []
);

export const transactionSubSelector = createSelector(
  unapprovedMessagesSelector,
  incomingTxListSelector,
  (unapprovedMessages = [], incomingTxList = []) => {
    return unapprovedMessages.concat(incomingTxList);
  }
);

export const transactionsSelector = createSelector(
  transactionSubSelector,
  selectedAddressTxListSelector,
  (subSelectorTxList = [], selectedAddressTxList = []) => {
    const txsToRender = selectedAddressTxList.concat(subSelectorTxList);

    return txsToRender.sort((a, b) => b.time - a.time);
  }
);

/**
 * @name insertOrderedNonce
 * @private
 * @description Inserts (mutates) a nonce into an array of ordered nonces, sorted in ascending
 * order.
 * @param {string[]} nonces - Array of nonce strings in hex
 * @param {string} nonceToInsert - Nonce string in hex to be inserted into the array of nonces.
 * @returns {string[]}
 */
const insertOrderedNonce = (nonces: string[], nonceToInsert: string) => {
  let insertIndex = nonces.length;

  for (let i = 0; i < nonces.length; i++) {
    const nonce = nonces[i];

    if (Number(hexToDecimal(nonce)) > Number(hexToDecimal(nonceToInsert))) {
      insertIndex = i;
      break;
    }
  }

  nonces.splice(insertIndex, 0, nonceToInsert);
};

/**
 * @name insertTransactionByTime
 * @private
 * @description Inserts (mutates) a transaction object into an array of ordered transactions, sorted
 * in ascending order by time.
 * @param transactions - Array of transaction objects.
 * @param transaction - Transaction object to be inserted into the array of transactions.
 * @returns {Transaction[]}
 */
const insertTransactionByTime = (
  transactions: Transaction[],
  transaction: Transaction
) => {
  const { time } = transaction;

  let insertIndex = transactions.length;

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];

    if (tx.time > time) {
      insertIndex = i;
      break;
    }
  }

  transactions.splice(insertIndex, 0, transaction);
};

/**
 * Contains transactions and properties associated with those transactions of the same nonce.
 * @typedef {Object} transactionGroup
 * @property {string} nonce - The nonce that the transactions within this transactionGroup share.
 * @property {Object[]} transactions - An array of transaction (txMeta) objects.
 * @property {Object} initialTransaction - The transaction (txMeta) with the lowest "time".
 * @property {Object} primaryTransaction - Either the latest transaction or the confirmed
 * transaction.
 * @property {boolean} hasRetried - True if a transaction in the group was a retry transaction.
 * @property {boolean} hasCancelled - True if a transaction in the group was a cancel transaction.
 */

/**
 * @name insertTransactionGroupByTime
 * @private
 * @description Inserts (mutates) a transactionGroup object into an array of ordered
 * transactionGroups, sorted in ascending order by nonce.
 * @param {transactionGroup[]} transactionGroups - Array of transactionGroup objects.
 * @param {transactionGroup} transactionGroup - transactionGroup object to be inserted into the
 * array of transactionGroups.
 */
const insertTransactionGroupByTime = (
  transactionGroups: TransactionGroup[],
  transactionGroup: TransactionGroup
) => {
  const { primaryTransaction: { time: groupToInsertTime } = {} } =
    transactionGroup;

  let insertIndex = transactionGroups.length;

  for (let i = 0; i < transactionGroups.length; i++) {
    const txGroup = transactionGroups[i];
    const { primaryTransaction: { time } = {} } = txGroup;

    if (
      // type safe
      time &&
      groupToInsertTime &&
      time > groupToInsertTime
    ) {
      insertIndex = i;
      break;
    }
  }

  transactionGroups.splice(insertIndex, 0, transactionGroup);
};

/**
 * @name mergeNonNonceTransactionGroups
 * @private
 * @description Inserts (mutates) transactionGroups that are not to be ordered by nonce into an array
 * of nonce-ordered transactionGroups by time.
 * @param {transactionGroup[]} orderedTransactionGroups - Array of transactionGroups ordered by
 * nonce.
 * @param {transactionGroup[]} nonNonceTransactionGroups - Array of transactionGroups not intended to be ordered by nonce,
 * but intended to be ordered by timestamp
 */
const mergeNonNonceTransactionGroups = (
  orderedTransactionGroups: TransactionGroup[],
  nonNonceTransactionGroups: TransactionGroup[]
) => {
  nonNonceTransactionGroups.forEach((transactionGroup) => {
    insertTransactionGroupByTime(orderedTransactionGroups, transactionGroup);
  });
};

/**
 * @name nonceSortedTransactionsSelector
 * @description Returns an array of transactionGroups sorted by nonce in ascending order.
 * @returns {transactionGroup[]}
 */
export const nonceSortedTransactionsSelector = createSelector(
  transactionsSelector,
  (transactions: Transaction[] = []) => {
    const unapprovedTransactionGroups: TransactionGroup[] = [];
    const incomingTransactionGroups: TransactionGroup[] = [];
    const orderedNonces = [];
    const nonceToTransactionsMap = {};

    transactions.forEach((transaction) => {
      const {
        txParams: { nonce } = {},
        status,
        type,
        time: txTime,
      } = transaction;

      if (typeof nonce === 'undefined' || type === TransactionTypes.INCOMING) {
        const transactionGroup = {
          transactions: [transaction],
          initialTransaction: transaction,
          primaryTransaction: transaction,
          hasRetried: false,
          hasCancelled: false,
        };

        if (type === TransactionTypes.INCOMING) {
          incomingTransactionGroups.push(transactionGroup);
        } else {
          insertTransactionGroupByTime(
            unapprovedTransactionGroups,
            transactionGroup
          );
        }
      } else if (nonce in nonceToTransactionsMap) {
        const nonceProps = nonceToTransactionsMap[nonce];
        insertTransactionByTime(nonceProps.transactions, transaction);

        const { primaryTransaction: { time: primaryTxTime = 0 } = {} } =
          nonceProps;

        const previousPrimaryIsNetworkFailure =
          nonceProps.primaryTransaction.status === TransactionStatuses.FAILED &&
          nonceProps.primaryTransaction?.txReceipt?.status !== '0x0';
        const currentTransactionIsOnChainFailure =
          transaction?.txReceipt?.status === '0x0';

        if (
          status === TransactionStatuses.CONFIRMED ||
          currentTransactionIsOnChainFailure ||
          previousPrimaryIsNetworkFailure ||
          (txTime > primaryTxTime && status in PRIORITY_STATUS_HASH)
        ) {
          nonceProps.primaryTransaction = transaction;
        }

        const { initialTransaction: { time: initialTxTime = 0 } = {} } =
          nonceProps;

        // Used to display the transaction action, since we don't want to overwrite the action if
        // it was replaced with a cancel attempt transaction.
        if (txTime < initialTxTime) {
          nonceProps.initialTransaction = transaction;
        }

        if (type === TransactionTypes.RETRY && status in PRIORITY_STATUS_HASH) {
          nonceProps.hasRetried = true;
        }

        if (
          type === TransactionTypes.CANCEL &&
          status in PRIORITY_STATUS_HASH
        ) {
          nonceProps.hasCancelled = true;
        }
      } else {
        nonceToTransactionsMap[nonce] = {
          nonce,
          transactions: [transaction],
          initialTransaction: transaction,
          primaryTransaction: transaction,
          hasRetried:
            transaction.type === TransactionTypes.RETRY &&
            transaction.status in PRIORITY_STATUS_HASH,
          hasCancelled:
            transaction.type === TransactionTypes.CANCEL &&
            transaction.status in PRIORITY_STATUS_HASH,
        };

        insertOrderedNonce(orderedNonces, nonce);
      }
    });

    const orderedTransactionGroups = orderedNonces.map(
      (nonce) => nonceToTransactionsMap[nonce]
    );
    mergeNonNonceTransactionGroups(
      orderedTransactionGroups,
      incomingTransactionGroups
    );
    return unapprovedTransactionGroups.concat(orderedTransactionGroups);
  }
);

/**
 * @name nonceSortedPendingTransactionsSelector
 * @description Returns an array of transactionGroups where transactions are still pending sorted by
 * nonce in descending order.
 * @returns {transactionGroup[]}
 */
export const nonceSortedPendingTransactionsSelector = createSelector(
  nonceSortedTransactionsSelector,
  (transactions = []) =>
    transactions.filter(
      ({ primaryTransaction }) =>
        primaryTransaction.status in PENDING_STATUS_HASH
    )
);

/**
 * @name nonceSortedCompletedTransactionsSelector
 * @description Returns an array of transactionGroups where transactions are confirmed sorted by
 * nonce in descending order.
 * @returns {transactionGroup[]}
 */
export const nonceSortedCompletedTransactionsSelector = createSelector(
  nonceSortedTransactionsSelector,
  (transactions = []) =>
    transactions
      .filter(
        ({ primaryTransaction }) =>
          !(primaryTransaction.status in PENDING_STATUS_HASH)
      )
      .reverse()
);

export const submittedPendingTransactionsSelector = createSelector(
  transactionsSelector,
  (transactions = []) =>
    transactions.filter(
      (transaction) => transaction.status === TransactionStatuses.SUBMITTED
    )
);
