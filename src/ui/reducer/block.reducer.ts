import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GAS_ESTIMATE_TYPES } from 'constants/gas';
import type { RootState } from '.';

interface CurrentBlockSliceState {
  gasLimit: string;
  gasFeeEstimates: any;
  gasEstimateType: string;
}

export const currentBlockSlice = createSlice<
  CurrentBlockSliceState,
  {
    setCurrentGasLimit: (
      state: CurrentBlockSliceState,
      action: PayloadAction<string>
    ) => any;
    setGasEstimates: (
      state: CurrentBlockSliceState,
      action: PayloadAction<{
        gasFeeEstimates: any;
        gasEstimateType: string;
      }>
    ) => any;
  }
>({
  name: 'currentBlock',
  initialState: {
    gasLimit: '',
    gasFeeEstimates: {},
    gasEstimateType: GAS_ESTIMATE_TYPES.LEGACY,
  },
  reducers: {
    setCurrentGasLimit(state, action) {
      state.gasLimit = action.payload;
    },
    setGasEstimates(state, action) {
      state.gasFeeEstimates = action.payload.gasFeeEstimates;
      state.gasEstimateType = action.payload.gasEstimateType;
    },
  },
});

export const { setCurrentGasLimit, setGasEstimates } =
  currentBlockSlice.actions;

/**
 * use this with `useSelector` and receive always-fresh Gas Limit
 *
 * e.g `const gasLimit = useSelector(getCurrentBlockGasLimit)`
 * @param s the parameter that `useSelector` will inject
 * @returns the CurrentBlockGasLimit
 */
export const getCurrentBlockGasLimit = (s: RootState) =>
  s.currentBlock.gasLimit;

export default currentBlockSlice.reducer;
