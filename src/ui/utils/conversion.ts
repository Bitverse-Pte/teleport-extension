/* Currency Conversion Utility
 * This utility function can be used for converting currency related values within metamask.
 * The caller should be able to pass it a value, along with information about the value's
 * numeric base, denomination and currency, and the desired numeric base, denomination and
 * currency. It should return a single value.
 *
 * @param {(number | string | BN)} value - The value to convert.
 * @param {Object} [options] - Options to specify details of the conversion
 * @param {string} [options.fromCurrency = 'ETH' | 'USD'] - The currency of the passed value
 * @param {string} [options.toCurrency = 'ETH' | 'USD'] - The desired currency of the result
 * @param {string} [options.fromNumericBase = 'hex' | 'dec' | 'BN'] - The numeric basic of the passed value.
 * @param {string} [options.toNumericBase = 'hex' | 'dec' | 'BN'] - The desired numeric basic of the result.
 * @param {string} [options.fromDenomination = 'WEI'] - The denomination of the passed value
 * @param {string} [options.numberOfDecimals] - The desired number of decimals in the result
 * @param {string} [options.roundDown] - The desired number of decimals to round down to
 * @param {number} [options.conversionRate] - The rate to use to make the fromCurrency -> toCurrency conversion
 * @returns {(number | string | BN)}
 *
 * The utility passes value along with the options as a single object to the `converter` function.
 * `converter` conditional modifies the supplied `value` property, depending
 * on the accompanying options.
 */

import BigNumber from 'bignumber.js';

import { stripHexPrefix, BN } from 'ethereumjs-util';

import { ETH, GWEI, WEI } from 'constants/transaction';

// Big Number Constants
const BIG_NUMBER_WEI_MULTIPLIER = new BigNumber('1000000000000000000');
const BIG_NUMBER_GWEI_MULTIPLIER = new BigNumber('1000000000');
const BIG_NUMBER_ETH_MULTIPLIER = new BigNumber('1');

// Setter Maps
const toBigNumber = {
  hex: (n) => new BigNumber(stripHexPrefix(n), 16),
  dec: (n) => new BigNumber(String(n), 10),
  BN: (n) => new BigNumber(n.toString(16), 16),
};
const toNormalizedDenomination = {
  WEI: (bigNumber) => bigNumber.div(BIG_NUMBER_WEI_MULTIPLIER),
  GWEI: (bigNumber) => bigNumber.div(BIG_NUMBER_GWEI_MULTIPLIER),
  ETH: (bigNumber) => bigNumber.div(BIG_NUMBER_ETH_MULTIPLIER),
};
const toSpecifiedDenomination = {
  WEI: (bigNumber) => bigNumber.times(BIG_NUMBER_WEI_MULTIPLIER).round(),
  GWEI: (bigNumber) => bigNumber.times(BIG_NUMBER_GWEI_MULTIPLIER).round(9),
  ETH: (bigNumber) => bigNumber.times(BIG_NUMBER_ETH_MULTIPLIER).round(9),
};
const baseChange = {
  hex: (n) => n.toString(16),
  dec: (n) => new BigNumber(n).toString(10),
  BN: (n) => new BN(n.toString(16)),
};

/**
 * Defines the base type of numeric value
 * @typedef {('hex' | 'dec' | 'BN')} NumericBase
 */

export enum NumericBase {
  hex = 'hex',
  dec = 'dec',
  BN = 'BN',
}

/**
 * Defines which type of denomination a value is in
 * @typedef {('WEI' | 'GWEI' | 'ETH')} EthDenomination
 */

export enum EthDenomination {
  WEI = 'WEI',
  GWEI = 'GWEI',
  ETH = 'ETH',
}

/**
 * Utility method to convert a value between denominations, formats and currencies.
 * @param {Object} input
 * @param {string | BigNumber} input.value
 * @param {NumericBase} input.fromNumericBase
 * @param {EthDenomination} [input.fromDenomination]
 * @param {string} [input.fromCurrency]
 * @param {NumericBase} input.toNumericBase
 * @param {EthDenomination} [input.toDenomination]
 * @param {string} [input.toCurrency]
 * @param {number} [input.numberOfDecimals]
 * @param {number} [input.conversionRate]
 * @param {boolean} [input.invertConversionRate]
 * @param {number} [input.roundDown]
 */
