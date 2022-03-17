import { utils } from 'ethers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { MouseEvent, useCallback, useMemo, useState } from 'react';
import './style.less';
import { TxDirectionLogo } from './TxDirectionLogo';
import { useSelector } from 'react-redux';
import {
  TOKEN_CATEGORY_HASH,
  Transaction,
  TransactionGroup,
  TransactionGroupCategories,
  TransactionStatuses,
  TransactionTypes,
} from 'constants/transaction';
import { useHistory } from 'react-router-dom';
import { useTransactionDisplayData } from 'ui/hooks/metamask/useTxDisplayData';
import { useTranslation } from 'react-i18next';
import { getCurrentChainId } from 'ui/selectors/selectors';
import {
  nonceSortedPendingTransactionsSelector,
  nonceSortedCompletedTransactionsSelector,
} from 'ui/selectors/transactions';
import { isEqualCaseInsensitive, shortenAddress } from 'ui/utils/utils';
import { useShouldShowSpeedUp } from 'ui/hooks/metamask/useShouldShowSpeedUp';
import { Button, Tooltip } from 'antd';
import CancelButton from './CancelButton';
import { NoContent } from '../universal/NoContent';
import { IconComponent } from '../IconComponents';
import clsx from 'clsx';
import { addEllipsisToEachWordsInTheEnd } from 'ui/helpers/utils/currency-display.util';

dayjs.extend(relativeTime);

const PAGE_INCREMENT = 10;

const shortenedStr = (str: string, digits = 6, isHex = true) =>
  `${str.slice(0, isHex ? digits + 2 : digits)}...${str.slice(-digits)}`;

// When we are on a token page, we only want to show transactions that involve that token.
// In the case of token transfers or approvals, these will be transactions sent to the
// token contract. In the case of swaps, these will be transactions sent to the swaps contract
// and which have the token address in the transaction data.
//
// getTransactionGroupRecipientAddressFilter is used to determine whether a transaction matches
// either of those criteria
const getTransactionGroupRecipientAddressFilter = (
  recipientAddress: string,
  chainId?: string
) => {
  return ({ initialTransaction: { txParams } }: TransactionGroup) => {
    return isEqualCaseInsensitive(txParams?.to as string, recipientAddress);
    //   || (txParams?.to === SWAPS_CHAINID_CONTRACT_ADDRESS_MAP[chainId] &&
    //     txParams.data.match(recipientAddress.slice(2)))
  };
};

const tokenTransactionFilter = ({
  initialTransaction: { type },
}: TransactionGroup) => {
  if (TOKEN_CATEGORY_HASH[type]) {
    return false;
  }
  //   else if (type === TransactionTypes.SWAP) {
  //     return destinationTokenSymbol === 'ETH' || sourceTokenSymbol === 'ETH';
  //   }
  return true;
};

const getFilteredTransactionGroups = (
  transactionGroups: TransactionGroup[],
  hideTokenTransactions?: boolean,
  tokenAddress?: string,
  chainId?: string
) => {
  if (hideTokenTransactions) {
    return transactionGroups.filter(tokenTransactionFilter);
  } else if (tokenAddress) {
    return transactionGroups.filter(
      getTransactionGroupRecipientAddressFilter(tokenAddress, chainId)
    );
  }
  return transactionGroups;
};

interface ActivitiesListParams {
  listContiannerHeight: string | number;
  hideTokenTransactions?: boolean;
  tokenAddress?: string;
  dateFilter?: {
    from: Date;
    to: Date;
  };
  txData?: string;
}

interface TransactionItemParams {
  transactionGroup: TransactionGroup;
  idx: number;
  style?: React.CSSProperties;
  isEarliestNonce?: boolean;
}

