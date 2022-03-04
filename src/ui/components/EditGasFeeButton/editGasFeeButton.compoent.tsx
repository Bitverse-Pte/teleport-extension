import React from 'react';

// import { COLORS, h6 } from '../../../helpers/constants/design-system';
// import { PRIORITY_LEVEL_ICON_MAP } from '../../../helpers/constants/gas';
// import { useGasFeeContext } from '../../../contexts/gasFee';
// import { useI18nContext } from '../../../hooks/useI18nContext';
// import { useTransactionEventFragment } from '../../../hooks/useTransactionEventFragment';
// import { useTransactionModalContext } from '../../../contexts/transaction-modal';
// import InfoTooltip from '../../ui/info-tooltip/info-tooltip';
// import h6 from '../../ui/h6/h6';
import { EDIT_GAS_MODES, PRIORITY_LEVELS } from 'constants/gas';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { useGasFeeInputs } from 'ui/hooks/gasFeeInput/useGasFeeInput';

interface EditGasFeeButtonProps {
  userAcknowledgedGasMissing: boolean;
}

export default function EditGasFeeButton({
  userAcknowledgedGasMissing,
}: EditGasFeeButtonProps) {
  const {
    editGasMode,
    gasLimit,
    hasSimulationError,
    estimateUsed,
    maxFeePerGas,
    maxPriorityFeePerGas,
    supportsEIP1559V2,
    transaction,
  } = useGasFeeInputs();
  const { t } = useTranslation();
  // const { updateTransactionEventFragment } = useTransactionEventFragment();
  //   const { openModal } = useTransactionModalContext();
  const editEnabled =
    !hasSimulationError || userAcknowledgedGasMissing === true;

  if (!supportsEIP1559V2 || !estimateUsed || !editEnabled) {
    return null;
  }

  let icon = estimateUsed;
  let title = estimateUsed;
  if (
    estimateUsed === PRIORITY_LEVELS.HIGH &&
    editGasMode === EDIT_GAS_MODES.SWAPS
  ) {
    icon = 'swapSuggested';
    title = 'swapSuggested';
  } else if (estimateUsed === PRIORITY_LEVELS.TEN_PERCENT_INCREASED) {
    icon = undefined;
    title = 'tenPercentIncreased';
  }

  const openEditGasFeeModal = () => {
    // updateTransactionEventFragment({
    //   gas_edit_attempted: 'basic',
    // });
    // openModal('editGasFee');
  };

  const openAdvancedGasFeeModal = () => {
    // updateTransactionEventFragment({
    //   gas_edit_attempted: 'advanced',
    // });
    // openModal('advancedGasFee');
  };

  return (
    <div className="edit-gas-fee-button">
      <button onClick={openEditGasFeeModal} data-testid="edit-gas-fee-button">
        {icon && (
          <span className="edit-gas-fee-button__icon">
            {
              // PRIORITY_LEVEL_ICON_MAP[
              icon
              // ]
            }
          </span>
        )}
        <span className="edit-gas-fee-button__label">{t(title)}</span>
        <i className="fas fa-chevron-right asset-list-item__chevron-right" />
      </button>
      {estimateUsed === 'custom' && (
        <button onClick={openAdvancedGasFeeModal}>{t('edit')}</button>
      )}
      {estimateUsed === 'dappSuggested' && (
        <Tooltip
          overlay={
            <div className="edit-gas-fee-button__tooltip">
              <h6 color={COLORS.NEUTRAL_GREY}>
                {t('dappSuggestedTooltip', [transaction.origin])}
              </h6>
              <h6>
                <b>{t('maxBaseFee')}</b>
                {maxFeePerGas}
              </h6>
              <h6>
                <b>{t('maxPriorityFee')}</b>
                {maxPriorityFeePerGas}
              </h6>
              <h6>
                <b>{t('gasLimit')}</b>
                {gasLimit}
              </h6>
            </div>
          }
          placement="top"
        />
      )}
    </div>
  );
}
