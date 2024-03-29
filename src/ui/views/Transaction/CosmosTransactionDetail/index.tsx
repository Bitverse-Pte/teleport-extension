import React, { Fragment, useMemo } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import Header from 'ui/components/Header';
import '../activity-detail.less';
import { AddressCard } from 'ui/components/universal/AddressCard';
import { IconComponent } from 'ui/components/IconComponents';
import { TokenIcon } from 'ui/components/Widgets';
import { useTranslation } from 'react-i18next';
// import skynet from 'utils/skynet';
import clsx from 'clsx';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import { TransactionItemDetail } from '../components/TransactionItemDetail.component';
import { useCosmosTxDisplayData } from './useCosmosTxDisplayData';
import { Tooltip } from 'antd';
import type { CosmosTx } from 'background/service/transactions/cosmos/cosmos';
import { useParams } from 'react-router-dom';
import { getCosmosTransactionById } from 'ui/selectors/cosmos-transaction.selector';
import { CosmosTxStatus } from 'types/cosmos/transaction';
import CopyOrOpenInScan from 'ui/components/universal/copyOrOpenInScan';
// const { sensors } = skynet;

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
    ibcChannel,
    ibcChainName,
    fromDapp,
  } = useCosmosTxDisplayData(transaction);
  // transaction
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

  const handleExplorerClick = (type: string, hash: string) => {
    window.open(`${rpcPrefs.blockExplorerUrl}/${type}/${hash}`);
  };

  const { isDarkMode } = useDarkmode();

  const messageData = transaction.aminoMsgs
    ? transaction.aminoMsgs[0]
    : undefined;

  return (
    <Fragment>
      <div
        className={clsx(
          'activity-detail',
          { dark: isDarkMode },
          statusBackground
        )}
      >
        <Header title={t(title)} />
        {/* hooks will return token even it's native token, so undefined usually means sign  */}
        {token && (
          <div className="txdetail-direction-logo flex justify-center">
            <div>
              <TokenIcon token={token} radius={48} />
            </div>
          </div>
        )}
        <div className="txdetail-values flex flex-wrap justify-center">
          {transaction.type !== 'sign' && (
            <div className="txdetail-value-display">
              <p className="txdetail-value items-baseline flex-wrap">
                {displayPrimaryCurrency.amount}
                <span className="unit">{displayPrimaryCurrency.unit}</span>
              </p>
            </div>
          )}
          <div className="details">
            {recipientAddress && (
              <div className="row from-and-to justify-center">
                <AddressCard title="From" address={senderAddress} />
                <IconComponent name="arrow-right" cls="to-icon" />
                <AddressCard title="To" address={recipientAddress} />
              </div>
            )}
            {transaction.tx_hash ? (
              <div className="row">
                <div className="field-name">Transaction ID</div>
                <div className={clsx('field-value', { dark: isDarkMode })}>
                  <Tooltip placement="topRight" title={transaction.tx_hash}>
                    {shortenedStr(transaction.tx_hash, 4)}
                  </Tooltip>
                  <CopyOrOpenInScan
                    handleExplorerClick={() =>
                      handleExplorerClick('txs', transaction.tx_hash!)
                    }
                    textToBeCopy={transaction.tx_hash}
                  />
                </div>
              </div>
            ) : (
              <TransactionItemDetail
                name={t('Chain ID')}
                value={transaction.chainInfo.chainId}
              />
            )}
            {fromDapp && (
              <TransactionItemDetail
                name="From Dapp"
                hoverValueText={date}
                value={fromDapp}
              />
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
            {messageData && (
              <>
                <TransactionItemDetail name={t('Message')} value="" />
                <div className="sign-data row">
                  <pre>{JSON.stringify(messageData, null, 2)}</pre>
                </div>
              </>
            )}
            <TransactionItemDetail name="Memo" value={transaction.memo} />
            {ibcChannel && (
              <TransactionItemDetail
                name="IBC Channel"
                value={ibcChannel.channelId}
              />
            )}
            {ibcChainName && (
              <TransactionItemDetail name="IBC Chain" value={ibcChainName} />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
