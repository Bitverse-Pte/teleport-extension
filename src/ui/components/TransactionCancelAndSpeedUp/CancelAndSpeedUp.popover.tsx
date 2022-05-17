import { useSelector } from 'react-redux';
import React, { Fragment, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { EDIT_GAS_MODES, PRIORITY_LEVELS } from 'constants/gas';
import { Transaction } from 'constants/transaction';
import { Button, Drawer, InputNumber } from 'antd';
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
import { MIN_GAS_LIMIT_DEC } from 'ui/context/send.constants';
import { usePrevious, useSetState } from 'react-use';
import { IconComponent } from '../IconComponents';

interface CancelAndSpeedUpPopoverParams {
  editGasMode: EDIT_GAS_MODES;
  transaction: Transaction;
  showPopOver: boolean;
  setShowPopOver: (v: boolean) => void;

  isSpeedUp?: boolean;
}

const CancelSpeedupPopover = (props: CancelAndSpeedUpPopoverParams) => {
  const { t } = useTranslation();

  /**
   * do not execute Implementation if popover is not showed
   */
  if (!props.showPopOver) {
    return null;
  }
  if (!props.transaction.txParams.gas) {
    return (
      <SimpleModal
        title={
          props.editGasMode === EDIT_GAS_MODES.CANCEL
            ? t('cancel')
            : t('speedUp')
        }
        modalCustomStyle={{
          marginTop: '10px',
        }}
        visible={props.showPopOver}
        isTitleCentered={false}
        onClose={() => {
          props.setShowPopOver(false);
        }}
      >
        Loading...
      </SimpleModal>
    );
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
  onClick,
  ...props
}: {
  levelName: string;
  estimateTime: string;
  gasPrice: BigNumber;
  gasLimit?: string | number;
  selected: boolean;
  disabled?: boolean;
  fast?: boolean;
  onClick?: (e: any) => void;
}) => {
  const nativeToken = useSelector(getCurrentProviderNativeToken);

  return (
    <div
      className={clsx('tier', {
        selected: selected,
        disabled: props.disabled,
      })}
      onClick={
        !props.disabled
          ? onClick
          : () =>
              ClickToCloseMessage.error(
                'Not enough to replace the old transaction'
              )
      }
    >
      <div className="level-name bold">{levelName}</div>
      <div
        className={clsx('estimate-time narrow-letter-spacing', {
          fast: props.fast,
          bold: props.fast,
        })}
      >
        {estimateTime}
      </div>
      <div className="maximum-charge">
        <span className="amount narrow-letter-spacing">
          {utils.formatEther(gasPrice.mul(gasLimit))}
        </span>
        {nativeToken?.symbol}
      </div>
    </div>
  );
};

const DrawerHeader = (props: {
  title: string;
  handleCloseIconClick: () => void;
}) => {
  return (
    <div className="drawer-header-container-common flexR">
      <span className="drawer-header-title">{props.title}</span>
      <IconComponent
        name="close"
        onClick={props.handleCloseIconClick}
        cls="drawer-header-close-icon"
      />
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
      gas: gasLimit,
      gasLimit,
    };
  }, [transaction, gasLimit]);
  const isEIP1559Tx = isEIP1559Transaction(transaction);
  const { cancelTransactionWithTxParams, speedUpTransactionWithTxParams } =
    useGasFeeInputs(undefined, transaction, undefined, editGasMode);

  const wallet = useWallet();
  const currentBlockMaxGasLimit = useSelector((s) => s.currentBlock.gasLimit);

  const { gasFeeEstimates, isGasEstimatesLoading } = useGasFeeEstimates();

  const [selectedGasTier, setGasTier] = useState<PRIORITY_LEVELS>(
    PRIORITY_LEVELS.TEN_PERCENT_INCREASED
  );
  const previousSelectedGasTier = usePrevious(selectedGasTier);

  const [customGasPrice, setCustomGasPrice] = useState<
    Partial<Transaction['txParams']>
  >({
    estimateUsed: PRIORITY_LEVELS.CUSTOM,
    maxFeePerGas: add10PercentTxParams.maxFeePerGas,
    maxPriorityFeePerGas: add10PercentTxParams.maxPriorityFeePerGas,
    gasPrice: add10PercentTxParams.gasPrice,
  });

  const [customTxParamsError, setCustomTxParamsError] = useSetState<
    Partial<Transaction['txParams']>
  >({});

  const shouldDrawerExpanded = selectedGasTier === PRIORITY_LEVELS.CUSTOM;

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
      // it actually use `gas` field
      gas: gasLimit,
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
          fast
          onClick={() => setGasTier(PRIORITY_LEVELS.HIGH)}
        />
      </Fragment>
    );
  };

  const isSubmitDisabled = useMemo(() => {
    try {
      return (
        BigNumber.from(gasLimit).lt(MIN_GAS_LIMIT_DEC) ||
        BigNumber.from(gasLimit).gt(currentBlockMaxGasLimit || 21000 * 10)
      );
    } catch (error) {
      console.error('isSubmitDisabled::error', error);
      return false;
    }
  }, [gasLimit, currentBlockMaxGasLimit]);

  return (
    <Drawer
      height={shouldDrawerExpanded ? 536 : 422}
      visible={showPopOver}
      onClose={() => {
        setShowPopOver(false);
      }}
      placement="bottom"
      closable={false}
      bodyStyle={{
        boxSizing: 'border-box',
        padding: '0 24px 24px 24px',
      }}
      contentWrapperStyle={{
        borderRadius: '16px 16px 0 0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      key="top"
    >
      <DrawerHeader
        title={
          editGasMode === EDIT_GAS_MODES.CANCEL ? t('cancel') : t('speedUp')
        }
        handleCloseIconClick={() => {
          if (setShowPopOver) {
            setShowPopOver(false);
          }
        }}
      />
      <div
        className={clsx('cancel-speedup-popover_wrapper', {
          expanded: shouldDrawerExpanded,
        })}
      >
        <h6
          className="flex items-center flex-wrap"
          style={{ margin: '0, 0, 2, 0' }}
        >
          {t('cancelSpeedUpLabel', {
            replace: {
              $1: 'replace',
            },
          })}
        </h6>

        <div className="tier-select">
          <div className="tier-header">
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
          <div
            className={clsx('tier', {
              selected: selectedGasTier == PRIORITY_LEVELS.CUSTOM,
            })}
            onClick={() => {
              console.debug(
                'Custom::previousSelectedGasTier',
                previousSelectedGasTier
              );
              const nextTier =
                selectedGasTier !== PRIORITY_LEVELS.CUSTOM ||
                !previousSelectedGasTier
                  ? PRIORITY_LEVELS.CUSTOM
                  : previousSelectedGasTier;
              console.debug('Custom::nextTier:', nextTier);
              setGasTier(nextTier);
            }}
          >
            <div className="level-name bold">Custom</div>
            <div className={clsx('estimate-time narrow-letter-spacing')}></div>
            <div className="maximum-charge">
              <IconComponent
                name={`chevron-${
                  selectedGasTier == PRIORITY_LEVELS.CUSTOM ? 'up' : 'down'
                }`}
                cls="base-text-color"
              />
            </div>
          </div>
        </div>

        <div
          className="flex items-center flex-col custom-gas"
          style={{ marginTop: 4 }}
        >
          {selectedGasTier === PRIORITY_LEVELS.CUSTOM && (
            <div className="field">
              <h1 className="form-title bold">Gas Limit</h1>
              <InputNumber<string>
                style={{ width: '100% ' }}
                stringMode
                value={Number(gasLimit || 21000).toString()}
                min="21000"
                controls={false}
                onBlur={({ target }) => {
                  try {
                    setGasLimit(BigNumber.from(target.value).toHexString());
                  } catch (error) {
                    console.error('setGasLimit::error:', error);
                    setCustomTxParamsError({
                      gasLimit: 'bad input',
                    });
                  }
                }}
              />
            </div>
          )}
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
                controls={false}
                onBlur={({ target: { value } }) => {
                  try {
                    const gasPrice = utils
                      .parseUnits(value, 'gwei')
                      .toHexString();
                    setCustomGasPrice((prevState) => ({
                      ...prevState,
                      gasPrice,
                    }));
                  } catch (error) {
                    console.error('setCustomGasPrice::error', error);
                    setCustomTxParamsError({
                      gasPrice: 'bad input',
                    });
                  }
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
                controls={false}
                onBlur={({ target: { value } }) => {
                  try {
                    const maxFeePerGas = utils
                      .parseUnits(value, 'gwei')
                      .toHexString();
                    setCustomGasPrice((prevState) => ({
                      ...prevState,
                      maxFeePerGas,
                    }));
                  } catch (error) {
                    console.error('setCustomGasPrice::error', error);
                    setCustomTxParamsError({
                      maxFeePerGas: 'bad input',
                    });
                  }
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
                controls={false}
                onBlur={({ target: { value } }) => {
                  try {
                    const maxPriorityFeePerGas = utils
                      .parseUnits(value, 'gwei')
                      .toHexString();
                    setCustomGasPrice((prevState) => ({
                      ...prevState,
                      maxPriorityFeePerGas,
                    }));
                  } catch (error) {
                    console.error('setCustomGasPrice::error', error);
                    setCustomTxParamsError({
                      maxPriorityFeePerGas: 'bad input',
                    });
                  }
                }}
                addonAfter="Gwei"
                stringMode
              />
            </div>
          )}
        </div>
      </div>
      <Button
        type="primary"
        onClick={submitTransactionChange}
        className="w-full bold"
        style={{
          marginTop: 24,
        }}
        disabled={isSubmitDisabled}
      >
        {t('Submit')}
      </Button>
      <UnlockModal
        title="Unlock Wallet to continue"
        visible={unlockPopupVisible}
        setVisible={(v) => {
          setUnlockPopupVisible(v);
        }}
        unlocked={submitTransactionChange}
      />
    </Drawer>
  );
};

export default CancelSpeedupPopover;
