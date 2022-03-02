import { createSlice } from '@reduxjs/toolkit';
import { NetworkController, Provider } from 'types/network';
import { defaultNetworks } from 'constants/defaultNetwork';

export const networkSlice = createSlice<
  NetworkController,
  {
    updateNetworkController: (
      state: NetworkController,
      action: {
        type: string;
        payload: Partial<NetworkController>;
      }
    ) => any;
  }
>({
  name: 'networkController',
  initialState: {
    network: 'loading',
    provider: defaultNetworks['ethereum'] as Provider,
    networkDetails: {
      EIPS: {
        '1559': false,
      },
    },
  },
  reducers: {
    updateNetworkController(state, action) {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateNetworkController } = networkSlice.actions;

export default networkSlice.reducer;
