import {
  getCurrentCurrency,
  getNativeCurrency,
  // getPreferences,
  getShouldShowFiat,
} from 'ui/selectors/selectors';
import { shallowEqual, useSelector } from 'react-redux';

/**
 * Defines the shape of the options parameter for useUserPreferencedCurrency
 * @typedef {Object} UseUserPreferencedCurrencyOptions
 * @property {number} [numberOfDecimals]     - Number of significant decimals to display
 * @property {number} [ethNumberOfDecimals]  - Number of significant decimals to display
 *                                             when using ETH
 * @property {number} [fiatNumberOfDecimals] - Number of significant decimals to display
 *                                            when using fiat
 */
export interface UseUserPreferencedCurrencyOptions {
  numberOfDecimals?: number;
  ethNumberOfDecimals?: number;
  fiatNumberOfDecimals?: number;
}
/**
 * Defines the return shape of useUserPreferencedCurrency
 * @typedef {Object} UserPreferredCurrency
 * @property {string} currency         - the currency type to use (eg: 'ETH', 'usd')
 * @property {number} numberOfDecimals - Number of significant decimals to display
 */
export interface UserPreferredCurrency {
  currency: string;
  numberOfDecimals: number;
}
/**
 * useUserPreferencedCurrency
 *
 * returns an object that contains what currency to use for displaying values based
 * on the user's preference settings, as well as the significant number of decimals
 * to display based on the currency
 * @param {"PRIMARY" | "SECONDARY"} type - what display type is being rendered
 * @param {UseUserPreferencedCurrencyOptions} opts - options to override default values
 * @return {UserPreferredCurrency}
 */
export function useUserPreferencedCurrency(
  type: 'PRIMARY' | 'SECONDARY',
  opts: UseUserPreferencedCurrencyOptions = {}
): UserPreferredCurrency {
  const nativeCurrency = useSelector(getNativeCurrency);
  // const { useNativeCurrencyAsPrimaryCurrency } = useSelector(
  //   getPreferences,
  //   shallowEqual,
  // );
  // @todo: getPreferences selector
  const useNativeCurrencyAsPrimaryCurrency = true;
  const showFiat = useSelector(getShouldShowFiat);
  const currentCurrency = useSelector(getCurrentCurrency);

  let currency: string, numberOfDecimals: number;
  if (
    !showFiat ||
    (type === 'PRIMARY' && useNativeCurrencyAsPrimaryCurrency) ||
    (type === 'SECONDARY' && !useNativeCurrencyAsPrimaryCurrency)
  ) {
    // Display ETH
    currency = nativeCurrency || 'ETH';
    numberOfDecimals = opts.numberOfDecimals || opts.ethNumberOfDecimals || 8;
    return { currency, numberOfDecimals };
  } else {
    // Display Fiat
    currency = currentCurrency;
    numberOfDecimals = opts.numberOfDecimals || opts.fiatNumberOfDecimals || 2;
    return { currency, numberOfDecimals };
  }
}
