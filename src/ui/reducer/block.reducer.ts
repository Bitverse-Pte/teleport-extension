import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';

interface CurrentBlockSliceState {
  gasLimit: string;
  gasFeeEstimates: any;
}

export const currentBlockSlice = createSlice<
  CurrentBlockSliceState,
  {
    setCurrentGasLimit: (
      state: CurrentBlockSliceState,
      action: PayloadAction<string>
    ) => any;
    setGasFeeEstimates: (
      state: CurrentBlockSliceState,
      action: PayloadAction<string>
    ) => any;
  }
>({
  name: 'currentBlock',
  initialState: {
    gasLimit: '',
    gasFeeEstimates: {},
  },
  reducers: {
    setCurrentGasLimit(state, action) {
      state.gasLimit = action.payload;
    },
    setGasFeeEstimates(state, action) {
      state.gasFeeEstimates = action.payload;
    },
  },
});

export const { setCurrentGasLimit, setGasFeeEstimates } =
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
