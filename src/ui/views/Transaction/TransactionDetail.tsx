import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { BigNumber, utils } from 'ethers';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import Header from 'ui/components/Header';
import { TxDirectionLogo } from 'ui/components/TransactionList/TxDirectionLogo';
import './activity-detail.less';
import {
  nonceSortedCompletedTransactionsSelector,
  nonceSortedPendingTransactionsSelector,
} from 'ui/selectors/transactions';
import { useTransactionDisplayData } from 'ui/hooks/metamask/useTxDisplayData';
import {
  TransactionGroup,
  TransactionGroupCategories,
  TransactionStatuses,
} from 'constants/transaction';
import CopyOrOpenInScan from 'ui/components/universal/copyOrOpenInScan';
import { AddressCard } from 'ui/components/universal/AddressCard';
import { IconComponent } from 'ui/components/IconComponents';
import { TokenIcon } from 'ui/components/Widgets';
import { Tooltip } from 'antd';
const shortenedStr = (str: string, digits = 6, isHex = true) =>
  `${str.slice(0, isHex ? digits + 2 : digits)}...${str.slice(-digits)}`;

export default function ActivityDetail() {
  /**
   * Dirty hard work here.
   * UI related Logic please go to _ActivityDetail below
   */
  const { activityId } = useParams<{ activityId: string }>();
  const unfilteredPendingTransactions = useSelector(
    nonceSortedPendingTransactionsSelector
  );
  const unfilteredCompletedTransactions = useSelector(
    nonceSortedCompletedTransactionsSelector
  );
  const transactions = useMemo(
    () => unfilteredPendingTransactions.concat(unfilteredCompletedTransactions),
    [unfilteredPendingTransactions, unfilteredCompletedTransactions]
  );

  const transaction = useMemo(() => {
    const target = transactions.find((txg) => {
      return txg.transactions.findIndex((tx) => tx.id === activityId) > -1;
    });
    // const target = transactions[activityId]
    console.debug('transaction data:', target);
    return target;
  }, [transactions, activityId]);

  // no if return before a hook, so let's do this
  if (!transaction) {
    return (
      <div className="activity-detail">
        <Header title="" />
        <div className="flex">No Transation was found.</div>
      </div>
    );
  } else {
    return <_ActivityDetail transaction={transaction} />;
  }
}

export function _ActivityDetail({
  transaction,
}: {
  transaction: TransactionGroup;
}) {
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
    token,
  } = useTransactionDisplayData(transaction);

  const {
    provider: { rpcPrefs },
  } = useSelector((state) => state.network);

  const handleExplorerClick = useCallback(
    (type: 'address' | 'tx', hash: string) => {
      window.open(`${rpcPrefs.blockExplorerUrl}/${type}/${hash}`);
    },
    [rpcPrefs]
  );

  const statusBackground = useMemo(() => {
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

  /**
   * This fn is only build for UI
   */
  const displayPrimaryCurrency = useMemo(() => {
    // split by space
    const [amount, unit] = primaryCurrency.split(' ');
    return { amount, unit };
  }, [primaryCurrency]);

  return (
    <div className={'activity-detail ' + statusBackground}>
      <Header title={title} />
      <div className="txdetail-direction-logo flex justify-center">
        {/* workaround as hook treat native token as undefined */}
        <TokenIcon
          token={token || ({ isNative: true } as any)}
          useThemeBg
          radius={48}
        />
      </div>
      <div className="txdetail-values flex flex-wrap justify-center">
        <div className="txdetail-value-display">
          <p className="txdetail-value items-baseline">
            {displayPrimaryCurrency.amount}
            <span className="unit">{displayPrimaryCurrency.unit}</span>
          </p>
        </div>
        <div className="break"></div>
        <p className={'txdetail-status capitalize ' + statusBackground}>
          {displayedStatusKey}
        </p>
      </div>
      <div className="details content-wrap-padding">
        <div className="row from-and-to justify-center">
          <AddressCard title="From" address={senderAddress} />
          <IconComponent name="arrow-right" cls="to-icon" />
          {recipientAddress && (
            <AddressCard title="To" address={recipientAddress} />
          )}
        </div>
        {transaction.primaryTransaction.hash && (
          <div className="row">
            <div className="field-name">Transaction ID</div>
            <div className="field-value">
              <Tooltip
                placement="topRight"
                title={transaction.primaryTransaction.hash}
              >
                {shortenedStr(transaction.primaryTransaction.hash, 4)}
              </Tooltip>
              <CopyOrOpenInScan
                handleExplorerClick={() =>
                  handleExplorerClick(
                    'tx',
                    transaction.primaryTransaction.hash!
                  )
                }
                textToBeCopy={transaction.primaryTransaction.hash}
              />
            </div>
          </div>
        )}
        {
          <div className="row">
            <div className="field-name">Transaction Fee</div>
            <div className="field-value">
              {utils.formatEther(
                BigNumber.from(
                  // use gasPrice (legacy) or maxFeePerGas(1559 network)
                  transaction.primaryTransaction.txParams.maxFeePerGas ||
                    transaction.primaryTransaction.txParams.gasPrice
                ).mul(transaction.primaryTransaction.txParams.gas)
              )}{' '}
              {primaryCurrency.split(' ')[1]}
            </div>
          </div>
        }
        {!isPending && (
          <div className="row">
            <div className="field-name">Time</div>
            <div className="field-value" title={date}>
              {dayjs(transaction.initialTransaction.time).format(
                'YYYY-MM-DD HH:mm:ss'
              )}
            </div>
          </div>
        )}
        {isPending && (
          <div className="row pending-tx-actions">
            <button
              className="editGasBtn"
              type="button"
              onClick={() => alert('Gas Edit to be implemented')}
            >
              <IconComponent name="rocket" />
              Gas
            </button>
            <button
              className="cancelBtn"
              type="button"
              onClick={() => alert('Cancel Tx to be implemented')}
            >
              <IconComponent name="cancel" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
