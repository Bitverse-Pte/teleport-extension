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
import { useCosmosTxDisplayData } from './useCosmosTxDisplayData';
import { Tooltip } from 'antd';
import type { CosmosTx } from 'background/service/transactions/cosmos/cosmos';
import { useParams } from 'react-router-dom';
import { getCosmosTransactionById } from 'ui/selectors/cosmos-transaction.selector';
import { CosmosTxStatus } from 'types/cosmos/transaction';
const { sensors } = skynet;

export default function ActivityDetail() {
  /**
   * Dirty hard work here.
   * UI related Logic please go to _ActivityDetail below
   */
  const { activityId } = useParams<{ activityId: string }>();

  const transaction = useSelector(getCosmosTransactionById(activityId));
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
    return <_ActivityDetail transaction={transaction} />;
  }
}

const shortenedStr = (str: string, digits = 6, isHex = true) =>
  `${str.slice(0, isHex ? digits + 2 : digits)}...${str.slice(-digits)}`;

export function _ActivityDetail({ transaction }: { transaction: CosmosTx }) {
  const {
    title,
    // subtitle,
    // subtitleContainsOrigin,
    date,
    category,
    primaryCurrency,
    formattedFee,
    recipientAddress,
    // secondaryCurrency,
    displayedStatusKey,
    // isPending,
    senderAddress,
    token,
  } = useCosmosTxDisplayData(transaction);
  // transaction
  console.debug('primaryCurrency', primaryCurrency);
  const { t } = useTranslation();

  const {
    provider: { rpcPrefs },
  } = useSelector((state) => state.network);

  const statusBackground = useMemo(() => {
    switch (displayedStatusKey) {
      case CosmosTxStatus.FAILED:
        return 'error';
      case CosmosTxStatus.CREATED:
      case CosmosTxStatus.SIGNED:
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
    if (!primaryCurrency) return { amount: '--.--', unit: '' };
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
            {transaction.tx_hash && (
              <div className="row">
                <div className="field-name">Transaction ID</div>
                <div className="field-value">
                  <Tooltip placement="topRight" title={transaction.tx_hash}>
                    {shortenedStr(transaction.tx_hash, 4)}
                  </Tooltip>
                  {/* <CopyOrOpenInScan
                    handleExplorerClick={() =>
                      handleExplorerClick('tx', primaryTransaction.hash!)
                    }
                    textToBeCopy={primaryTransaction.hash}
                  /> */}
                </div>
              </div>
            )}
            <TransactionItemDetail
              name="Time"
              hoverValueText={date}
              value={dayjs(transaction.timestamp).format('YYYY-MM-DD HH:mm:ss')}
            />
            {formattedFee && (
              <TransactionItemDetail
                name="Fee"
                value={`${formattedFee.amount} ${formattedFee.denom}`}
              />
            )}
            <TransactionItemDetail name="Gas" value={transaction.fee?.gas} />
            <TransactionItemDetail
              name="Sequence"
              value={transaction.account.sequence}
            />
            <TransactionItemDetail name="Memo" value={transaction.memo} />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
