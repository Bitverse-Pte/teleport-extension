import BigNumber from 'bignumber.js';
import { GAS_RECOMMENDATIONS, PRIORITY_LEVELS } from 'constants/gas';
import { addHexPrefix } from 'ethereumjs-util';
import { multiplyCurrencies } from 'ui/utils/conversion';
import { bnGreaterThan } from 'ui/utils/utils';
import { hexWEIToDecGWEI } from 'utils/conversion';

export const gasEstimateGreaterThanGasUsedPlusTenPercent = (
  gasUsed: any,
  gasFeeEstimates: any,
  estimate: PRIORITY_LEVELS,
) => {
  let { maxFeePerGas: maxFeePerGasInTransaction } = gasUsed;
  maxFeePerGasInTransaction = new BigNumber(
    hexWEIToDecGWEI(addTenPercentAndRound(maxFeePerGasInTransaction)),
  );

  const maxFeePerGasFromEstimate =
    gasFeeEstimates[estimate]?.suggestedMaxFeePerGas;
  return bnGreaterThan(maxFeePerGasFromEstimate, maxFeePerGasInTransaction);
};

/**
 * Simple helper to save on duplication to multiply the supplied wei hex string
 * by 1.10 to get bare minimum new gas fee.
 *
 * @param {string | undefined} hexStringValue - hex value in wei to be incremented
 * @param conversionOptions
 * @returns {string | undefined} hex value in WEI 10% higher than the param.
 */
export function addTenPercent(hexStringValue?: string, conversionOptions: any = {}): string | undefined {
  if (hexStringValue === undefined) {
    return undefined;
  }
  return addHexPrefix(
    multiplyCurrencies(hexStringValue, 1.1, {
      toNumericBase: 'hex',
      multiplicandBase: 16,
      multiplierBase: 10,
      numberOfDecimals: 0,
      ...conversionOptions,
    }),
  );
}

/**
 * Simple helper to save on duplication to multiply the supplied wei hex string
 * by 1.10 to get bare minimum new gas fee.
 *
 * @param {string | undefined} hexStringValue - hex value in wei to be incremented
 * @returns {string | undefined} hex value in WEI 10% higher than the param.
 */
export function addTenPercentAndRound(hexStringValue?: string): string | undefined {
  return addTenPercent(hexStringValue, { numberOfDecimals: 0 });
}

export function isMetamaskSuggestedGasEstimate(estimate: any) {
  return [
    GAS_RECOMMENDATIONS.HIGH,
    GAS_RECOMMENDATIONS.MEDIUM,
    GAS_RECOMMENDATIONS.LOW,
  ].includes(estimate);
}
