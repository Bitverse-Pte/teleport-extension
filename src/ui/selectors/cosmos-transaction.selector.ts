import { createSelector } from 'reselect';
import type { RootState } from 'ui/reducer';
import { ChainIdHelper } from 'utils/cosmos/chainId';
import { getCurrentSelectedAccount, getProvider } from './selectors';

export const getCosmosTransactions = (state: RootState) => {
  // latest first
  return Object.values(state.cosmosTxHistory).sort(
    (a, b) => b.timestamp - a.timestamp
  );
};

export const getTransactionsForCurrentProvider = createSelector(
  getCosmosTransactions,
  getProvider,
  (transactions, { chainId }) => {
    const currentCosmosChainIdentifier =
      ChainIdHelper.parse(chainId).identifier;
    return transactions.filter(
      (tx) =>
        tx.chainInfo &&
        tx.chainInfo.chainId &&
        ChainIdHelper.parse(tx.chainInfo?.chainId).identifier ===
          currentCosmosChainIdentifier
    );
  }
);

export const getTransactionsForCurrentProviderAndAccount = createSelector(
  getTransactionsForCurrentProvider,
  getCurrentSelectedAccount,
  (txs, currentAccount) =>
    txs.filter((tx) => tx.account?.address === currentAccount?.address)
);

export const getCosmosTransactionById = (activityId: string) =>
  createSelector(getCosmosTransactions, (transactions) => {
    const target = transactions.find((tx) => {
      return tx.id === activityId;
    });
    return target;
  });