const converter = ({
  value,
  fromNumericBase,
  fromDenomination,
  fromCurrency,
  toNumericBase,
  toDenomination,
  toCurrency,
  numberOfDecimals,
  conversionRate,
  invertConversionRate,
  roundDown,
}: any) => {
  let convertedValue = fromNumericBase
    ? toBigNumber[fromNumericBase](value)
    : value;
  if (fromDenomination) {
    convertedValue = toNormalizedDenomination[fromDenomination](convertedValue);
  }

  if (fromCurrency !== toCurrency) {
    if (conversionRate === null || conversionRate === undefined) {
      throw new Error(
        `Converting from ${fromCurrency} to ${toCurrency} requires a conversionRate, but one was not provided`
      );
    }
    let rate = toBigNumber.dec(conversionRate);
    if (invertConversionRate) {
      rate = new BigNumber(1.0).div(conversionRate);
    }
    convertedValue = (convertedValue as BigNumber).times(rate);
  }

  if (toDenomination) {
    convertedValue = toSpecifiedDenomination[toDenomination](convertedValue);
  }

  if (numberOfDecimals) {
    convertedValue = (convertedValue as BigNumber).round(
      numberOfDecimals,
      BigNumber.ROUND_HALF_DOWN
    );
  }

  if (roundDown) {
    convertedValue = (convertedValue as BigNumber).round(
      roundDown,
      BigNumber.ROUND_DOWN
    );
  }

  if (toNumericBase) {
    convertedValue = baseChange[toNumericBase](convertedValue);
  }
  return convertedValue;
};

const conversionUtil = (
  value: string | BigNumber,
  {
    fromCurrency,
    toCurrency = fromCurrency,
    fromNumericBase,
    toNumericBase,
    fromDenomination,
    toDenomination,
    numberOfDecimals,
    conversionRate,
    invertConversionRate,
  }: any
) => {
  if (fromCurrency !== toCurrency && !conversionRate) {
    return 0;
  }
  return converter({
    fromCurrency,
    toCurrency,
    fromNumericBase,
    toNumericBase,
    fromDenomination,
    toDenomination,
    numberOfDecimals,
    conversionRate,
    invertConversionRate,
    value: value || '0',
  });
};

function getValueFromWeiHex({
  value,
  fromCurrency = ETH,
  toCurrency,
  conversionRate,
  numberOfDecimals,
  toDenomination,
}: {
  value: string | BigNumber;
  fromCurrency?: string;
  toCurrency?: string;
  toDenomination?: EthDenomination;
  numberOfDecimals?: number;
  conversionRate?: number;
}) {
  return conversionUtil(value, {
    fromNumericBase: NumericBase.hex,
    toNumericBase: NumericBase.dec,
    fromCurrency,
    toCurrency,
    numberOfDecimals,
    fromDenomination: EthDenomination.WEI,
    toDenomination,
    conversionRate,
  });
}

function getWeiHexFromDecimalValue({
  value,
  fromCurrency,
  conversionRate,
  fromDenomination,
  invertConversionRate,
}: {
  value: string | BigNumber;
  fromCurrency?: string;
  fromDenomination?: EthDenomination;
  conversionRate?: number;
  invertConversionRate?: boolean;
}) {
  return conversionUtil(value, {
    fromNumericBase: NumericBase.dec,
    toNumericBase: NumericBase.hex,
    toCurrency: ETH,
    fromCurrency,
    conversionRate,
    invertConversionRate,
    fromDenomination,
    toDenomination: EthDenomination.WEI,
  });
}

const getBigNumber = (value, base) => {
  if (!isValidBase(base)) {
    throw new Error('Must specificy valid base');
  }

  // We don't include 'number' here, because BigNumber will throw if passed
  // a number primitive it considers unsafe.
  if (typeof value === 'string' || value instanceof BigNumber) {
    return new BigNumber(value, base);
  }

  return new BigNumber(String(value), base);
};

// Utility function for checking base types
const isValidBase = (base) => {
  return Number.isInteger(base) && base > 1;
};

// in case of `a` or `b` was undefined
const addHexes = (
  a: string | BigNumber = '0',
  b: string | BigNumber = '0',
  options = {
    aBase: 16,
    bBase: 16,
    toNumericBase: NumericBase.hex,
    numberOfDecimals: 6,
  }
) => {
  const { aBase, bBase, ...conversionOptions } = options;
  if (!isValidBase(aBase) || !isValidBase(bBase)) {
    throw new Error('Must specify valid aBase and bBase');
  }
  const value = getBigNumber(a, aBase).add(getBigNumber(b, bBase));
  return converter({
    value,
    ...conversionOptions,
  });
};

export function subtractHexes(aHexWEI: string, bHexWEI: string) {
  return subtractCurrencies(aHexWEI, bHexWEI, {
    aBase: 16,
    bBase: 16,
    toNumericBase: 'hex',
    numberOfDecimals: 6,
  });
}

