import React, { useMemo } from 'react';
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
        cls="drawer-header-close-icon"
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
        maxFeePerGas: decGWEIToHexWEI(suggestedMaxFeePerGas),
        maxPriorityFeePerGas: decGWEIToHexWEI(suggestedMaxPriorityFeePerGas),
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
  }, [selectedGasTier]);

  const gasPrice = BigNumber.from(
    addHexPrefix(gasDetail.maxFeePerGas || gasDetail.gasPrice!)
  );

  const baseFee = gasDetail.maxPriorityFeePerGas
    ? gasPrice.sub(addHexPrefix(gasDetail.maxPriorityFeePerGas))
    : undefined;
  const nativeToken = useSelector(getCurrentProviderNativeToken);

  return (
    <Drawer
      visible={props.visible}
      placement="bottom"
      closable={false}
      height="286px"
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
        <div className="flex gas-tier-n-breakdown cursor-pointer">
          {t(priorityLevelToI18nKey[selectedGasTier])}
          <IconComponent
            name="chevron-right"
            cls="to-icon ml-auto"
            style={{
              fill: '#1484F5',
            }}
          />
        </div>
        <div className="flex gas-summary">
          <h4>Gas</h4>
          <div className="summary w-full text-right">
            {baseFee && (
              <h4 className="summary-amount bold">
                {Number(
                  utils.formatEther(baseFee.mul(gasDetail.gasLimit!))
                ).toFixed(7)}{' '}
                {nativeToken?.symbol}
              </h4>
            )}
            <div className="summary-estimated-time bold fs12 green-02">
              Likely in 30 Seconds
            </div>
            <div className="summary-max-fee fs12">
              Max Fee:
              <span className="max-fee-amount">
                {Number(
                  utils.formatEther(gasPrice.mul(gasDetail.gasLimit!))
                ).toFixed(7)}{' '}
                {nativeToken?.symbol}
              </span>
            </div>
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
