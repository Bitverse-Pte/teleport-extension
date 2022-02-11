import { createSlice } from '@reduxjs/toolkit';
import { Transaction } from 'constants/transaction';

export const transactionsSlice = createSlice<
  Record<string, Transaction>,
  {
    setTransactions: (
      state: Record<string, Transaction>,
      action: {
        type: string;
        payload: Record<string, Transaction>;
      }
    ) => any;
  }
>({
  name: 'transactions',
  initialState: {},
  reducers: {
    setTransactions(state, action) {
      return action.payload;
    },
  },
});

export const { setTransactions } = transactionsSlice.actions;

export default transactionsSlice.reducer;
