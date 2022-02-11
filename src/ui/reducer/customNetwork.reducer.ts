import { createSlice } from '@reduxjs/toolkit';
import { Provider } from 'types/network';

export const customNetworkSlice = createSlice<
  Provider[],
  {
    setCustomNetworks: (
      state: Provider[],
      action: {
        type: string;
        payload: Provider[];
      }
    ) => any;
    addCustomNetwork: (
      state: Provider[],
      action: {
        type: string;
        payload: Provider;
      }
    ) => any;
    removeCustomNetwork: (
      state: Provider[],
      action: {
        type: string;
        payload: number;
      }
    ) => any;
  }
>({
  name: 'customNetworks',
  initialState: [],
  reducers: {
    setCustomNetworks(
      _,
      action: {
        type: string;
        payload: Provider[];
      }
    ) {
      return action.payload;
    },
    addCustomNetwork: (
      state: Provider[],
      action: {
        type: string;
        payload: Provider;
      }
    ) => {
      state.push(action.payload);
    },
    removeCustomNetwork(
      state: Provider[],
      action: {
        type: string;
        payload: number;
      }
    ) {
      return state.filter((_, idx) => idx !== action.payload);
    },
  },
});

export const { addCustomNetwork, removeCustomNetwork, setCustomNetworks } =
  customNetworkSlice.actions;

export default customNetworkSlice.reducer;
