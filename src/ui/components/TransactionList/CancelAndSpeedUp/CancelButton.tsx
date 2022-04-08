import React from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { isBalanceSufficient } from 'ui/context/send.utils';
import { getMaximumGasTotalInHexWei } from 'utils/gas';
import { useIncrementedGasFees } from 'ui/hooks/gas/useIncrementedGasFees';
import { getTeleportWalletCachedBalances } from 'ui/selectors/selectors';

interface CancelButtonParams {
  transaction: any;
  cancelTransaction: (...args: any) => void;
  detailsModal?: boolean;
}

export default function CancelButton({
  cancelTransaction,
  transaction,
  detailsModal,
}: CancelButtonParams) {
  const { t } = useTranslation();

  const customCancelGasSettings = useIncrementedGasFees(transaction);

  const selectedAccountBalance = useSelector(getTeleportWalletCachedBalances);
  const conversionRate = useSelector(
    // getConversionRate
    // @todo: impl getConversionRate later if related module exist
    () => 1
  );

  const hasEnoughCancelGas = isBalanceSufficient({
    amount: '0x0',
    gasTotal: getMaximumGasTotalInHexWei(customCancelGasSettings),
    balance: selectedAccountBalance,
    conversionRate,
  });

  const btn = (
    <Button
      onClick={cancelTransaction}
      danger
      shape="round"
      className={classnames({
        'transaction-list-item__header-button': !detailsModal,
        'transaction-list-item-details__header-button-rounded-button':
          detailsModal,
      })}
      disabled={!hasEnoughCancelGas}
    >
      {t('cancel')}
    </Button>
  );
  return hasEnoughCancelGas ? (
    btn
  ) : (
    // <Tooltip
    //   title={t('notEnoughGas')}
    //   data-testid="not-enough-gas__tooltip"
    //   position="bottom"
    // >
    <div>{btn}</div>
    // </Tooltip>
  );
}