function TransactionItem({
  transactionGroup,
  idx,
  style,
  isEarliestNonce = false,
}: TransactionItemParams) {
  const {
    title,
    subtitle,
    subtitleContainsOrigin,
    date,
    category,
    primaryCurrency,
    recipientAddress,
    secondaryCurrency,
    displayedStatusKey,
    isPending,
    senderAddress,
  } = useTransactionDisplayData(transactionGroup);
  const {
    initialTransaction: { id },
    primaryTransaction: { status },
    hasCancelled,
  } = transactionGroup;
  const { t } = useTranslation();
  // @todo: implement button for these status
  const isSignatureReq =
    category === TransactionGroupCategories.SIGNATURE_REQUEST;
  const isApproval = category === TransactionGroupCategories.APPROVAL;
  const isUnapproved = status === TransactionStatuses.UNAPPROVED;
  // const isSwap = category === TransactionGroupCategories.SWAP;

  const history = useHistory();

  // const shouldShowSpeedUp = useShouldShowSpeedUp(
  //   transactionGroup,
  //   isEarliestNonce
  // );
  const shouldShowSpeedUp = true;

  // @todo: need to implement the cancel and retry
  const cancelTransaction = (e: React.MouseEvent<HTMLButtonElement>) => {
    // stop going to detail page
    e.stopPropagation();
    alert('Cancel tx, to be implemented...');
  };
  const retryTransaction = (e: React.MouseEvent<HTMLButtonElement>) => {
    // stop going to detail page
    e.stopPropagation();
    alert('retry tx to edit, to be implemented...');
  };

  const speedUpButton = useMemo(() => {
    if (!shouldShowSpeedUp || !isPending || isUnapproved) {
      return null;
    }
    return (
      <button
        className="gasBtn"
        onClick={hasCancelled ? cancelTransaction : retryTransaction}
        style={hasCancelled ? { width: 'auto' } : {}}
      >
        {t('speedUp')}
      </button>
    );
  }, [
    shouldShowSpeedUp,
    isUnapproved,
    t,
    isPending,
    hasCancelled,
    retryTransaction,
    cancelTransaction,
  ]);

  const colorByStatus = useMemo(() => {
    switch (displayedStatusKey) {
      case TransactionStatuses.DROPPED:
      case TransactionStatuses.FAILED:
      case TransactionStatuses.ON_CHAIN_FALIURE:
        return 'error';
      case TransactionStatuses.SUBMITTED:
        return 'pending';
      default:
        return 'default';
    }
  }, [displayedStatusKey]);

  const isEvenStyle = idx % 2 == 0 ? 'is-even' : '';
  /**
   * Usually the amount of approval is so big and irrelavnt.
   * so we just hide the amount in the list like MetaMask did.
   */
  const isHidingAmount = category !== TransactionGroupCategories.APPROVAL;
  return (
    <div
      className={clsx(
        'activity flex justify-start cursor-pointer items-center',
        isEvenStyle
      )}
      key={id}
      style={style}
      onClick={() => history.push(`/activity/${id}`)}
    >
      <TxDirectionLogo
        status={displayedStatusKey}
        type={
          category === TransactionGroupCategories.RECEIVE ? 'receive' : 'send'
        }
        size={30}
      />
      <div
        className="value-n-status-display flex justify-start items-center cursor-pointer flex-wrap"
        id={`tx-${idx}`}
      >
        <p className="tx-title capitalize">{title}</p>
        {isHidingAmount && (
          <p className="tx-value ml-auto" title={primaryCurrency}>
            {addEllipsisToEachWordsInTheEnd(primaryCurrency, 19)}
          </p>
        )}
        {/* hide if recipientAddress not exist e.g contract deploy */}
        {recipientAddress && (
          <div className="grey-02 from-and-to flex items-center mr-auto">
            <span className="from cursor-default">
              <Tooltip placement="top" title={senderAddress}>
                {t('from')}: {shortenedStr(senderAddress, 3)}
              </Tooltip>
            </span>
            <IconComponent name="chevron-right" cls="grey-05" />
            <span className="to cursor-default">
              <Tooltip placement="top" title={recipientAddress}>
                {t('to')}: {shortenedStr(recipientAddress, 3)}
              </Tooltip>
            </span>
          </div>
        )}
        <span className={clsx('status capitalize', colorByStatus)}>
          {t(displayedStatusKey)}
        </span>
        {!isPending && (
          <span className="date">
            {dayjs(transactionGroup.initialTransaction.time).format(
              'YYYY-MM-DD HH:mm:ss'
            )}
          </span>
        )}
        {isPending && (
          <div className="pending-tx-actions ml-auto">
            {/* @todo: disabled because speedup / cancel is not finish - Frank */}
            {/* {speedUpButton} */}
            {/* {!hasCancelled && !isUnapproved && (
              <CancelButton
                transaction={transactionGroup.primaryTransaction}
                cancelTransaction={cancelTransaction}
              />
            )} */}
          </div>
        )}
      </div>
    </div>
    // {isPending && (
    //   <div className={'activity pending-tx-actions ' + isEvenStyle}>
    //     {speedUpButton}
    //     {!hasCancelled && !isUnapproved && (
    //       <CancelButton
    //         transaction={transactionGroup.primaryTransaction}
    //         cancelTransaction={cancelTransaction}
    //       />
    //     )}
    //   </div>
    // )}
  );
}

