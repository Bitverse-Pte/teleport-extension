import React, { useCallback, useMemo, useState } from 'react';
import '../style.less';
import { useSelector } from 'react-redux';
import { NoContent } from '../../universal/NoContent';
import { ActivitiesListParams } from '../typing';
import { CosmosTransactionItem } from './TxItem.component';
import { getTransactionsForCurrentProviderAndAccount } from 'ui/selectors/cosmos-transaction.selector';
import { getTokenBalancesOfCurrentAccount } from 'ui/selectors/token.selector';

const PAGE_INCREMENT = 10;

export function CosmosTransactionsList({
  listContiannerHeight = '100%',
  tokenId,
}: ActivitiesListParams) {
  const allTxForCurrentChain = useSelector(
    getTransactionsForCurrentProviderAndAccount
  );
  const balances = useSelector(getTokenBalancesOfCurrentAccount);
  const matchedToken = balances.find((t) => t.tokenId === tokenId);

  console.debug('CosmosTransactionsList::matchedToken:', matchedToken);
  const filteredTxForCurrentChainAndToken = allTxForCurrentChain.filter(
    (tx) => {
      // if no matched token, then display all
      if (!matchedToken) return true;

      return tx.currency?.coinMinimalDenom === matchedToken.denom;
    }
  );

  const [limit, setLimit] = useState(PAGE_INCREMENT);
  const viewMore = useCallback(
    () => setLimit((prev) => prev + PAGE_INCREMENT),
    []
  );

  /**
   * Add filter here
   * Please noticed that `tokenAddress` and `hideTokenTransactions`
   * are already implemented filter in redux,
   * so here focus on the others
   */
  const transactions = filteredTxForCurrentChainAndToken
    // simple pagination like MetaMask
    .slice(0, limit);

  if (transactions.length === 0) {
    return <NoContent title="activity" />;
  }

  const onContainnerScroll = (
    event: React.UIEvent<HTMLDivElement, UIEvent>
  ) => {
    const { currentTarget } = event;
    const isScrollToTheBottom =
      currentTarget.scrollHeight - currentTarget.scrollTop ===
      currentTarget.clientHeight;
    if (isScrollToTheBottom) {
      console.debug('scrolled to the bottom');
      viewMore();
    }
  };

  return (
    <div
      style={{ height: listContiannerHeight, overflowY: 'scroll' }}
      onScroll={onContainnerScroll}
    >
      {transactions.map((tx, idx) => (
        <CosmosTransactionItem
          transaction={tx}
          idx={idx}
          key={tx.id}
          // style={args.style}
        />
      ))}
    </div>
  );
}
