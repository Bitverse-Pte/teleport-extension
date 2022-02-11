import React, { useMemo } from 'react';
import { BigNumber, utils } from 'ethers';
import './feeItem.less';

const type2title = {
  high: 'FAST',
  medium: 'MEDIUM',
  low: 'LOW',
  suggest: 'SITE SUGGESTS',
  custom: 'CUSTOM',
};
function FeeItem(props) {
  const { params, selected, onSelect } = props;
  const { type, time, gasPrice, symbol, gasLimit, price } = params;
  const gas = useMemo(() => {
    const gas: number = Math.floor(Number(gasPrice) * Number(gasLimit));
    // gwei to wei
    return Number(utils.formatUnits(BigNumber.from(gas), 'gwei'));
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
          <div className="fee-selector-item-content-left-subtitle">{time}s</div>
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
