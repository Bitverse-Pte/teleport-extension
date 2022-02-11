import { KnownMethodDict } from 'background/service/knownMethod';
import { createSlice } from '@reduxjs/toolkit';

export const knownMethodSlice = createSlice<
  KnownMethodDict,
  {
    updateKnownMethods: (
      state: KnownMethodDict,
      action: {
        type: string;
        payload: KnownMethodDict;
      }
    ) => any;
  }
>({
  name: 'knownMethod',
  initialState: {},
  reducers: {
    updateKnownMethods(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateKnownMethods } = knownMethodSlice.actions;

export default knownMethodSlice.reducer;
