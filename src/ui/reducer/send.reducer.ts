import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import network from 'background/service/network';
import { GAS_ESTIMATE_TYPES, GAS_LIMITS } from 'constants/gas';
import { TransactionEnvelopeTypes } from 'constants/transaction';
import { addHexPrefix } from 'ethereumjs-util';
import { stat } from 'fs';
import { ASSET_TYPES, initialState, SEND_STAGES } from 'ui/context/Send';
import { calcGasTotal } from 'ui/context/send.utils';
import { isEIP1559Network, getCurrentChainId } from 'ui/selectors/selectors';
import { RootState } from '.';

/**
 * Responsible for initializing required state for the send slice.
 * This method is dispatched from the send page in the componentDidMount
 * method. It is also dispatched anytime the network changes to ensure that
 * the slice remains valid with changing token and account balances. To do so
 * it keys into state to get necessary values and computes a starting point for
 * the send slice. It returns the values that might change from this action and
 * those values are written to the slice in the `initializeSendState.fulfilled`
 * action handler.
 */
export const initializeSendState = createAsyncThunk(
  'send/initializeSendState',
  async (_, thunkApi) => {
    const state: RootState = thunkApi.getState() as RootState;
    const eip1559support = isEIP1559Network(state);
    const {
      send: { asset, stage, draftTransaction },
      network,
      gas,
    } = state;

    console.log('---------initializeSendState:--------', state);
    const gasPrice = '0x1';

    // Set a basic gasLimit in the event that other estimation fails
    const gasLimit =
      asset.type === ASSET_TYPES.TOKEN
        ? GAS_LIMITS.BASE_TOKEN_ESTIMATE
        : GAS_LIMITS.SIMPLE;

    return {
      address: null,
      nativeBalance: '0x0',
      assetBalance: '0x0',
      chainId: getCurrentChainId(state),
      gasLimit,
      eip1559support,
    };
  }
);

export const sendSlice = createSlice<
  any,
  {
    updateDraftTransaction: (state: any, action: any) => any;
    resetSendState: () => any;
  }
>({
  name: 'send',
  initialState: {
    eip1559support: false,
    draftTransaction: {
      // The metamask internal id of the transaction. Only populated in the EDIT
      // stage.
      id: null,
      // The hex encoded data provided by the user who has enabled hex data field
      // in advanced settings
      userInputHexData: null,
      // The txParams that should be submitted to the network once this
      // transaction is confirmed. This object is computed on every write to the
      // slice of fields that would result in the txParams changing
      txParams: {
        to: '',
        from: '',
        data: undefined,
        value: '0x0',
        gas: '0x0',
        gasPrice: '0x0',
        type: '0x0',
      },
    },
  },
  reducers: {
    updateDraftTransaction: (state, action) => {
      // We need to make sure that we only include the right gas fee fields
      // based on the type of transaction the network supports. We will also set
      // the type param here. We must delete the opposite fields to avoid
      // stale data in txParams.
      if (state.eip1559support) {
        state.draftTransaction.txParams.type =
          TransactionEnvelopeTypes.FEE_MARKET;

        (state.draftTransaction.txParams as any).maxFeePerGas =
          action.payload.gas.maxFeePerGas;
        state.draftTransaction.txParams.maxPriorityFeePerGas =
          action.payload.gas.maxPriorityFeePerGas;

        if (
          !state.draftTransaction.txParams.maxFeePerGas ||
          state.draftTransaction.txParams.maxFeePerGas === '0x0'
        ) {
          state.draftTransaction.txParams.maxFeePerGas =
            action.payload.gas.gasPrice;
        }

        if (
          !state.draftTransaction.txParams.maxPriorityFeePerGas ||
          state.draftTransaction.txParams.maxPriorityFeePerGas === '0x0'
        ) {
          state.draftTransaction.txParams.maxPriorityFeePerGas =
            state.draftTransaction.txParams.maxFeePerGas;
        }

        delete state.draftTransaction.txParams.gasPrice;
      } else {
        delete state.draftTransaction.txParams.maxFeePerGas;
        delete state.draftTransaction.txParams.maxPriorityFeePerGas;

        state.draftTransaction.txParams.gasPrice = state.gas.gasPrice;
        state.draftTransaction.txParams.type = TransactionEnvelopeTypes.LEGACY;
      }
    },
    resetSendState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(initializeSendState.fulfilled, (state, action) => {
      console.log('---------initializeSendState.fulfilled:--------', state);
      state.eip1559support = action.payload.eip1559support;
      state.gas.gasLimit = action.payload.gasLimit;
    });
  },
});

export function resetSendState() {
  return async (dispatch, getState) => {
    const state = getState();
    console.log('---------resetSendState:--------', state);
    dispatch(actions.resetSendState());
  };
}

const { actions, reducer } = sendSlice;
export default reducer;
