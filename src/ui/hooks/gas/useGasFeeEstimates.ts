import { GasFeeEstimates, GasFeeState } from '@metamask/controllers';
import isEqual from 'lodash/isEqual';
import { shallowEqual, useSelector } from 'react-redux';
import { GAS_ESTIMATE_TYPES } from 'constants/gas';
import {
  getGasEstimateType,
  getEstimatedGasFeeTimeBounds,
  getIsGasEstimatesLoading,
  getIsNetworkBusy,
} from 'ui/selectors/gas.selector';

/**
 * @property gasEstimateType - The type of estimate provided
 * @property gasFeeEstimates - The estimate object
 * @property estimatedGasFeeTimeBounds -
 *  estimated time boundaries for fee-market type estimates
 * @property isGasEstimateLoading - indicates whether the gas
 *  estimates are currently loading.
 */
interface GasEstimatesReturn {
  gasEstimateType: GAS_ESTIMATE_TYPES;
  gasFeeEstimates: GasFeeEstimates;
  estimatedGasFeeTimeBounds: GasFeeState['estimatedGasFeeTimeBounds'];
  isGasEstimatesLoading: boolean;
  isNetworkBusy?: boolean;
}

/**
 * Gets the current gasFeeEstimates from state and begins polling for new
 * estimates. When this hook is removed from the tree it will signal to the
 * GasFeeController that it is done requiring new gas estimates. Also checks
 * the returned gas estimate for validity on the current network.
 *
 * @returns {GasFeeEstimates} GasFeeEstimates object
 */
export function useGasFeeEstimates(): GasEstimatesReturn {
  const gasEstimateType = useSelector(getGasEstimateType);
  const gasFeeEstimates = useSelector(
    (s) => s.currentBlock.gasFeeEstimates,
    isEqual
  );
  const estimatedGasFeeTimeBounds = useSelector(
    getEstimatedGasFeeTimeBounds,
    shallowEqual
  );
  const isGasEstimatesLoading = useSelector(getIsGasEstimatesLoading);
  const isNetworkBusy = useSelector(getIsNetworkBusy);

  return {
    gasFeeEstimates,
    gasEstimateType,
    estimatedGasFeeTimeBounds,
    isGasEstimatesLoading,
    isNetworkBusy,
  };
}
