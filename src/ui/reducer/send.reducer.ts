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

async function estimateGasLimitForSend({
  selectedAddress,
  value,
  gasPrice,
  sendToken,
  to,
  data,
  isNonStandardEthChain,
  chainId,
  ...options
}) {
  let isSimpleSendOnNonStandardNetwork = false;

  // blockGasLimit may be a falsy, but defined, value when we receive it from
  // state, so we use logical or to fall back to MIN_GAS_LIMIT_HEX. Some
  // network implementations check the gas parameter supplied to
  // eth_estimateGas for validity. For this reason, we set token sends
  // blockGasLimit default to a higher number. Note that the current gasLimit
  // on a BLOCK is 15,000,000 and will be 30,000,000 on mainnet after London.
  // Meanwhile, MIN_GAS_LIMIT_HEX is 0x5208.
  let blockGasLimit = MIN_GAS_LIMIT_HEX;
  if (options.blockGasLimit) {
    blockGasLimit = options.blockGasLimit;
  } else if (sendToken) {
    blockGasLimit = GAS_LIMITS.BASE_TOKEN_ESTIMATE;
  }

  // The parameters below will be sent to our background process to estimate
  // how much gas will be used for a transaction. That background process is
  // located in tx-gas-utils.js in the transaction controller folder.
  const paramsForGasEstimate = { from: selectedAddress, value, gasPrice };

  if (sendToken) {
    if (!to) {
      // if no to address is provided, we cannot generate the token transfer
      // hexData. hexData in a transaction largely dictates how much gas will
      // be consumed by a transaction. We must use our best guess, which is
      // represented in the gas shared constants.
      return GAS_LIMITS.BASE_TOKEN_ESTIMATE;
    }
    paramsForGasEstimate.value = '0x0';

    // We have to generate the erc20/erc721 contract call to transfer tokens in
    // order to get a proper estimate for gasLimit.
    paramsForGasEstimate.data = getAssetTransferData({
      sendToken,
      fromAddress: selectedAddress,
      toAddress: to,
      amount: value,
    });

    paramsForGasEstimate.to = sendToken.address;
  } else {
    if (!data) {
      // eth.getCode will return the compiled smart contract code at the
      // address. If this returns 0x, 0x0 or a nullish value then the address
      // is an externally owned account (NOT a contract account). For these
      // types of transactions the gasLimit will always be 21,000 or 0x5208
      const { isContractAddress } = to
        ? await readAddressAsContract(global.eth, to)
        : {};
      if (!isContractAddress && !isNonStandardEthChain) {
        return GAS_LIMITS.SIMPLE;
      } else if (!isContractAddress && isNonStandardEthChain) {
        isSimpleSendOnNonStandardNetwork = true;
      }
    }

    paramsForGasEstimate.data = data;

    if (to) {
      paramsForGasEstimate.to = to;
    }

    if (!value || value === '0') {
      // TODO: Figure out what's going on here. According to eth_estimateGas
      // docs this value can be zero, or undefined, yet we are setting it to a
      // value here when the value is undefined or zero. For more context:
      // https://github.com/MetaMask/metamask-extension/pull/6195
      paramsForGasEstimate.value = '0xff';
    }
  }

  if (!isSimpleSendOnNonStandardNetwork) {
    // If we do not yet have a gasLimit, we must call into our background
    // process to get an estimate for gasLimit based on known parameters.

    paramsForGasEstimate.gas = addHexPrefix(
      multiplyCurrencies(blockGasLimit, 0.95, {
        multiplicandBase: 16,
        multiplierBase: 10,
        roundDown: '0',
        toNumericBase: 'hex',
      }),
    );
  }
   // The buffer multipler reduces transaction failures by ensuring that the
  // estimated gas is always sufficient. Without the multiplier, estimates
  // for contract interactions can become inaccurate over time. This is because
  // gas estimation is non-deterministic. The gas required for the exact same
  // transaction call can change based on state of a contract or changes in the
  // contracts environment (blockchain data or contracts it interacts with).
  // Applying the 1.5 buffer has proven to be a useful guard against this non-
  // deterministic behaviour.
  //
  // Gas estimation of simple sends should, however, be deterministic. As such
  // no buffer is needed in those cases.
  let bufferMultiplier = 1.5;
  if (isSimpleSendOnNonStandardNetwork) {
    bufferMultiplier = 1;
  } else if (CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP[chainId]) {
    bufferMultiplier = CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP[chainId];
  }

  try {
    // call into the background process that will simulate transaction
    // execution on the node and return an estimate of gasLimit
    const estimatedGasLimit = await estimateGas(paramsForGasEstimate);
    const estimateWithBuffer = addGasBuffer(
      estimatedGasLimit,
      blockGasLimit,
      bufferMultiplier,
    );
    return addHexPrefix(estimateWithBuffer);
  } catch (error) {
    const simulationFailed =
      error.message.includes('Transaction execution error.') ||
      error.message.includes(
        'gas required exceeds allowance or always failing transaction',
      );
    if (simulationFailed) {
      const estimateWithBuffer = addGasBuffer(
        paramsForGasEstimate.gas,
        blockGasLimit,
        1.5,
      );
      return addHexPrefix(estimateWithBuffer);
    }
    throw error;
  }
}


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
      send: { draftTransaction },
      network,
      gas,
    } = state;

    //const gasPrice = '0x1';

    // Set a basic gasLimit in the event that other estimation fails
    const gasLimit = GAS_LIMITS.SIMPLE;
    // asset.type === ASSET_TYPES.TOKEN
    //   ? GAS_LIMITS.BASE_TOKEN_ESTIMATE
    //   : GAS_LIMITS.SIMPLE;

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
  initialState: initialState,
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
      state.eip1559support = action.payload.eip1559support;
      state.gas.gasLimit = action.payload.gasLimit;
    });
  },
});

export function resetSendState() {
  return async (dispatch, getState) => {
    const state = getState();
    dispatch(actions.resetSendState());
  };
}

const { actions, reducer } = sendSlice;
export default reducer;
