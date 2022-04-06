import React, { useMemo } from 'react';
import { BigNumber, utils } from 'ethers';
import './feeItem.less';
import GasTiming from '../GasTiming/gas-timing.component';

interface FeeItemPropsType {
  params: any;
  selected: boolean;
  onSelect: (type: string) => void;

  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
}

const type2title = {
  high: 'FAST',
  medium: 'MEDIUM',
  low: 'LOW',
  suggest: 'SITE SUGGESTS',
  custom: 'CUSTOM',
};
function FeeItem(props: FeeItemPropsType) {
  const { params, selected, onSelect, maxPriorityFeePerGas, maxFeePerGas } =
    props;
  const { type, time, gasPrice, symbol, gasLimit, price } = params;
  const gas = useMemo(() => {
    const gas: number = Math.floor(Number(gasPrice) * Number(gasLimit));
    if (isNaN(gas)) {
      return 0;
    } else {
      // gwei to wei
      return Number(utils.formatUnits(BigNumber.from(gas), 'gwei'));
    }
  }, [gasPrice, gasLimit]);
  return (
    <li
      className={`fee-selector-item ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(type)}
    >
      <div className="fee-selector-item-tail"></div>
      <div className="fee-selector-item-head"></div>
      <div className={`fee-selector-item-content fee-${type}`}>
        <div className="fee-selector-item-content-left">
          <div className="fee-selector-item-content-left-title">
            {type2title[type]}
          </div>
          {/* <div className="fee-selector-item-content-left-subtitle">{time}s</div> */}
          <GasTiming
            maxPriorityFeePerGas={maxPriorityFeePerGas}
            maxFeePerGas={maxFeePerGas}
            estimateUsed={type}
          />
        </div>
        <div className="fee-selector-item-content-right">
          <div className="fee-selector-item-content-right-title">
            {gas.toFixed(6)} {symbol}
          </div>
          <div className="fee-selector-item-content-right-subtitle">
            ≈${(gas * Number(price)).toFixed(4)} USD
          </div>
        </div>
      </div>
    </li>
  );
}

export default FeeItem;
