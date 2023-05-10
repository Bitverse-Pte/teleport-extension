import React from 'react';
import './index.less';
import { conversionUtil } from 'ui/utils/conversion';
import { ETH } from 'constants/transaction';
import { TokenIcon } from '../Widgets';
import { addEllipsisToEachWordsInTheEnd } from 'ui/helpers/utils/currency-display.util';
import { addHexPrefix } from 'ethereumjs-util';

export default function UserPreferencedCurrencyDisplay({
  value,
  token,
  isEVM = true,
}) {
  console.log('--- UserPreferencedCurrencyDisplay --- ', token);

  let decimalValueString = '';
  if (isEVM) {
    if (token) {
      const multiplier = Math.pow(10, Number(token?.decimal || 0));
      decimalValueString = conversionUtil(addHexPrefix(value), {
        fromNumericBase: 'hex',
        toNumericBase: 'dec',
        toCurrency: token?.symbol || ETH,
        conversionRate: multiplier,
        invertConversionRate: true,
      });
    } else {
      if (token?.symbol === 'fUSDT') {
        const multiplier = Math.pow(10, Number(token?.decimal || 0));
        decimalValueString = conversionUtil(addHexPrefix(value), {
          fromNumericBase: 'hex',
          toNumericBase: 'dec',
          toCurrency: 'USDT',
          conversionRate: multiplier,
          invertConversionRate: true,
        });
      }
    }
  } else {
    decimalValueString = Number(value).toString();
  }
  return token ? (
    <div className="flexR items-end">
      <TokenIcon token={token} radius={30} />
      <div className="dec-symbol-container">
        <span className="dec">{decimalValueString}</span>
        <span className="symbol">{token.symbol}</span>
      </div>
    </div>
  ) : (
    <div className="flexR">
      <span className="dec"> </span>
    </div>
  );
}
