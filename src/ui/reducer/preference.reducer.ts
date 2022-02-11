import { PreferenceStore } from 'background/service/preference';
import { createSlice } from '@reduxjs/toolkit';

export const preferenceSlice = createSlice<
  PreferenceStore,
  {
    updatePreferences: (
      state: PreferenceStore,
      action: {
        type: string;
        payload: PreferenceStore;
      }
    ) => any;
  }
>({
  name: 'preferenceStore',
  initialState: {} as PreferenceStore,
  reducers: {
    updatePreferences(_, action) {
      return action.payload;
    },
  },
});

export const { updatePreferences } = preferenceSlice.actions;

export default preferenceSlice.reducer;
