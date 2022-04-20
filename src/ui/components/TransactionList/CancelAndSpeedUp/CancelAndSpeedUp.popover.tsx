import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { EDIT_GAS_MODES, PRIORITY_LEVELS } from 'constants/gas';
import { Transaction, TransactionEnvelopeTypes } from 'constants/transaction';
import { IconComponent } from 'ui/components/IconComponents';
import { Button, Tooltip } from 'antd';
import {
  addTenPercentAndRound,
  gasEstimateGreaterThanGasUsedPlusTenPercent,
} from 'ui/helpers/utils/gas';
import { SimpleModal } from 'ui/components/universal/SimpleModal';
import { useGasFeeInputs } from 'ui/hooks/gasFeeInput/useGasFeeInput';
import { useTransactionFunctions } from 'ui/hooks/gasFeeInput/useTransactionFunctions';
import { useGasFeeEstimates } from 'ui/hooks/gas/useGasFeeEstimates';
import FeeSelector from 'ui/components/FeeSelector';
import {
  MIN_GAS_LIMIT_DEC,
  MIN_GAS_LIMIT_HEX,
} from 'ui/context/send.constants';
import { getValueFromWeiHex, multipyHexes } from 'ui/utils/conversion';
import {
  getCurrentProviderNativeToken,
  getGasFeeEstimates,
} from 'ui/selectors/selectors';
import { utils } from 'ethers';
import { UnlockModal } from 'ui/components/UnlockModal';
import { useWallet } from 'ui/utils';

interface CancelAndSpeedUpPopoverParams {
  editGasMode: EDIT_GAS_MODES;
  transaction: Transaction;
  showPopOver: boolean;
  setShowPopOver: (v: boolean) => void;

  isSpeedUp?: boolean;
}

const CancelSpeedupPopover = (props: CancelAndSpeedUpPopoverParams) => {
  /**
   * do not execute Implementation if popover is not showed
   */
  if (!props.showPopOver) {
    return null;
  }
  return <CancelSpeedupPopoverImplementation {...props} />;
};

