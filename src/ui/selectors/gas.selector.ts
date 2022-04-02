import {
  GAS_ESTIMATE_TYPES,
  NETWORK_CONGESTION_THRESHOLDS,
} from 'constants/gas';
import { RootState } from 'ui/reducer';
import { checkNetworkAndAccountSupports1559 } from './selectors';

export function getGasEstimateType(state: RootState) {
  return state.currentBlock.gasEstimateType;
}

export function getGasFeeEstimates(state: RootState) {
  return state.currentBlock.gasFeeEstimates;
}

export function getEstimatedGasFeeTimeBounds(state: RootState) {
  // return state.metamask.estimatedGasFeeTimeBounds;
  // @todo: implement this
  return {};
}

export function getIsGasEstimatesLoading(state: RootState) {
  const networkAndAccountSupports1559 =
    checkNetworkAndAccountSupports1559(state);
  const gasEstimateType = getGasEstimateType(state);

  // We consider the gas estimate to be loading if the gasEstimateType is
  // 'NONE' or if the current gasEstimateType cannot be supported by the current
  // network
  const isEIP1559TolerableEstimateType =
    gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET ||
    gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE;
  const isGasEstimatesLoading =
    gasEstimateType === GAS_ESTIMATE_TYPES.NONE ||
    (networkAndAccountSupports1559 && !isEIP1559TolerableEstimateType) ||
    (!networkAndAccountSupports1559 &&
      gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET);

  return isGasEstimatesLoading;
}

export function getIsNetworkBusy(state: RootState) {
  const gasFeeEstimates = getGasFeeEstimates(state);
  return (
    gasFeeEstimates?.networkCongestion >= NETWORK_CONGESTION_THRESHOLDS.BUSY
  );
}
