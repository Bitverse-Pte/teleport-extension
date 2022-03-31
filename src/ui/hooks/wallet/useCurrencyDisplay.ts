import { useMemo } from 'react';
import { useSelector } from 'react-redux';
// import {
//   formatCurrency,
//   getValueFromWeiHex,
// } from '../helpers/utils/confirm-tx.util';
import currencyFormatter, { currencies } from 'currency-formatter';
// import currencies from 'currency-formatter/currencies';
export function formatCurrency(value: any, currencyCode: string) {
  const upperCaseCurrencyCode = currencyCode.toUpperCase();

  return currencies.find((currency) => currency.code === upperCaseCurrencyCode)
    ? currencyFormatter.format(Number(value), {
        code: upperCaseCurrencyCode,
        //   style: 'currency',
      })
    : value;
}
// import { getCurrentCurrency } from '../selectors';
// import {
//   getConversionRate,
//   getNativeCurrency,
// } from '../ducks/metamask/metamask';
import { conversionUtil } from 'utils/conversion';
import { getCurrentCurrency, getNativeCurrency } from 'ui/selectors/selectors';
/**
 * Defines the shape of the options parameter for useCurrencyDisplay
 * @typedef {Object} UseCurrencyOptions
 * @property {string} [displayValue]     - When present is used in lieu of formatting the inputValue
 * @property {string} [prefix]           - String to prepend to the final result
 * @property {number} [numberOfDecimals] - Number of significant decimals to display
 * @property {string} [denomination]     - Denomination (wei, gwei) to convert to for display
 * @property {string} [currency]         - Currency type to convert to. Will override nativeCurrency
 */
export interface UseCurrencyOptions {
  displayValue?: string;
  prefix?: string;
  numberOfDecimals: number;
  denomination?: string;
  currency: string;
  hideLabel?: boolean;
  suffix?: string;
}

/**
 * Defines the return shape of the second value in the tuple
 * @typedef {Object} CurrencyDisplayParts
 * @property {string} [prefix]  - string to prepend to the value for display
 * @property {string} value     - string representing the value, formatted for display
 * @property {string} [suffix]  - string to append to the value for display
 */
export interface CurrencyDisplayParts {
  prefix?: string;
  value: string;
  suffix: string;
}
/**
 * useCurrencyDisplay hook
 *
 * Given a hexadecimal encoded value string and an object of parameters used for formatting the
 * display, produce both a fully formed string and the pieces of that string used for displaying
 * the currency to the user
 * @param {string} inputValue          - The value to format for display
 * @param {UseCurrencyOptions} opts    - An object for options to format the inputValue
 * @return {[string, CurrencyDisplayParts]}
 */
export function useCurrencyDisplay(
  inputValue: string,
  {
    displayValue,
    prefix,
    numberOfDecimals,
    denomination,
    currency,
    ...opts
  }: UseCurrencyOptions
): [string, CurrencyDisplayParts] {
  const currentCurrency = useSelector(getCurrentCurrency);
  const nativeCurrency = useSelector(getNativeCurrency);
  //   const conversionRate = useSelector(getConversionRate);
  const isUserPreferredCurrency = currency === currentCurrency;

  const value = useMemo(() => {
    if (displayValue) {
      return displayValue;
    }
    if (
      currency === nativeCurrency ||
      (!isUserPreferredCurrency && !nativeCurrency)
    ) {
      return conversionUtil(inputValue, {
        fromNumericBase: 'hex',
        toNumericBase: 'dec',
        fromDenomination: 'WEI',
        numberOfDecimals: numberOfDecimals || 2,
        toDenomination: denomination,
      });
    }
    // else if (isUserPreferredCurrency && conversionRate) {
    //   return formatCurrency(
    //     getValueFromWeiHex({
    //       value: inputValue,
    //       fromCurrency: nativeCurrency,
    //       toCurrency: currency,
    //       conversionRate,
    //       numberOfDecimals: numberOfDecimals || 2,
    //       toDenomination: denomination,
    //     }),
    //     currency,
    //   );
    // }
    return null;
  }, [
    inputValue,
    nativeCurrency,
    // conversionRate,
    displayValue,
    numberOfDecimals,
    denomination,
    currency,
    isUserPreferredCurrency,
  ]);

  let suffix = '';

  if (!opts.hideLabel) {
    suffix = opts.suffix || currency?.toUpperCase();
  }

  return [
    `${prefix || ''}${value}${suffix ? ` ${suffix}` : ''}`,
    { prefix, value, suffix },
  ];
}
