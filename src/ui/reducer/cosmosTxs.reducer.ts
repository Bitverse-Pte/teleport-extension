import { createSlice } from '@reduxjs/toolkit';
import { CosmosTx } from 'background/service/transactions/cosmos/tx';

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
