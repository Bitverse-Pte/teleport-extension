import React from 'react';
import './index.less';
import { conversionUtil, getValueFromWeiHex } from 'ui/utils/conversion';
import { ETH } from 'constants/transaction';
import { Token } from 'types/token';
import { TokenIcon } from '../Widgets';
import { addEllipsisToEachWordsInTheEnd } from 'ui/helpers/utils/currency-display.util';
import { addHexPrefix } from 'ethereumjs-util';

export default function UserPreferencedCurrencyDisplay({
  value,
  token,
  isEVM = true,
}) {
  const multiplier = Math.pow(10, Number(token?.decimal || 0));
  let decimalValueString = '';
  if (isEVM) {
    decimalValueString = conversionUtil(addHexPrefix(value), {
      fromNumericBase: 'hex',
      toNumericBase: 'dec',
      toCurrency: token?.symbol || ETH,
      conversionRate: multiplier,
      invertConversionRate: true,
    });
  } else {
    decimalValueString = (Number(value) * multiplier).toString();
  }
  return token ? (
    <div className="flexR items-end">
      <TokenIcon token={token} radius={30} />
      <span className="dec" title={decimalValueString}>
        {isEVM ? addEllipsisToEachWordsInTheEnd(decimalValueString, 8) : value}{' '}
      </span>
      <span className="symbol">{token.symbol} </span>
    </div>
  ) : (
    <div className="flexR">
      <span className="dec"> </span>
    </div>
  );
}
