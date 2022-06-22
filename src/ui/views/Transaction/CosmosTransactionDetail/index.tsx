import React, { Fragment, useMemo } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import Header from 'ui/components/Header';
import '../activity-detail.less';
import { AddressCard } from 'ui/components/universal/AddressCard';
import { IconComponent } from 'ui/components/IconComponents';
import { TokenIcon } from 'ui/components/Widgets';
import { useTranslation } from 'react-i18next';
import skynet from 'utils/skynet';
import { getCurrentProviderNativeToken } from 'ui/selectors/selectors';
import { TransactionItemDetail } from '../components/TransactionItemDetail.component';
import { MockCosmosTxHistory } from './_MockCosmosTxHistory';
import { useCosmosTxDisplayData } from './useCosmosTxDisplayData';
const { sensors } = skynet;

const activityId = '_pBWBbRUSHFMqiBDW6xcd';
const transaction = MockCosmosTxHistory[activityId];

export default function ActivityDetail() {
  /**
   * Dirty hard work here.
   * UI related Logic please go to _ActivityDetail below
   */
  // const { activityId } = useParams<{ activityId: string }>();
  // const activityId = '_pBWBbRUSHFMqiBDW6xcd';
  // const unfilteredPendingTransactions = useSelector(
  //   nonceSortedPendingTransactionsSelector
  // );
  // const unfilteredCompletedTransactions = useSelector(
  //   nonceSortedCompletedTransactionsSelector
  // );
  // const transactions = useMemo(
  //   () => unfilteredPendingTransactions.concat(unfilteredCompletedTransactions),
  //   [unfilteredPendingTransactions, unfilteredCompletedTransactions]
  // );

  // const transaction = useMemo(() => {
  //   const target = transactions.find((txg) => {
  //     return txg.transactions.findIndex((tx) => tx.id === activityId) > -1;
  //   });
  //   // const target = transactions[activityId]
  //   console.debug('transaction data:', target);
  //   return target;
  // }, [transactions, activityId]);
  // const transaction = MockCosmosTxHistory[activityId];

  // no if return before a hook, so let's do this
  if (!transaction) {
    return (
      <div className="activity-detail">
        <Header title="" />
        <div className="flex">No Cosmos Transation was found.</div>
      </div>
    );
  } else {
    return (
      <_ActivityDetail
      // transaction={transaction}
      />
    );
  }
}

export function _ActivityDetail() {
  //   {
  //   transaction,
  // }: {
  //   transaction: TransactionGroup;
  // }
  const {
    title,
    // subtitle,
    // subtitleContainsOrigin,
    date,
    category,
    primaryCurrency,
    recipientAddress,
    // secondaryCurrency,
    displayedStatusKey,
    // isPending,
    senderAddress,
    token,
  } = useCosmosTxDisplayData();
  // transaction

  const { t } = useTranslation();

  const {
    provider: { rpcPrefs },
  } = useSelector((state) => state.network);

  const statusBackground = useMemo(() => {
    // switch (displayedStatusKey) {
    //   case TransactionStatuses.DROPPED:
    //   case TransactionStatuses.FAILED:
    //   case TransactionStatuses.ON_CHAIN_FALIURE:
    //     return 'error';
    //   case TransactionStatuses.SUBMITTED:
    //     return 'pending';
    // default:
    return 'default';
    // }
  }, [displayedStatusKey]);

  /**
   * This fn is only build for UI
   */
  const displayPrimaryCurrency = useMemo(() => {
    // split by space
    const { amount, denom: unit } = primaryCurrency;
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
            {/** @TODO transaction need `hash`` property  */}
            {/* {(transaction as any).hash && (
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
            )} */}
            {
              <TransactionItemDetail
                name="Time"
                hoverValueText={date}
                value={dayjs(transaction.timestamp).format(
                  'YYYY-MM-DD HH:mm:ss'
                )}
              />
            }
            {/* <TransactionGasDetail txGroup={transaction} category={category} /> */}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
