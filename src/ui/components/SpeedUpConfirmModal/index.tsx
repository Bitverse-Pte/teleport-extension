import React, { useMemo, useState } from 'react';
import { Drawer } from 'antd';
import { CustomButton } from 'ui/components/Widgets';
import { decGWEIToHexWEI } from 'ui/utils/conversion';
import { IconComponent } from 'ui/components/IconComponents';
import './style.less';
import { PRIORITY_LEVELS } from 'constants/gas';
import { useGasFeeEstimates } from 'ui/hooks/gas/useGasFeeEstimates';
import { Transaction } from 'constants/transaction';
import { BigNumber, utils } from 'ethers';
import { useSelector } from 'react-redux';
import { getCurrentProviderNativeToken } from 'ui/selectors/selectors';
import { addHexPrefix } from 'ethereumjs-util';
import { useTranslation } from 'react-i18next';
import { priorityLevelToI18nKey } from '../TransactionCancelAndSpeedUp/component/FeeTier/constant';
import { isLegacyTransactionParams } from 'utils/transaction.utils';
import clsx from 'clsx';
import useGasTiming from '../GasTiming/useGasTiming.hook';
import {
  getMaximumGasTotalInHexWei,
  getMinimumGasTotalInHexWei,
} from 'utils/gas';
import { useDarkmode } from 'ui/hooks/useDarkMode';

const toFixedDigits =
  (digits = 7) =>
  (numberToBeFixed: any) =>
    Number(numberToBeFixed).toFixed(digits);

const toFixed7Digits = toFixedDigits(7);

interface DrawerHeaderProps {
  title: string;
  handleCloseIconClick: () => void;
}

const DrawerHeader = (props: DrawerHeaderProps) => {
  return (
    <div className="drawer-header-container-common flexR">
      <span className="drawer-header-title">{props.title}</span>
      <IconComponent
        name="close"
        onClick={props.handleCloseIconClick}
        cls="drawer-header-close-icon icon-close"
      />
    </div>
  );
};

export interface PropsInterface {
  visible: boolean;
  setVisible?: (visible: boolean) => void;
  submitTransactionChange: () => void;
  selectedGasTier: PRIORITY_LEVELS;
  add10PercentTxParams: Transaction['txParams'];
  gasLimit?: string;
  customGasPrice: Partial<Transaction['txParams']>;
}

export const SpeedUpConfirmModal: React.FC<PropsInterface> = ({
  selectedGasTier,
  add10PercentTxParams,
  gasLimit,
  customGasPrice,
  ...props
}: PropsInterface) => {
  const { t } = useTranslation();
  const { gasFeeEstimates } = useGasFeeEstimates();

  const gasDetail = useMemo(() => {
    // default use add 10%
    let newTxParams = {
      ...add10PercentTxParams,
      // it actually use `gas` field
      gas: gasLimit,
    };
    console.debug('gasDetail::customGasPrice', customGasPrice);
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
        maxFeePerGas: addHexPrefix(decGWEIToHexWEI(suggestedMaxFeePerGas)),
        maxPriorityFeePerGas: addHexPrefix(
          decGWEIToHexWEI(suggestedMaxPriorityFeePerGas)
        ),
      };
    } else if (PRIORITY_LEVELS.CUSTOM === selectedGasTier) {
      /**
       * Custom mode. need to care it's on eip1559 network
       */
      newTxParams = {
        ...newTxParams,
        ...customGasPrice,
      };
    }

    return newTxParams;
  }, [selectedGasTier, customGasPrice]);

  const gasTiming = useGasTiming(gasDetail);

  const isLegacyTransaction = isLegacyTransactionParams(gasDetail);

  const [isGasDetailExpanded, setGDExpand] = useState(false);

  const gasPrice = BigNumber.from(
    addHexPrefix(gasDetail.maxFeePerGas || gasDetail.gasPrice!)
  );
  console.debug('SpeedUpConfirmModal::gasDetail', gasDetail);
  const baseFee = gasDetail.maxPriorityFeePerGas
    ? gasPrice.sub(addHexPrefix(gasDetail.maxPriorityFeePerGas))
    : undefined;
  const maximumCostInHexWei = getMaximumGasTotalInHexWei(gasDetail);
  const minimumCostInHexWei = getMinimumGasTotalInHexWei({
    ...gasDetail,
    baseFeePerGas: baseFee?.toString(),
  });
  const nativeToken = useSelector(getCurrentProviderNativeToken);
  const { isDarkMode } = useDarkmode();

  return (
    <Drawer
      visible={props.visible}
      placement="bottom"
      closable={false}
      height={isGasDetailExpanded ? '360px' : '286px'}
      className={clsx('speedup-confirm-drawer', { dark: isDarkMode })}
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
      <div className="speedup-confirm-popup-container flexCol">
        <DrawerHeader
          title="Confirm"
          handleCloseIconClick={() => {
            if (props.setVisible) {
              props.setVisible(false);
            }
          }}
        />
        <div
          className="flex gas-tier-n-breakdown cursor-pointer"
          onClick={() => setGDExpand((prev) => !prev)}
        >
          {t(priorityLevelToI18nKey[selectedGasTier])}
          <IconComponent
            name="chevron-right"
            cls="to-icon ml-auto"
            style={{
              fill: '#56FAA5',
            }}
          />
        </div>
        {baseFee && (
          <div
            className={clsx('gas-detail-item', {
              flex: isGasDetailExpanded,
            })}
          >
            <div className="name">Base Fee</div>
            <div className="value">
              {utils.formatUnits(baseFee, 'gwei')} gwei
            </div>
          </div>
        )}
        {gasDetail.gasPrice && (
          <div
            className={clsx('gas-detail-item', {
              flex: isGasDetailExpanded,
            })}
          >
            <div className="name">Gas Price</div>
            <div className="value">
              {utils.formatUnits(addHexPrefix(gasDetail.gasPrice), 'gwei')} gwei
            </div>
          </div>
        )}
        {gasDetail.maxPriorityFeePerGas && (
          <div
            className={clsx('gas-detail-item', {
              flex: isGasDetailExpanded,
            })}
          >
            <div className="name">Priority Fee</div>
            <div className="value">
              {utils.formatUnits(
                addHexPrefix(gasDetail.maxPriorityFeePerGas),
                'gwei'
              )}{' '}
              gwei
            </div>
          </div>
        )}
        <div
          className={clsx('gas-detail-item', {
            flex: isGasDetailExpanded,
          })}
        >
          <div className="name">Gas Limit</div>
          <div className="value">{Number(gasDetail.gas)}</div>
        </div>
        <div className="flex gas-summary">
          <h4>Gas</h4>
          <div className="summary w-full text-right">
            <h4 className="summary-amount bold">
              {toFixed7Digits(utils.formatEther(minimumCostInHexWei))}{' '}
              {nativeToken?.symbol}
            </h4>
            {gasTiming && (
              <div className="summary-estimated-time bold fs12 green-02">
                {gasTiming.text}
              </div>
            )}
            {!isLegacyTransaction && (
              <div className="summary-max-fee fs12">
                Max Fee:
                <span className="max-fee-amount">
                  {toFixed7Digits(utils.formatEther(maximumCostInHexWei))}{' '}
                  {nativeToken?.symbol}
                </span>
              </div>
            )}
          </div>
        </div>
        <CustomButton
          type="primary"
          onClick={props.submitTransactionChange}
          block
          cls="popup-container-top popup-add-btn"
          disabled={false}
        >
          Submit
        </CustomButton>
      </div>
    </Drawer>
  );
};
