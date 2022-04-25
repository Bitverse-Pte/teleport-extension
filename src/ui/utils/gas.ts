import { bnLessThan, bnGreaterThan } from './utils';
import BigNumber from 'bignumber.js';
import type { GasFeeEstimates } from '@metamask/controllers';

const HIGH_FEE_WARNING_MULTIPLIER = 1.5;

export const validatePriorityFee = (
  value: string | number | BigNumber,
  gasFeeEstimates?: GasFeeEstimates
) => {
  if (value <= 0) {
    return 'editGasMaxPriorityFeeBelowMinimumV2';
  }
  if (
    gasFeeEstimates?.low &&
    bnLessThan(value, gasFeeEstimates.low.suggestedMaxPriorityFeePerGas)
  ) {
    return 'editGasMaxPriorityFeeLowV2';
  }
  if (
    gasFeeEstimates?.high &&
    bnGreaterThan(
      value,
      Number(gasFeeEstimates?.high.suggestedMaxPriorityFeePerGas) *
        HIGH_FEE_WARNING_MULTIPLIER
    )
  ) {
    return 'editGasMaxPriorityFeeHighV2';
  }
  return null;
};
