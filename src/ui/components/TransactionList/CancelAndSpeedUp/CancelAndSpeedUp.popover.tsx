import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';

// import {
//   EDIT_GAS_MODES,
//   PRIORITY_LEVELS,
// } from '../../../../shared/constants/gas';
// import {
//   ALIGN_ITEMS,
//   DISPLAY,
//   FLEX_DIRECTION,
//   TYPOGRAPHY,
// } from '../../../helpers/constants/design-system';
// import { getAppIsLoading } from '../../../selectors';
// import { gasEstimateGreaterThanGasUsedPlusTenPercent } from '../../../helpers/utils/gas';
// import { useGasFeeContext } from '../../../contexts/gasFee';
// import { useTransactionModalContext } from '../../../contexts/transaction-modal';
// import EditGasFeeButton from '../edit-gas-fee-button';
// import GasDetailsItem from '../gas-details-item';
// import Button from '../../ui/button';
// import I18nValue from '../../ui/i18n-value';
// import InfoTooltip from '../../ui/info-tooltip';
// import Popover from '../../ui/popover';
// import Typography from '../../ui/typography';
// import AppLoadingSpinner from '../app-loading-spinner';
import { useTranslation } from 'react-i18next';
import { EDIT_GAS_MODES, PRIORITY_LEVELS } from 'constants/gas';
import { Transaction } from 'constants/transaction';
import { IconComponent } from 'ui/components/IconComponents';
import { Button, Tooltip } from 'antd';
import { gasEstimateGreaterThanGasUsedPlusTenPercent } from 'ui/helpers/utils/gas';

interface CancelAndSpeedUpPopoverParams {
    editGasMode: EDIT_GAS_MODES;
    cancelTransaction: () => void;
    speedUpTransaction: () => void;
    transaction: Transaction;
    // updateTransaction: () => void;
    updateTransactionToTenPercentIncreasedGasFee: (v: boolean) => void;
    updateTransactionUsingEstimate: (l: PRIORITY_LEVELS) => void;
}

const CancelSpeedupPopover = ({
    cancelTransaction,
    speedUpTransaction,
    editGasMode,
    transaction,
    updateTransactionToTenPercentIncreasedGasFee,
    updateTransactionUsingEstimate,
}: CancelAndSpeedUpPopoverParams) => {
  const { t } = useTranslation();
  const [showPopOver, setShowPopOver] = useState(false);
//   const appIsLoading = useSelector(getAppIsLoading);
  const appIsLoading = false;

  // @todo: gasFeeEstimates
  const gasFeeEstimates: any = {};


  useEffect(() => {
    if (
      (transaction as any).previousGas ||
      appIsLoading ||
      !showPopOver
    ) {
      return;
    }
    // If gas used previously + 10% is less than medium estimated gas
    // estimate is set to medium, else estimate is set to tenPercentIncreased
    const gasUsedLessThanMedium =
      gasFeeEstimates &&
      gasEstimateGreaterThanGasUsedPlusTenPercent(
        transaction.txParams,
        gasFeeEstimates,
        PRIORITY_LEVELS.MEDIUM,
      );
    if (gasUsedLessThanMedium) {
      updateTransactionUsingEstimate(PRIORITY_LEVELS.MEDIUM);
      return;
    }
    updateTransactionToTenPercentIncreasedGasFee(true);
  }, [
    appIsLoading,
    editGasMode,
    gasFeeEstimates,
    transaction,
    // updateTransaction,
    updateTransactionToTenPercentIncreasedGasFee,
    updateTransactionUsingEstimate,
  ]);

  if (!showPopOver) {
    return null;
  }

  const submitTransactionChange = () => {
    if (editGasMode === EDIT_GAS_MODES.CANCEL) {
      cancelTransaction();
    } else {
      speedUpTransaction();
    }
    setShowPopOver(false);
  };

  return (
    <div
      className="cancel-speedup-popover"
    >
      
      <div className="popover-header">
        <p className="header-title">{editGasMode === EDIT_GAS_MODES.CANCEL
                ? `❌${t('cancel')}`
                : `🚀${t('speedUp')}`}
        </p>
        <IconComponent name="close" onClick={() => setShowPopOver(false) } />
      </div>
      {/* <AppLoadingSpinner className="cancel-speedup-popover__spinner" /> */}
      <div className="cancel-speedup-popover__wrapper">
        <h6
          className="flex items-center"
          style={{ margin: '0, 0, 2, 0' }}
        >
          { t('cancelSpeedUpLabel', {
              replace: {
                replace: 'replace'
              }
           }) }
          <Tooltip
            // position="top"
            placement="top"
            title={<div>
                <div>
                  <a
                    href="https://community.metamask.io/t/how-to-speed-up-or-cancel-transactions-on-metamask/3296"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('learnMoreUpperCase')}
                  </a>
                </div>
              </div>}
          >
              {t('cancelSpeedUpTransactionTooltip', [
                  EDIT_GAS_MODES.CANCEL ? t('cancel') : t('speedUp'),
                ])}
              </Tooltip>
        </h6>
        <div className="cancel-speedup-popover__separator" />
        {/* <div
          display={DISPLAY.FLEX}
          alignItems={ALIGN_ITEMS.CENTER}
          flexDirection={FLEX_DIRECTION.COLUMN}
          marginTop={4}
        >
          <div className="cancel-speedup-popover__edit-gas-button">
            {!appIsLoading && <EditGasFeeButton />}
          </div>
          <div className="cancel-speedup-popover__gas-details">
            <GasDetailsItem />
          </div>
        </div> */}
        <Button type="primary" onClick={submitTransactionChange}>
          { t('submit') }
        </Button>
      </div>
    </div>
  );
};

export default CancelSpeedupPopover;
