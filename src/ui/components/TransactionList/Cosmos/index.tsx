import React, { useCallback, useMemo, useState } from 'react';
import '../style.less';
import { useSelector } from 'react-redux';
import { NoContent } from '../../universal/NoContent';
import { ActivitiesListParams } from '../typing';
import { CosmosTransactionItem } from './TxItem.component';
import { getTransactionsForCurrentProviderAndAccount } from 'ui/selectors/cosmos-transaction.selector';

const PAGE_INCREMENT = 10;

export function CosmosTransactionsList({
  listContiannerHeight = '100%',
  tokenAddress,
  hideTokenTransactions,
  ...otherFilter
}: ActivitiesListParams) {
  /** @TODO support hideTokenTransactions and tokenAddress */
  const rawTransactionsGroup = useSelector(
    getTransactionsForCurrentProviderAndAccount
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
  const transactions = useMemo(() => {
    return (
      rawTransactionsGroup
        // simple pagination like MetaMask
        .slice(0, limit)
    );
  }, [rawTransactionsGroup, limit]);

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