const multipyHexes = (
  a,
  b,
  options = {
    aBase: 16,
    bBase: 16,
    toNumericBase: NumericBase.hex,
    numberOfDecimals: 6,
  }
) => {
  const { aBase, bBase, ...conversionOptions } = options;

  if (!isValidBase(aBase) || !isValidBase(bBase)) {
    throw new Error('Must specify valid aBase and bBase');
  }
  const value = getBigNumber(a, aBase).times(getBigNumber(b, bBase));
  return converter({
    value,
    ...conversionOptions,
  });
};

const addCurrencies = (a, b, options = {}) => {
  const { aBase, bBase, ...conversionOptions }: any = options;

  if (!isValidBase(aBase) || !isValidBase(bBase)) {
    throw new Error('Must specify valid aBase and bBase');
  }

  const value = getBigNumber(a, aBase).add(getBigNumber(b, bBase));

  return converter({
    value,
    ...conversionOptions,
  });
};

const subtractCurrencies = (a, b, options = {}) => {
  const { aBase, bBase, ...conversionOptions }: any = options;

  if (!isValidBase(aBase) || !isValidBase(bBase)) {
    throw new Error('Must specify valid aBase and bBase');
  }

  const value = getBigNumber(a, aBase).minus(getBigNumber(b, bBase));

  return converter({
    value,
    ...conversionOptions,
  });
};

const multiplyCurrencies = (a, b, options = {}) => {
  const { multiplicandBase, multiplierBase, ...conversionOptions }: any =
    options;

  if (!isValidBase(multiplicandBase) || !isValidBase(multiplierBase)) {
    throw new Error('Must specify valid multiplicandBase and multiplierBase');
  }

  const value = getBigNumber(a, multiplicandBase).times(
    getBigNumber(b, multiplierBase)
  );

  return converter({
    value,
    ...conversionOptions,
  });
};

const conversionGreaterThan = ({ ...firstProps }, { ...secondProps }) => {
  const firstValue = converter({ ...firstProps });
  const secondValue = converter({ ...secondProps });

  return firstValue.gt(secondValue);
};

const conversionLessThan = ({ ...firstProps }, { ...secondProps }) => {
  const firstValue = converter({ ...firstProps });
  const secondValue = converter({ ...secondProps });

  return firstValue.lt(secondValue);
};

const conversionMax = ({ ...firstProps }, { ...secondProps }) => {
  const firstIsGreater = conversionGreaterThan(
    { ...firstProps },
    { ...secondProps }
  );

  return firstIsGreater ? firstProps.value : secondProps.value;
};

const conversionGTE = ({ ...firstProps }, { ...secondProps }) => {
  const firstValue = converter({ ...firstProps });
  const secondValue = converter({ ...secondProps });
  return firstValue.greaterThanOrEqualTo(secondValue);
};

const conversionLTE = ({ ...firstProps }, { ...secondProps }) => {
  const firstValue = converter({ ...firstProps });
  const secondValue = converter({ ...secondProps });
  return firstValue.lessThanOrEqualTo(secondValue);
};

const toNegative = (n, options = {}) => {
  return multiplyCurrencies(n, -1, options);
};

function decGWEIToHexWEI(decGWEI) {
  return conversionUtil(decGWEI, {
    fromNumericBase: 'dec',
    toNumericBase: 'hex',
    fromDenomination: 'GWEI',
    toDenomination: 'WEI',
  });
}

function hexWeiToDecGWEI(hexWei) {
  return conversionUtil(hexWei, {
    fromNumericBase: 'hex',
    toNumericBase: 'dec',
    fromDenomination: 'WEI',
    toDenomination: 'GWEI',
  });
}

function hexToDecimal(hexValue: string | BigNumber) {
  return conversionUtil(hexValue, {
    fromNumericBase: 'hex',
    toNumericBase: 'dec',
  });
}

function decimalToHex(decimal: string | BigNumber) {
  return conversionUtil(decimal, {
    fromNumericBase: 'dec',
    toNumericBase: 'hex',
  });
}

export {
  conversionUtil,
  getValueFromWeiHex,
  getWeiHexFromDecimalValue,
  addHexes,
  multipyHexes,
  addCurrencies,
  multiplyCurrencies,
  conversionGreaterThan,
  conversionLessThan,
  conversionGTE,
  conversionLTE,
  conversionMax,
  toNegative,
  subtractCurrencies,
  decGWEIToHexWEI,
  hexWeiToDecGWEI,
  toBigNumber,
  hexToDecimal,
  decimalToHex,
  toNormalizedDenomination,
};
