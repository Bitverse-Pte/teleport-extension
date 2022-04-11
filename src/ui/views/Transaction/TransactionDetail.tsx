import React, { Fragment, useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { BigNumber, utils } from 'ethers';
import { useHistory, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import Header from 'ui/components/Header';
import { TxDirectionLogo } from 'ui/components/TransactionList/TxDirectionLogo';
import './activity-detail.less';
import {
  nonceSortedCompletedTransactionsSelector,
  nonceSortedPendingTransactionsSelector,
} from 'ui/selectors/transactions';
import { useTransactionDisplayData } from 'ui/hooks/wallet/useTxDisplayData';
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
import { TransactionFee } from './TransactionFee';
import { cancelTxs } from 'ui/state/actions';
import { useWallet } from 'ui/utils';
import CancelSpeedupPopover from 'ui/components/TransactionList/CancelAndSpeedUp/CancelAndSpeedUp.popover';
import { EDIT_GAS_MODES } from 'constants/gas';
import { useTranslation } from 'react-i18next';
import skynet from 'utils/skynet';
import { getCurrentProviderNativeToken } from 'ui/selectors/selectors';
import CancelButton from 'ui/components/TransactionList/CancelAndSpeedUp/CancelButton';
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

  const speedUpTx = useCallback(() => {
    alert('Gas Edit to be implemented');
  }, []);

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
            <TransactionFee transaction={transaction} />
            {!isPending && (
              <div className="row">
                <div className="field-name">Time</div>
                <div className="field-value" title={date}>
                  {dayjs(transaction.primaryTransaction.time).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
                </div>
              </div>
            )}
            {isPending && (
              <div className="row pending-tx-actions">
                {/* @todo: disabled because speedup / cancel is not finish - Frank */}
                <button
                  className="editGasBtn"
                  type="button"
                  onClick={handleSpeedUpClick}
                >
                  {t('speedUp')}
                </button>
                <CancelButton
                  cancelTransaction={handleCancelClick}
                  className="cancelBtn"
                  transaction={transaction.primaryTransaction}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {isPending && (
        <CancelSpeedupPopover
          editGasMode={currentEditGasMode}
          showPopOver={showCancelPopOver}
          setShowPopOver={setShowCancelPopOver}
          cancelTransaction={cancelTx}
          speedUpTransaction={speedUpTx}
          transaction={transaction.primaryTransaction}
          updateTransactionToTenPercentIncreasedGasFee={(fee) => {
            console.debug(
              'updateTransactionToTenPercentIncreasedGasFee::val',
              fee
            );
          }}
          updateTransactionUsingEstimate={(l) => {
            console.debug('updateTransactionUsingEstimate::val', l);
          }}
        />
      )}
    </Fragment>
  );
}
