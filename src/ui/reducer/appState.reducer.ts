import { createSlice } from '@reduxjs/toolkit';

export const appStateSlice = createSlice<
  {
    isLoading: boolean;
  },
  {
    showLoadingIndicator: (state: any) => any;
    hideLoadingIndicator: (state: any) => any;
  }
>({
  name: 'appState',
  initialState: {
    isLoading: false,
  },
  reducers: {
    showLoadingIndicator(state) {
      return {
        ...state,
        isLoading: true,
      };
    },

    hideLoadingIndicator(state) {
      return {
        ...state,
        isLoading: false,
      };
    },
  },
});

export const { showLoadingIndicator, hideLoadingIndicator } =
  appStateSlice.actions;

export default appStateSlice.reducer;
