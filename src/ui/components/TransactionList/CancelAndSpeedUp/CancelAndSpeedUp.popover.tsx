import { useSelector } from 'react-redux';
import React, { Fragment, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { EDIT_GAS_MODES, PRIORITY_LEVELS } from 'constants/gas';
import { Transaction } from 'constants/transaction';
import { Button, InputNumber } from 'antd';
import { addTenPercentAndRound as _addTenPercentAndRound } from 'ui/helpers/utils/gas';
import { SimpleModal } from 'ui/components/universal/SimpleModal';
import { useGasFeeInputs } from 'ui/hooks/gasFeeInput/useGasFeeInput';
import { useGasFeeEstimates } from 'ui/hooks/gas/useGasFeeEstimates';
import { decGWEIToHexWEI } from 'ui/utils/conversion';
import './style.less';
import { getCurrentProviderNativeToken } from 'ui/selectors/selectors';
import { BigNumber, utils } from 'ethers';
import { UnlockModal } from 'ui/components/UnlockModal';
import { useWallet } from 'ui/utils';
import {
  isEIP1559Transaction,
  purifyTxParamsGasFields,
} from 'utils/transaction.utils';
import { toHumanReadableTime } from 'ui/utils/utils';
import clsx from 'clsx';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';

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

const addTenPercentAndRound = (hexStr?: string) =>
  _addTenPercentAndRound(hexStr)?.split('.')[0];

const TierItem = ({
  levelName,
  estimateTime,
  gasPrice,
  gasLimit = 21000,
  selected,
  disabled,
  onClick,
}: {
  levelName: string;
  estimateTime: string;
  gasPrice: BigNumber;
  gasLimit?: string | number;
  selected: boolean;
  disabled?: boolean;
  onClick?: (e: any) => void;
}) => {
  const nativeToken = useSelector(getCurrentProviderNativeToken);

  return (
    <div
      className={clsx('tier', {
        selected: selected,
        disabled: disabled,
      })}
      onClick={
        !disabled
          ? onClick
          : () =>
              ClickToCloseMessage.error(
                'Not enough to replace the old transaction'
              )
      }
    >
      <div className="level-name bold">{levelName}</div>
      <div className="estimate-time">{estimateTime}</div>
      <div className="maximum-charge">
        <span className="amount">
          {utils.formatEther(gasPrice.mul(gasLimit))}
        </span>
        {nativeToken?.symbol}
      </div>
    </div>
  );
};
const CancelSpeedupPopoverImplementation = ({
  editGasMode,
  transaction: _transaction,
  showPopOver,
  setShowPopOver,
}: CancelAndSpeedUpPopoverParams) => {
  const { t } = useTranslation();
  const transaction = purifyTxParamsGasFields(_transaction);
  // const
  const [gasLimit, setGasLimit] = useState(transaction.txParams.gas);
  const add10PercentTxParams = useMemo(() => {
    return {
      ...transaction.txParams,
      // default will add 10% because it's a override tx(for both speedup and cancel)
      estimateSuggested: PRIORITY_LEVELS.TEN_PERCENT_INCREASED,
      estimateUsed: PRIORITY_LEVELS.TEN_PERCENT_INCREASED,
      maxFeePerGas: addTenPercentAndRound(transaction.txParams.maxFeePerGas),
      maxPriorityFeePerGas: addTenPercentAndRound(
        transaction.txParams.maxPriorityFeePerGas
      ),
      gasPrice: addTenPercentAndRound(transaction.txParams.gasPrice),
      gasLimit,
    };
  }, [transaction, gasLimit]);
  const isEIP1559Tx = isEIP1559Transaction(transaction);
  const { cancelTransactionWithTxParams, speedUpTransactionWithTxParams } =
    useGasFeeInputs(undefined, transaction, undefined, editGasMode);

  const wallet = useWallet();

  const { gasFeeEstimates, isGasEstimatesLoading } = useGasFeeEstimates();

  const [selectedGasTier, setGasTier] = useState<PRIORITY_LEVELS>(
    PRIORITY_LEVELS.TEN_PERCENT_INCREASED
  );

  const [customGasPrice, setCustomGasPrice] = useState<
    Partial<Transaction['txParams']>
  >({
    estimateUsed: PRIORITY_LEVELS.CUSTOM,
    maxFeePerGas: add10PercentTxParams.maxFeePerGas,
    maxPriorityFeePerGas: add10PercentTxParams.maxPriorityFeePerGas,
    gasPrice: add10PercentTxParams.gasPrice,
  });

  useEffect(() => {
    console.debug('gasFeeEstimates::updated:', gasFeeEstimates);
  }, [gasFeeEstimates]);

  const [unlockPopupVisible, setUnlockPopupVisible] = useState(false);

  const submitTransactionChange = async () => {
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    let newTxParams = {
      ...transaction.txParams,
      gasLimit,
    };
    if (
      [
        PRIORITY_LEVELS.LOW,
        PRIORITY_LEVELS.MEDIUM,
        PRIORITY_LEVELS.HIGH,
      ].includes(selectedGasTier)
    ) {
      const { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas } =
        gasFeeEstimates[selectedGasTier];
      newTxParams = {
        ...newTxParams,
        estimateUsed: selectedGasTier,
        maxFeePerGas: decGWEIToHexWEI(suggestedMaxFeePerGas),
        maxPriorityFeePerGas: decGWEIToHexWEI(suggestedMaxPriorityFeePerGas),
      };
    } else if (PRIORITY_LEVELS.TEN_PERCENT_INCREASED === selectedGasTier) {
      newTxParams = add10PercentTxParams;
    } else if (PRIORITY_LEVELS.CUSTOM === selectedGasTier) {
      /**
       * Custom mode. need to care it's on eip1559 network
       */
      newTxParams = {
        ...newTxParams,
        ...customGasPrice,
      };
    }
    console.debug(
      'submitTransactionChange::sending with newTxParams: ',
      newTxParams
    );
    try {
      if (editGasMode === EDIT_GAS_MODES.CANCEL) {
        cancelTransactionWithTxParams(newTxParams);
      } else {
        speedUpTransactionWithTxParams(newTxParams);
      }
    } catch (error) {
      console.error('submitTransactionChange::error:', error);
    }
    setShowPopOver(false);
  };

  const tiersForEIP1559Network = () => {
    console.log('isGasEstimatesLoading', isGasEstimatesLoading);
    if (!isEIP1559Tx || isGasEstimatesLoading) return null;
    // avoid undefined error
    if (!gasFeeEstimates.low) return null;
    const getEstimatedTimeMinFast = (priorityLevel: string) => {
      const ms =
        priorityLevel === PRIORITY_LEVELS.HIGH
          ? gasFeeEstimates?.high.minWaitTimeEstimate
          : gasFeeEstimates?.low.maxWaitTimeEstimate;
      return toHumanReadableTime(t, ms);
    };
    const parsedMFPG = (tier: string) =>
      utils.parseUnits(gasFeeEstimates[tier].suggestedMaxFeePerGas, 'gwei');
    return (
      <Fragment>
        <TierItem
          levelName={t('Low')}
          estimateTime={getEstimatedTimeMinFast('low')}
          gasPrice={parsedMFPG('low')}
          gasLimit={gasLimit}
          selected={selectedGasTier == 'low'}
          /**
           * add10Percent's maxFeePerGas > current level of maxFeePerGas
           */
          disabled={BigNumber.from(add10PercentTxParams.maxFeePerGas).gt(
            parsedMFPG('low')
          )}
          onClick={() => setGasTier(PRIORITY_LEVELS.LOW)}
        />
        <TierItem
          levelName={t('Market')}
          estimateTime={getEstimatedTimeMinFast('medium')}
          gasPrice={parsedMFPG('medium')}
          gasLimit={gasLimit}
          selected={selectedGasTier == 'medium'}
          disabled={BigNumber.from(add10PercentTxParams.maxFeePerGas).gt(
            parsedMFPG('medium')
          )}
          onClick={() => setGasTier(PRIORITY_LEVELS.MEDIUM)}
        />
        <TierItem
          levelName={t('Fast')}
          estimateTime={getEstimatedTimeMinFast('high')}
          gasPrice={parsedMFPG('high')}
          gasLimit={gasLimit}
          selected={selectedGasTier == 'high'}
          disabled={BigNumber.from(add10PercentTxParams.maxFeePerGas).gt(
            parsedMFPG('high')
          )}
          onClick={() => setGasTier(PRIORITY_LEVELS.HIGH)}
        />
      </Fragment>
    );
  };

  return (
    // <div className="cancel-speedup-popover">
    <SimpleModal
      title={
        editGasMode === EDIT_GAS_MODES.CANCEL
          ? `❌${t('cancel')}`
          : `🚀${t('speedUp')}`
      }
      modalCustomStyle={{
        marginTop: '10px',
      }}
      visible={showPopOver}
      isTitleCentered={false}
      onClose={() => {
        setShowPopOver(false);
      }}
    >
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
          {/* {t('cancelSpeedUpTransactionTooltip', {
            replace: {
              $1: EDIT_GAS_MODES.CANCEL ? t('cancel') : t('speedUp'),
            },
          })} */}
        </h6>
        <div className="cancel-speedup-popover__separator" />

        <div className="tier-select">
          <div className="tier">
            <div className="level-name bold">Options</div>
            <div className="estimate-time bold">Time</div>
            <div className="maximum-charge bold">Max. Cost</div>
          </div>
          <TierItem
            levelName={t('addTenPercent')}
            estimateTime={'--'}
            gasPrice={BigNumber.from(
              add10PercentTxParams.maxFeePerGas || add10PercentTxParams.gasPrice
            )}
            gasLimit={gasLimit}
            selected={selectedGasTier == PRIORITY_LEVELS.TEN_PERCENT_INCREASED}
            onClick={() => setGasTier(PRIORITY_LEVELS.TEN_PERCENT_INCREASED)}
          />
          {tiersForEIP1559Network()}
          <TierItem
            levelName={t('Custom')}
            estimateTime={'--'}
            gasPrice={BigNumber.from(
              customGasPrice.maxFeePerGas || customGasPrice.gasPrice
            )}
            gasLimit={gasLimit}
            selected={selectedGasTier == PRIORITY_LEVELS.CUSTOM}
            onClick={() => setGasTier(PRIORITY_LEVELS.CUSTOM)}
          />
        </div>

        <div
          className="flex items-center flex-col custom-gas"
          style={{ marginTop: 4 }}
        >
          <div className="field">
            <h1 className="form-title bold">Gas Limit</h1>
            <InputNumber<string>
              style={{ width: '100% ' }}
              stringMode
              value={Number(gasLimit || 21000).toString()}
              onBlur={({ target }) => {
                setGasLimit(BigNumber.from(target.value).toHexString());
              }}
            />
          </div>
          {!isEIP1559Tx && selectedGasTier === PRIORITY_LEVELS.CUSTOM && (
            <div className="field">
              <h1 className="form-title bold">Gas Price</h1>
              <InputNumber<string>
                style={{ width: '100% ' }}
                addonAfter="Gwei"
                // onChange={onChange}
                stringMode
                value={utils.formatUnits(
                  customGasPrice.gasPrice || '0',
                  'gwei'
                )}
                onBlur={({ target: { value } }) => {
                  setCustomGasPrice((prevState) => ({
                    ...prevState,
                    gasPrice: utils.parseUnits(value, 'gwei').toHexString(),
                  }));
                }}
              />
            </div>
          )}
          {isEIP1559Tx && selectedGasTier === PRIORITY_LEVELS.CUSTOM && (
            <div className="field">
              <h1 className="form-title bold">Max Fee</h1>
              <InputNumber<string>
                style={{ width: '100% ' }}
                value={utils.formatUnits(
                  customGasPrice.maxFeePerGas || '0',
                  'gwei'
                )}
                onBlur={({ target: { value } }) => {
                  setCustomGasPrice((prevState) => ({
                    ...prevState,
                    maxFeePerGas: utils.parseUnits(value, 'gwei').toHexString(),
                  }));
                }}
                addonAfter="Gwei"
                stringMode
              />
            </div>
          )}
          {isEIP1559Tx && selectedGasTier === PRIORITY_LEVELS.CUSTOM && (
            <div className="field">
              <h1 className="form-title bold">Max Priority Fee</h1>
              <InputNumber<string>
                style={{ width: '100% ' }}
                value={utils.formatUnits(
                  customGasPrice.maxPriorityFeePerGas || '0',
                  'gwei'
                )}
                onBlur={({ target: { value } }) => {
                  setCustomGasPrice((prevState) => ({
                    ...prevState,
                    maxPriorityFeePerGas: utils
                      .parseUnits(value, 'gwei')
                      .toHexString(),
                  }));
                }}
                addonAfter="Gwei"
                stringMode
              />
            </div>
          )}
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
      <UnlockModal
        title="Unlock Wallet to continue"
        visible={unlockPopupVisible}
        setVisible={(v) => {
          setUnlockPopupVisible(v);
        }}
      />
    </SimpleModal>
  );
};

export default CancelSpeedupPopover;
