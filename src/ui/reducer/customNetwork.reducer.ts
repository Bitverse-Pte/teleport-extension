import { createSlice } from '@reduxjs/toolkit';
import { Ecosystem, Provider } from 'types/network';

interface CustomNetworkStoreState {
  // ecosystem => list of network
  networks: Provider[];

  // ecosytems => list of network's ID by order
  orderOfNetworks: Record<Ecosystem, string[]>;

  isLoaded: boolean;
}

type CustomNetworkStore = Omit<CustomNetworkStoreState, 'isLoaded'>;

export const customNetworkSlice = createSlice<
  CustomNetworkStoreState,
  {
    setCustomNetworks: (
      state: CustomNetworkStoreState,
      action: {
        type: string;
        payload: CustomNetworkStore;
      }
    ) => any;
  }
>({
  name: 'customNetworks',
  initialState: {
    networks: [],
    orderOfNetworks: {
      [Ecosystem.EVM]: [],
      [Ecosystem.COSMOS]: [],
      [Ecosystem.POLKADOT]: [],
    },
    isLoaded: false,
  },
  reducers: {
    setCustomNetworks(_, action) {
      return {
        ...action.payload,
        isLoaded: true,
      };
    },
  },
});

export const { setCustomNetworks } = customNetworkSlice.actions;

export default customNetworkSlice.reducer;
