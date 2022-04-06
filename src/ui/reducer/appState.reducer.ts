import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  isLoading: boolean;
}

export const appStateSlice = createSlice<
  AppState,
  {
    showLoadingIndicator: (state: AppState) => any;
    hideLoadingIndicator: (state: AppState) => any;
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