export function TransactionsList({
  listContiannerHeight = '100%',
  tokenAddress,
  hideTokenTransactions,
  ...otherFilter
}: ActivitiesListParams) {
  // const _transactions = useSelector(state => state.transactions)
  // const transactions = useMemo(() => Object.values(_transactions), [_transactions])
  // mock data
  const unfilteredPendingTransactions = useSelector(
    nonceSortedPendingTransactionsSelector
  );
  const unfilteredCompletedTransactions = useSelector(
    nonceSortedCompletedTransactionsSelector
  );
  // const transactions = useMemo(() =>
  //     unfilteredPendingTransactions.concat(unfilteredCompletedTransactions),
  // [unfilteredPendingTransactions, unfilteredCompletedTransactions])
  const chainId = useSelector(getCurrentChainId);

  const pendingTransactions = useMemo(
    () =>
      getFilteredTransactionGroups(
        unfilteredPendingTransactions,
        hideTokenTransactions,
        tokenAddress,
        chainId
      ),
    [
      hideTokenTransactions,
      tokenAddress,
      unfilteredPendingTransactions,
      chainId,
    ]
  );
  const completedTransactions = useMemo(
    () =>
      getFilteredTransactionGroups(
        unfilteredCompletedTransactions,
        hideTokenTransactions,
        tokenAddress,
        chainId
      ),
    [
      hideTokenTransactions,
      tokenAddress,
      unfilteredCompletedTransactions,
      chainId,
    ]
  );
  const rawTransactionsGroup = useMemo(
    () => pendingTransactions.concat(completedTransactions),
    [pendingTransactions, completedTransactions]
  );

  const [limit, setLimit] = useState(PAGE_INCREMENT);
  const viewMore = useCallback(
    () => setLimit((prev) => prev + PAGE_INCREMENT),
    []
  );

  const txgFilter = useCallback(
    (txg: TransactionGroup) => {
      const { dateFilter, txData: searchTxDataKeyword } = otherFilter;
      if (dateFilter) {
        // `dateFilter` exists, let make sure txg is in the time range
        const isInTimeRange =
          txg.initialTransaction.time >= dateFilter.from.getTime() &&
          txg.initialTransaction.time <= dateFilter.to.getTime();
        if (!isInTimeRange) return false;
      }
      if (searchTxDataKeyword) {
        const elementToFind =
          searchTxDataKeyword.slice(0, 2) === '0x'
            ? // remove hex prefix for easier find
              searchTxDataKeyword.slice(2).toLowerCase()
            : searchTxDataKeyword;
        const isToReceipt = txg.primaryTransaction.txParams.to
          ?.toLowerCase()
          .includes(elementToFind);
        // like ERC20, the receipt address is in the data part
        const isInTxData = txg.primaryTransaction.txParams.data
          ?.toLowerCase()
          .includes(elementToFind);
        const isInTxHash = txg.primaryTransaction.hash
          ?.toLowerCase()
          .includes(elementToFind);
        if (!isToReceipt && !isInTxData && !isInTxHash) {
          return false;
        }
      }

      // if they are not returning false, then is matched to return `true`
      return true;
    },
    [otherFilter]
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
        .filter(txgFilter)
        // simple pagination like MetaMask
        .slice(0, limit)
    );
  }, [rawTransactionsGroup, otherFilter]);

  const pendingLength = pendingTransactions.length;

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
      style={{ height: listContiannerHeight, overflow: 'scroll' }}
      onScroll={onContainnerScroll}
    >
      {transactions.map((tx, idx) => (
        <TransactionItem
          transactionGroup={tx}
          idx={idx}
          key={idx}
          // style={args.style}
        />
      ))}
    </div>
  );
}
