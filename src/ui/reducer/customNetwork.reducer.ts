import { createSlice } from '@reduxjs/toolkit';
import { Provider } from 'types/network';

type CustomNetworkStoreState = {
  providers: Provider[];
  isLoaded: boolean;
};

export const customNetworkSlice = createSlice<
  CustomNetworkStoreState,
  {
    setCustomNetworks: (
      state: CustomNetworkStoreState,
      action: {
        type: string;
        payload: Provider[];
      }
    ) => any;
  }
>({
  name: 'customNetworks',
  initialState: {
    providers: [],
    isLoaded: false,
  },
  reducers: {
    setCustomNetworks(
      _,
      action: {
        type: string;
        payload: Provider[];
      }
    ) {
      return {
        providers: action.payload,
        isLoaded: true,
      };
    },
  },
});

export const { setCustomNetworks } = customNetworkSlice.actions;

export default customNetworkSlice.reducer;
