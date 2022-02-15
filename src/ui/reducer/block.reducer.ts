import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '.';

interface CurrentBlockSliceState {
  gasLimit: string;
}

export const currentBlockSlice = createSlice<
  CurrentBlockSliceState,
  {
    setCurrentGasLimit: (
      state: CurrentBlockSliceState,
      action: PayloadAction<string>
    ) => any;
  }
>({
  name: 'currentBlock',
  initialState: {
    gasLimit: '',
  },
  reducers: {
    setCurrentGasLimit(state, action) {
      state.gasLimit = action.payload;
    },
  },
});

export const { setCurrentGasLimit } = currentBlockSlice.actions;

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
