import React, { useMemo } from 'react';
import {
  TransactionStatuses,
  TransactionGroupCategories,
} from 'constants/transaction';
import { CosmosTxItemParams } from '../typing';
import { Tooltip } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { IconComponent } from 'ui/components/IconComponents';
import { TxDirectionLogo } from '../TxDirectionLogo';
import { useCosmosTxDisplayData } from 'ui/views/Transaction/CosmosTransactionDetail/useCosmosTxDisplayData';

dayjs.extend(relativeTime);

const shortenedStr = (str: string, digits = 6, isHex = true) =>
  `${str.slice(0, isHex ? digits + 2 : digits)}...${str.slice(-digits)}`;

export function CosmosTransactionItem({
  transaction,
  idx,
  style,
}: CosmosTxItemParams) {
  const {
    title,
    date,
    category,
    primaryCurrency,
    recipientAddress,
    displayedStatusKey,
    senderAddress,
  } = useCosmosTxDisplayData(transaction);
  const { t } = useTranslation();
  // const isSignatureReq =
  //   category === TransactionGroupCategories.SIGNATURE_REQUEST;
  // const isApproval = category === TransactionGroupCategories.APPROVAL;
  // const isSwap = category === TransactionGroupCategories.SWAP;

  const history = useHistory();

  // const shouldShowSpeedUp = useShouldShowSpeedUp(
  //   transactionGroup,
  //   isEarliestNonce
  // );

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
  return (
    <div
      className={clsx(
        'activity flex justify-start cursor-pointer items-center',
        isEvenStyle
      )}
      key={transaction.id}
      style={style}
      onClick={() => history.push(`/cosmos/activity/${transaction.id}`)}
    >
      <TxDirectionLogo
        // status={displayedStatusKey}
        status="cancelled"
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
        <p className="tx-value ml-auto" title={primaryCurrency}>
          {primaryCurrency.amount} {primaryCurrency.denom}
        </p>
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
          {/* {t(displayedStatusKey)} */}
        </span>
        <span className="date">
          {dayjs(transaction.timestamp).format('YYYY-MM-DD HH:mm:ss')}
        </span>
      </div>
    </div>
  );
}
