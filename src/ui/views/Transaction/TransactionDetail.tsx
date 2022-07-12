import React, { Fragment, useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useHistory, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import Header from 'ui/components/Header';
import './activity-detail.less';
import {
  nonceSortedCompletedTransactionsSelector,
  nonceSortedPendingTransactionsSelector,
} from 'ui/selectors/transactions';
import { useTransactionDisplayData } from 'ui/hooks/wallet/useTxDisplayData';
import { TransactionGroup, TransactionStatuses } from 'constants/transaction';
import CopyOrOpenInScan from 'ui/components/universal/copyOrOpenInScan';
import { AddressCard } from 'ui/components/universal/AddressCard';
import { IconComponent } from 'ui/components/IconComponents';
import { TokenIcon } from 'ui/components/Widgets';
import { Tooltip } from 'antd';
import { cancelTxs } from 'ui/state/actions';
import { useWallet } from 'ui/utils';
import CancelSpeedupPopover from 'ui/components/TransactionCancelAndSpeedUp/CancelAndSpeedUp.popover';
import { EDIT_GAS_MODES } from 'constants/gas';
import { useTranslation } from 'react-i18next';
import skynet from 'utils/skynet';
import { getCurrentProviderNativeToken } from 'ui/selectors/selectors';
import CancelButton from 'ui/components/TransactionCancelAndSpeedUp/CancelButton';
import { ReactComponent as RocketIcon } from 'assets/rocket.svg';
import { TransactionItemDetail } from './components/TransactionItemDetail.component';
import { TransactionGasDetail } from './components/TxGasDetail.component';
const { sensors } = skynet;

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
  const { hasCancelled, primaryTransaction } = transaction;
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

  const isUnapproved =
    primaryTransaction.status === TransactionStatuses.UNAPPROVED;

  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  const {
    provider: { rpcPrefs },
  } = useSelector((state) => state.network);

  const handleExplorerClick = useCallback(
    (type: 'address' | 'tx', hash: string) => {
      sensors.track('teleport_activity_open_' + type, {
        page: location.pathname,
      });
      window.open(`${rpcPrefs.blockExplorerUrl}/${type}/${hash}`);
    },
    [rpcPrefs]
  );

  const [currentEditGasMode, setEditGasMode] = useState<EDIT_GAS_MODES>(
    EDIT_GAS_MODES.MODIFY_IN_PLACE
  );

  const [showCancelPopOver, setShowCancelPopOver] = useState(false);

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

  const walletController = useWallet();

  const cancelTx = useCallback(() => {
    dispatch(cancelTxs(transaction.transactions, walletController));
    sensors.track('teleport_activity_cancelled', {
      page: location.pathname,
    });
    history.goBack();
  }, [dispatch, history]);

  const handleSpeedUpClick = useCallback(() => {
    setEditGasMode(EDIT_GAS_MODES.SPEED_UP);
    setShowCancelPopOver(true);
  }, []);
  const handleCancelClick = useCallback(() => {
    setEditGasMode(EDIT_GAS_MODES.CANCEL);
    setShowCancelPopOver(true);
  }, []);

  /**
   * This fn is only build for UI
   */
  const displayPrimaryCurrency = useMemo(() => {
    // split by space
    const [amount, unit] = primaryCurrency.split(' ');
    return { amount, unit };
  }, [primaryCurrency]);

  const matchedNativeToken = useSelector(getCurrentProviderNativeToken);

  return (
    <Fragment>
      <div className={'activity-detail ' + statusBackground}>
        <Header title={t(title)} />
        <div className="txdetail-direction-logo flex justify-center">
          {/* workaround as hook treat native token as undefined */}
          <div>
            <TokenIcon token={token || matchedNativeToken} radius={48} />
          </div>
        </div>
        <div className="txdetail-values flex flex-wrap justify-center">
          <div className="txdetail-value-display">
            <p className="txdetail-value items-baseline flex-wrap">
              {displayPrimaryCurrency.amount}
              <span className="unit">{displayPrimaryCurrency.unit}</span>
            </p>
          </div>
          <div className="details">
            <div className="row from-and-to justify-center">
              <AddressCard title="From" address={senderAddress} />
              <IconComponent name="arrow-right" cls="to-icon" />
              <AddressCard title="To" address={recipientAddress} />
            </div>
            {primaryTransaction.hash && (
              <div className="row">
                <div className="field-name">Transaction ID</div>
                <div className="field-value">
                  <Tooltip placement="topRight" title={primaryTransaction.hash}>
                    {shortenedStr(primaryTransaction.hash, 4)}
                  </Tooltip>
                  <CopyOrOpenInScan
                    handleExplorerClick={() =>
                      handleExplorerClick('tx', primaryTransaction.hash!)
                    }
                    textToBeCopy={primaryTransaction.hash}
                  />
                </div>
              </div>
            )}
            {!isPending && (
              <TransactionItemDetail
                name="Time"
                hoverValueText={date}
                value={dayjs(primaryTransaction.time).format(
                  'YYYY-MM-DD HH:mm:ss'
                )}
              />
            )}
            <TransactionGasDetail txGroup={transaction} category={category} />
            {isPending && !isUnapproved && (
              <div className="row pending-tx-actions">
                <button
                  className="editGasBtn"
                  type="button"
                  onClick={handleSpeedUpClick}
                >
                  <RocketIcon />
                  {hasCancelled ? t('speedUpCancellation') : t('speedUp')}
                </button>
                {!hasCancelled && (
                  <CancelButton
                    cancelTransaction={handleCancelClick}
                    className="cancelBtn"
                    transaction={primaryTransaction}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {isPending && showCancelPopOver && (
        <CancelSpeedupPopover
          editGasMode={currentEditGasMode}
          showPopOver={showCancelPopOver}
          setShowPopOver={setShowCancelPopOver}
          transaction={primaryTransaction}
        />
      )}
    </Fragment>
  );
}
