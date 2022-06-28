import { createSlice } from '@reduxjs/toolkit';
import type { CosmosTx } from 'background/service/transactions/cosmos/cosmos';

export const cosmosTransactionsSlice = createSlice<
  Record<string, CosmosTx>,
  {
    setCosmosTransactions: (
      state: Record<string, CosmosTx>,
      action: {
        type: string;
        payload: Record<string, CosmosTx>;
      }
    ) => any;
  }
>({
  name: 'cosmosTxHistory',
  initialState: {},
  reducers: {
    setCosmosTransactions(state, action) {
      return action.payload;
    },
  },
});

export const { setCosmosTransactions } = cosmosTransactionsSlice.actions;

export default cosmosTransactionsSlice.reducer;