const CancelSpeedupPopoverImplementation = ({
  editGasMode,
  transaction: _transaction,
  showPopOver,
  setShowPopOver,
}: CancelAndSpeedUpPopoverParams) => {
  const { t } = useTranslation();
  const [gasFeeSelectorVisible, setGasFeeSelectorVisible] = useState(false);
  const appIsLoading = useSelector((s) => s.appState.isLoading);
  const [draftNewTxParams, setDraftTxParams] = useState({
    ..._transaction.txParams,
    // default will add 10% because it's a override tx(for both speedup and cancel)
    estimateSuggested: PRIORITY_LEVELS.TEN_PERCENT_INCREASED,
    estimateUsed: PRIORITY_LEVELS.TEN_PERCENT_INCREASED,
    maxFeePerGas: addTenPercentAndRound(_transaction.txParams.maxFeePerGas),
    maxPriorityFeePerGas: addTenPercentAndRound(
      _transaction.txParams.maxPriorityFeePerGas
    ),
    gasPrice: addTenPercentAndRound(_transaction.txParams.gasPrice),
  });
  console.info('draftNewTxParams', draftNewTxParams);
  const {
    cancelTransaction,
    speedUpTransaction,
    updateTransactionToTenPercentIncreasedGasFee,
    updateTransactionUsingEstimate,
    updateTransaction,
    transaction,
  } = useGasFeeInputs(undefined, _transaction, undefined, editGasMode);

  const wallet = useWallet();

  const gasFeeEstimates = useGasFeeEstimates();

  useEffect(() => {
    if ((transaction as any).previousGas || appIsLoading || !showPopOver) {
      return;
    }
    // If gas used previously + 10% is less than medium estimated gas
    // estimate is set to medium, else estimate is set to tenPercentIncreased
    const gasUsedLessThanMedium =
      gasFeeEstimates &&
      gasEstimateGreaterThanGasUsedPlusTenPercent(
        transaction.txParams,
        gasFeeEstimates,
        PRIORITY_LEVELS.MEDIUM
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
  const gasSettings = useSelector((s) => s.gas);
  const nativeToken = useSelector(getCurrentProviderNativeToken);
  console.info('gasSettings', gasSettings);

  useEffect(() => {
    console.info('transaction:txParams', transaction.txParams);
  }, [transaction]);

  useEffect(() => {
    console.debug('gasFeeEstimates::updated:', gasFeeEstimates);
  }, [gasFeeEstimates]);

  useEffect(() => {
    console.debug('changing transaction type');
    if (gasSettings.gasType === 'custom') {
      /**
       * for EIP1559 Fee Market customization only
       */
      const { gasLimit, maxFee, maxPriorityFee } = gasSettings.customData;
      const isEIP1559Tx = Boolean(maxFee);
      if (isEIP1559Tx) {
        setDraftTxParams((previous) => ({
          ...previous,
          gasLimit,
          maxFeePerGas: utils.parseUnits(maxFee, 'gwei').toHexString(),
          maxPriorityFeePerGas: utils
            .parseUnits(maxPriorityFee, 'gwei')
            .toHexString(),
        }));
      } else {
        const { gasLimit, gasPrice } = gasSettings.legacyGas;
        // support for `LEGACY`
        setDraftTxParams((previous) => ({
          ...previous,
          gasLimit,
          gasPrice: utils.parseUnits(gasPrice, 'gwei').toHexString(),
        }));
      }
    } else {
      console.warn(
        `not supported gas type ${gasSettings.gasType}, implementation needed`,
        gasSettings
      );
    }
  }, [gasSettings]);

  const [unlockPopupVisible, setUnlockPopupVisible] = useState(false);

  const submitTransactionChange = async () => {
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    /**
     * update the temp tx gas estimation here
     */
    if (['high', 'medium', 'low'].includes(gasSettings.gasType)) {
      /**
       * Update by EIP1559 Fee Market estimation tier
       */
      updateTransactionUsingEstimate(gasSettings.gasType);
    } else {
      // for custom gas settings
      updateTransaction(draftNewTxParams);
    }
    if (editGasMode === EDIT_GAS_MODES.CANCEL) {
      cancelTransaction();
    } else {
      speedUpTransaction();
    }
    setShowPopOver(false);
  };

  const totalGasfee = () => {
    try {
      const gasPrice =
        draftNewTxParams.maxFeePerGas || draftNewTxParams.gasPrice;
      return multipyHexes(gasPrice, draftNewTxParams.gas || MIN_GAS_LIMIT_HEX);
    } catch (error) {
      console.error('totalGasfee::error', error);
      return '0x1';
    }
  };

  const renderTotalGasFeeAmount = () => {
    const totalDec = getValueFromWeiHex({
      value: totalGasfee(),
      numberOfDecimals: 10,
    });
    return `${totalDec} ${nativeToken?.symbol || ''}`;
  };

  return (
    // <div className="cancel-speedup-popover">
    <SimpleModal
      title={
        editGasMode === EDIT_GAS_MODES.CANCEL
          ? `❌${t('cancel')}`
          : `🚀${t('speedUp')}`
      }
      visible={showPopOver}
      isTitleCentered={false}
      onClose={() => {
        setShowPopOver(false);
      }}
    >
      {/* <AppLoadingSpinner className="cancel-speedup-popover__spinner" /> */}
      <div className="cancel-speedup-popover__wrapper">
        <h6
          className="flex items-center flex-wrap"
          style={{ margin: '0, 0, 2, 0' }}
        >
          {t('cancelSpeedUpLabel', {
            replace: {
              $1: 'replace',
            },
          })}
          <Tooltip
            // position="top"
            placement="top"
            title={
              <div>
                <div>
                  <a
                    href="https://community.metamask.io/t/how-to-speed-up-or-cancel-transactions-on-metamask/3296"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('learnMoreUpperCase')}
                  </a>
                </div>
              </div>
            }
          >
            {t('cancelSpeedUpTransactionTooltip', {
              replace: {
                $1: EDIT_GAS_MODES.CANCEL ? t('cancel') : t('speedUp'),
              },
            })}
          </Tooltip>
        </h6>
        <div className="cancel-speedup-popover__separator" />

        <div className="flex items-center flex-col" style={{ marginTop: 4 }}>
          <p
            style={{
              fontSize: 20,
            }}
          >
            {renderTotalGasFeeAmount()}
          </p>
          <Button onClick={() => setGasFeeSelectorVisible(true)}>
            Edit Gas
          </Button>
        </div>
        <Button
          type="primary"
          onClick={submitTransactionChange}
          className="w-full"
          style={{
            marginTop: 24,
          }}
        >
          {t('submit')}
        </Button>
      </div>
      <FeeSelector
        onClose={() => {
          setGasFeeSelectorVisible(false);
        }}
        gasLimit={Number(draftNewTxParams.gas || MIN_GAS_LIMIT_DEC)}
        supportsEIP1559={
          transaction.txParams.type === TransactionEnvelopeTypes.FEE_MARKET
        }
        visible={gasFeeSelectorVisible}
      />
      <UnlockModal
        title="Unlock Wallet to continue"
        visible={unlockPopupVisible}
        setVisible={(v) => {
          setUnlockPopupVisible(v);
        }}
        // unlocked={() => next()}
      />
    </SimpleModal>
  );
};

export default CancelSpeedupPopover;
