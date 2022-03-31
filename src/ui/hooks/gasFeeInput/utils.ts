import { CUSTOM_GAS_ESTIMATE, GAS_ESTIMATE_TYPES } from 'constants/gas';
import { Transaction } from 'constants/transaction';

export function getGasFeeEstimate(
  field: string,
  gasFeeEstimates,
  gasEstimateType: GAS_ESTIMATE_TYPES,
  estimateToUse,
  fallback: number | string = '0'
) {
  if (gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET) {
    return gasFeeEstimates?.[estimateToUse]?.[field] ?? String(fallback);
  }
  return String(fallback);
}

export const feeParamsAreCustom = (transaction: Transaction) =>
  !transaction?.userFeeLevel ||
  transaction?.userFeeLevel === CUSTOM_GAS_ESTIMATE;
