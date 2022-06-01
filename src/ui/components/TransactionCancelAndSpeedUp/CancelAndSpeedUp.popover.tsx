import { useSelector } from 'react-redux';
import React, { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { EDIT_GAS_MODES, PRIORITY_LEVELS } from 'constants/gas';
import { Transaction } from 'constants/transaction';
import { Button, Drawer } from 'antd';
import { SimpleModal } from 'ui/components/universal/SimpleModal';
import { useGasFeeInputs } from 'ui/hooks/gasFeeInput/useGasFeeInput';
import { useGasFeeEstimates } from 'ui/hooks/gas/useGasFeeEstimates';
import { decGWEIToHexWEI } from 'ui/utils/conversion';
import './style.less';
import { BigNumber } from 'ethers';
import { UnlockModal } from 'ui/components/UnlockModal';
import { useWallet } from 'ui/utils';
import {
  isEIP1559Transaction,
  purifyTxParamsGasFields,
} from 'utils/transaction.utils';
import clsx from 'clsx';
import { MIN_GAS_LIMIT_DEC } from 'ui/context/send.constants';
import { usePrevious, useSetState } from 'react-use';
import { IconComponent } from '../IconComponents';
import { CustomGasInput } from './component/CustomGasInput.component';
import { FeeMarketTiersList } from './component/FeeTier/FeeMarketTiersList.component';
import { TierItem } from './component/FeeTier/TierItem.component';
import { priorityLevelToI18nKey } from './component/FeeTier/constant';
import { useAdd10PctTxParams } from './hooks/useAdd10PctTx';

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

const DrawerHeader = (props: {
  title: string;
  handleCloseIconClick: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="drawer-header-container-common drawer-header-network flexR with-padding-x-24 flex-wrap">
      <span className="drawer-header-title">{props.title}</span>
      <IconComponent
        name="close"
        onClick={props.handleCloseIconClick}
        cls="drawer-header-close-icon"
      />
      <h6
        className="flex items-center flex-wrap w-full"
        style={{ fontSize: 12 }}
      >
        {t('cancelSpeedUpLabel', {
          replace: {
            $1: 'replace',
          },
        })}
      </h6>
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
  const [add10PercentTxParams, add10PctTimeEstimate] = useAdd10PctTxParams(
    transaction,
    gasLimit
  );
  const isEIP1559Tx = isEIP1559Transaction(transaction);
  const { cancelTransactionWithTxParams, speedUpTransactionWithTxParams } =
    useGasFeeInputs(undefined, transaction, undefined, editGasMode);

  const wallet = useWallet();
  const currentBlockMaxGasLimit = useSelector((s) => s.currentBlock.gasLimit);

  const { gasFeeEstimates } = useGasFeeEstimates();

  const gasTierState = useState<PRIORITY_LEVELS>(
    PRIORITY_LEVELS.TEN_PERCENT_INCREASED
  );
  const [selectedGasTier, setGasTier] = gasTierState;
  const previousSelectedGasTier = usePrevious(selectedGasTier);

  const gasPriceuseSetState = useSetState<Partial<Transaction['txParams']>>({
    estimateUsed: PRIORITY_LEVELS.CUSTOM,
    maxFeePerGas: add10PercentTxParams.maxFeePerGas,
    maxPriorityFeePerGas: add10PercentTxParams.maxPriorityFeePerGas,
    gasPrice: add10PercentTxParams.gasPrice,
  });

  const [customGasPrice] = gasPriceuseSetState;

  const shouldDrawerExpanded = selectedGasTier === PRIORITY_LEVELS.CUSTOM;

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
      onClose={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setShowPopOver(false);
      }}
      placement="bottom"
      closable={false}
      bodyStyle={{
        boxSizing: 'border-box',
        padding: '0',
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
        <div className="tier-select">
          <div className="tier-header with-padding-x-24">
            <div className="level-name bold">Options</div>
            <div className="estimate-time bold">Time</div>
            <div className="maximum-charge bold">Max. Cost</div>
          </div>
          <div
            className={clsx('list', {
              expanded: shouldDrawerExpanded,
            })}
          >
            <TierItem
              levelName={t(
                priorityLevelToI18nKey[PRIORITY_LEVELS.TEN_PERCENT_INCREASED]
              )}
              estimateTime={add10PctTimeEstimate}
              gasPrice={BigNumber.from(
                add10PercentTxParams.maxFeePerGas ||
                  add10PercentTxParams.gasPrice
              )}
              gasLimit={gasLimit}
              selected={
                selectedGasTier == PRIORITY_LEVELS.TEN_PERCENT_INCREASED
              }
              onClick={() => setGasTier(PRIORITY_LEVELS.TEN_PERCENT_INCREASED)}
            />
            <FeeMarketTiersList
              isEIP1559Tx={isEIP1559Tx}
              add10PercentTxParams={add10PercentTxParams}
              gasTierState={gasTierState}
              gasLimit={gasLimit}
            />
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
              <div className="level-name bold">
                {t(priorityLevelToI18nKey[PRIORITY_LEVELS.CUSTOM])}
              </div>
              <div
                className={clsx('estimate-time narrow-letter-spacing')}
              ></div>
              <div className="maximum-charge">
                <IconComponent
                  name={`chevron-${
                    selectedGasTier == PRIORITY_LEVELS.CUSTOM ? 'up' : 'down'
                  }`}
                  cls="base-text-color"
                />
              </div>
            </div>
            <CustomGasInput
              gasLimit={gasLimit}
              setGasLimit={setGasLimit}
              gasPriceuseSetState={gasPriceuseSetState}
              selectedGasTier={selectedGasTier}
              isEIP1559Tx={isEIP1559Tx}
            />
          </div>
        </div>
      </div>
      <div
        className="with-padding-x-24"
        style={{
          marginTop: 24,
        }}
      >
        <Button
          type="primary"
          onClick={submitTransactionChange}
          className="w-full bold"
          disabled={isSubmitDisabled}
        >
          {t('Submit')}
        </Button>
      </div>
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
