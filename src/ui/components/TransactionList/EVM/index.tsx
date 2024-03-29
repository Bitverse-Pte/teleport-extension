import { utils } from 'ethers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, {
  Fragment,
  MouseEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import '../style.less';
import { TxDirectionLogo } from '../TxDirectionLogo';
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
import { useTransactionDisplayData } from 'ui/hooks/wallet/useTxDisplayData';
import { useTranslation } from 'react-i18next';
import { getCurrentChainId } from 'ui/selectors/selectors';
import {
  nonceSortedPendingTransactionsSelector,
  nonceSortedCompletedTransactionsSelector,
} from 'ui/selectors/transactions';
import { isEqualCaseInsensitive, shortenAddress } from 'ui/utils/utils';
import { useShouldShowSpeedUp } from 'ui/hooks/wallet/useShouldShowSpeedUp';
import { Button, Tooltip } from 'antd';
import { NoContent } from '../../universal/NoContent';
import { IconComponent } from '../../IconComponents';
import clsx from 'clsx';
import { addEllipsisToEachWordsInTheEnd } from 'ui/helpers/utils/currency-display.util';
import CancelSpeedupPopover from 'ui/components/TransactionCancelAndSpeedUp/CancelAndSpeedUp.popover';
import { EDIT_GAS_MODES } from 'constants/gas';
import { ReactComponent as RocketIcon } from 'assets/rocket.svg';
import { ActivitiesListParams, TransactionItemParams } from '../typing';
import { getTokenBalancesOfCurrentAccount } from 'ui/selectors/token.selector';
import { Token } from 'types/token';
import { useDarkmode } from 'ui/hooks/useDarkMode';

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

function EvmTransactionItem({
  transactionGroup,
  idx,
  style,
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
  // const isSignatureReq =
  //   category === TransactionGroupCategories.SIGNATURE_REQUEST;
  // const isApproval = category === TransactionGroupCategories.APPROVAL;
  const isUnapproved = status === TransactionStatuses.UNAPPROVED;
  // const isSwap = category === TransactionGroupCategories.SWAP;

  const history = useHistory();

  // const shouldShowSpeedUp = useShouldShowSpeedUp(
  //   transactionGroup,
  //   isEarliestNonce
  // );
  const shouldShowSpeedUp = true;

  const [showCancelPopOver, setShowCancelPopOver] = useState(false);
  const [currentEditGasMode, setEditGasMode] = useState<EDIT_GAS_MODES>(
    EDIT_GAS_MODES.MODIFY_IN_PLACE
  );

  const popupCancelAndSpeedUpWithMode = (mode: EDIT_GAS_MODES) => {
    setEditGasMode(mode);
    setShowCancelPopOver(true);
  };

  const cancelTransaction = (e: React.MouseEvent<HTMLButtonElement>) => {
    // stop going to detail page
    e.stopPropagation();
    e.preventDefault();
    popupCancelAndSpeedUpWithMode(EDIT_GAS_MODES.CANCEL);
  };
  const retryTransaction = (e: React.MouseEvent<HTMLButtonElement>) => {
    // stop going to detail page
    e.stopPropagation();
    e.preventDefault();
    popupCancelAndSpeedUpWithMode(EDIT_GAS_MODES.SPEED_UP);
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
        <RocketIcon /> {t('speedUp')}
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
    <Fragment>
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
            <div className="grey-02 from-and-to flex items-center mr-auto mb-8">
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
              {dayjs(transactionGroup.primaryTransaction.time).format(
                'YYYY-MM-DD HH:mm:ss'
              )}
            </span>
          )}
          {isPending && (
            <div className="pending-tx-actions ml-auto">{speedUpButton}</div>
          )}
        </div>
      </div>
      {isPending && showCancelPopOver && (
        <CancelSpeedupPopover
          editGasMode={currentEditGasMode}
          showPopOver={showCancelPopOver}
          setShowPopOver={setShowCancelPopOver}
          transaction={transactionGroup.primaryTransaction}
        />
      )}
    </Fragment>
  );
}

export function EvmTransactionsList({
  listContiannerHeight = '100%',
  tokenId,
  ...otherFilter
}: ActivitiesListParams) {
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
  const balances = useSelector(getTokenBalancesOfCurrentAccount);
  const matchedToken = balances.find((t) => t.tokenId === tokenId);
  const pendingTransactions = useMemo(
    () =>
      getFilteredTransactionGroups(
        unfilteredPendingTransactions,
        matchedToken?.isNative,
        matchedToken?.contractAddress,
        chainId
      ),
    [matchedToken, unfilteredPendingTransactions, chainId]
  );
  const completedTransactions = useMemo(
    () =>
      getFilteredTransactionGroups(
        unfilteredCompletedTransactions,
        matchedToken?.isNative,
        matchedToken?.contractAddress,
        chainId
      ),
    [matchedToken, unfilteredCompletedTransactions, chainId]
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
  }, [rawTransactionsGroup, txgFilter, limit]);
  const { isDarkMode } = useDarkmode();

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
      className={clsx('activity-list-container', { dark: isDarkMode })}
      onScroll={onContainnerScroll}
    >
      {transactions.map((tx, idx) => (
        <EvmTransactionItem
          transactionGroup={tx}
          idx={idx}
          key={tx.initialTransaction.id}
          // style={args.style}
        />
      ))}
    </div>
  );
}
