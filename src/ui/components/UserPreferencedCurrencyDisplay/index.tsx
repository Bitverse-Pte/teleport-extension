import React from 'react';
import './index.less';
import { getValueFromWeiHex } from 'ui/utils/conversion';
import { ETH } from 'constants/transaction';
import { TokenIcon } from '../Widgets';

export default function UserPreferencedCurrencyDisplay({ value, token }) {
  const decimalNumber = getValueFromWeiHex({
    value: value,
    toCurrency: ETH,
    numberOfDecimals: 8,
  });

  return token ? (
    <div className="flexR">
      <TokenIcon token={token} radius={30} useThemeBg />
      <span className="dec">{decimalNumber} </span>
      <span className="symbol">{token.symbol} </span>
    </div>
  ) : (
    <div className="flexR">
      <span className="dec"> </span>
    </div>
  );
}
