import { createSlice } from '@reduxjs/toolkit';
import { Token, ITokenStore } from 'types/token';

export const tokensListSlice = createSlice<
  ITokenStore,
  {
    setTokens: (
      state: ITokenStore,
      action: {
        type: string;
        payload: Token[];
      }
    ) => any;
    setBalances: (
      state: ITokenStore,
      action: {
        type: string;
        payload: ITokenStore['balances'];
      }
    ) => any;
    setTokenServiceState: (
      state: ITokenStore,
      action: {
        type: string;
        payload: ITokenStore;
      }
    ) => any;
  }
>({
  name: 'token',
  initialState: {
    tokens: [],
    balances: {},
  },
  reducers: {
    setTokens(state, action) {
      state.tokens = action.payload;
    },
    setBalances(state, action) {
      state.balances = action.payload;
    },
    setTokenServiceState(_, action) {
      return action.payload;
    },
  },
});

export const { setTokens, setBalances, setTokenServiceState } =
  tokensListSlice.actions;

export default tokensListSlice.reducer;
