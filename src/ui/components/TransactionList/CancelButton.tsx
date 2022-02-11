import React from 'react';
import { useSelector } from 'react-redux';
import classnames from 'classnames';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
// import { useIncrementedGasFees } from '@/ui/hooks/metamask/useIncrementedGasFees';
// import { getMaximumGasTotalInHexWei } from '../../../../shared/modules/gas.utils';
// import { getConversionRate } from '../../../ducks/metamask/metamask';
// import { useIncrementedGasFees } from '../../../hooks/useIncrementedGasFees';
// import { isBalanceSufficient } from '../../../pages/send/send.utils';
// import { getSelectedAccount } from '../../../selectors';

interface CancelButtonParams {
  transaction: any;
  cancelTransaction: () => void;
  detailsModal?: boolean;
}

export default function CancelButton({
  cancelTransaction,
  transaction,
  detailsModal,
}: CancelButtonParams) {
  const { t } = useTranslation();

  // const customCancelGasSettings = useIncrementedGasFees(transaction);

  // const selectedAccount = useSelector(getSelectedAccount);
  //   const conversionRate = useSelector(getConversionRate);

  // const hasEnoughCancelGas = isBalanceSufficient({
  //   amount: '0x0',
  //   gasTotal: getMaximumGasTotalInHexWei(customCancelGasSettings),
  //   balance: selectedAccount.balance,
  //   conversionRate,
  // });
  const hasEnoughCancelGas = true;

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
      // disabled={!hasEnoughCancelGas}
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
