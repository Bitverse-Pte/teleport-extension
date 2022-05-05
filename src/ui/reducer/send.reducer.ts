import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { GAS_ESTIMATE_TYPES, GAS_LIMITS } from 'constants/gas';
import { CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP } from 'constants/network';
import { TransactionEnvelopeTypes } from 'constants/transaction';
import { addHexPrefix } from 'ethereumjs-util';
import { Token } from 'types/token';
import { MIN_GAS_LIMIT_HEX } from 'ui/context/send.constants';
import { addGasBuffer, generateTokenTransferData } from 'ui/context/send.utils';
import {
  isEIP1559Network,
  getCurrentChainId,
  getIsNonStandardEthChain,
} from 'ui/selectors/selectors';
import {
  estimateGas,
  fetchGasFeeEstimates,
  getTokenBalancesSync,
} from 'ui/state/actions';
import { multiplyCurrencies } from 'utils/conversion';
import { RootState } from '.';
import { hideLoadingIndicator, showLoadingIndicator } from './appState.reducer';
import { getCurrentBlockGasLimit } from './block.reducer';
import { getGasPriceInHexWei, getRoundedGasPrice } from './gas.reducer';

/**
 * The Stages that the send slice can be in
 * 1. INACTIVE - The send state is idle, and hasn't yet fetched required
 *  data for gasPrice and gasLimit estimations, etc.
 * 2. ADD_RECIPIENT - The user is selecting which address to send an asset to
 * 3. DRAFT - The send form is shown for a transaction yet to be sent to the
 *  Transaction Controller.
 * 4. EDIT - The send form is shown for a transaction already submitted to the
 *  Transaction Controller but not yet confirmed. This happens when a
 *  confirmation is shown for a transaction and the 'edit' button in the header
 *  is clicked.
 */
export const SEND_STAGES = {
  INACTIVE: 'INACTIVE',
  ADD_RECIPIENT: 'ADD_RECIPIENT',
  DRAFT: 'DRAFT',
  EDIT: 'EDIT',
};

/**
 * The status that the send slice can be in is either
 * 1. VALID - the transaction is valid and can be submitted
 * 2. INVALID - the transaction is invalid and cannot be submitted
 *
 * A number of cases would result in an invalid form
 * 1. The recipient is not yet defined
 * 2. The amount + gasTotal is greater than the user's balance when sending
 *  native currency
 * 3. The gasTotal is greater than the user's *native* balance
 * 4. The amount of sent asset is greater than the user's *asset* balance
 * 5. Gas price estimates failed to load entirely
 * 6. The gasLimit is less than 21000 (0x5208)
 */
export const SEND_STATUSES = {
  VALID: 'VALID',
  INVALID: 'INVALID',
};

/**
 * Controls what is displayed in the send-gas-row component.
 * 1. BASIC - Shows the basic estimate slow/avg/fast buttons when on mainnet
 *  and the metaswaps API request is successful.
 * 2. INLINE - Shows inline gasLimit/gasPrice fields when on any other network
 *  or metaswaps API fails and we use eth_gasPrice
 * 3. CUSTOM - Shows GasFeeDisplay component that is a read only display of the
 *  values the user has set in the advanced gas modal (stored in the gas duck
 *  under the customData key).
 */
export const GAS_INPUT_MODES = {
  BASIC: 'BASIC',
  INLINE: 'INLINE',
  CUSTOM: 'CUSTOM',
};

/**
 * The types of assets that a user can send
 * 1. NATIVE - The native asset for the current network, such as ETH
 * 2. TOKEN - An ERC20 token.
 */
export const ASSET_TYPES = {
  NATIVE: 'NATIVE',
  TOKEN: 'TOKEN',
};

/**
 * The modes that the amount field can be set by
 * 1. INPUT - the user provides the amount by typing in the field
 * 2. MAX - The user selects the MAX button and amount is calculated based on
 *  balance - (amount + gasTotal)
 */
export const AMOUNT_MODES = {
  INPUT: 'INPUT',
  MAX: 'MAX',
};

export const RECIPIENT_SEARCH_MODES = {
  MY_ACCOUNTS: 'MY_ACCOUNTS',
  CONTACT_LIST: 'CONTACT_LIST',
};

export const initialState = {
  // which stage of the send flow is the user on
  stage: SEND_STAGES.INACTIVE,
  // status of the send slice, either VALID or INVALID
  status: SEND_STATUSES.VALID,
  // Determines type of transaction being sent, defaulted to 0x0 (legacy)
  transactionType: TransactionEnvelopeTypes.LEGACY,
  // tracks whether the current network supports EIP 1559 transactions
  eip1559support: false,
  account: {
    // from account address, defaults to selected account. will be the account
    // the original transaction was sent from in the case of the EDIT stage
    address: null,
    // balance of the from account
    balance: '0x0',
  },
  gas: {
    // indicate whether the gas estimate is loading
    isGasEstimateLoading: true,
    // String token indentifying a listener for polling on the gasFeeController
    gasEstimatePollToken: null,
    // has the user set custom gas in the custom gas modal
    isCustomGasSet: false,
    // maximum gas needed for tx
    gasLimit: '0x0',
    // price in wei to pay per gas
    gasPrice: '0x0',
    // maximum price in wei to pay per gas
    maxFeePerGas: '0x0',
    // maximum priority fee in wei to pay per gas
    maxPriorityFeePerGas: '0x0',
    // expected price in wei necessary to pay per gas used for a transaction
    // to be included in a reasonable timeframe. Comes from GasFeeController.
    gasPriceEstimate: '0x0',
    // maximum total price in wei to pay
    gasTotal: '0x0',
    // minimum supported gasLimit
    minimumGasLimit: GAS_LIMITS.SIMPLE,
    // error to display for gas fields
    error: null,
  },
  amount: {
    // The mode to use when determining new amounts. For INPUT mode the
    // provided payload is always used. For MAX it is calculated based on avail
    // asset balance
    mode: AMOUNT_MODES.INPUT,
    // Current value of the transaction, how much of the asset are we sending
    value: '0x0',
    // error to display for amount field
    error: null,
  },
  asset: {
    id: null,
    // type can be either NATIVE such as ETH or TOKEN for ERC20 tokens
    type: ASSET_TYPES.NATIVE,
    // the balance the user holds at the from address for this asset
    balance: '0x0',
    // In the case of tokens, the address, decimals and symbol of the token
    // will be included in details
    details: null,
  },
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
      type: TransactionEnvelopeTypes.LEGACY,
    },
  },
  recipient: {
    // Defines which mode to use for searching for matches in the input field
    mode: RECIPIENT_SEARCH_MODES.CONTACT_LIST,
    // Partial, not yet validated, entry into the address field. Used to share
    // user input amongst the AddRecipient and EnsInput components.
    userInput: '',
    // The address of the recipient
    address: '',
    // The nickname stored in the user's address book for the recipient address
    nickname: '',
    // Error to display on the address field
    error: null,
    // Warning to display on the address field
    warning: null,
  },
};

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
  const paramsForGasEstimate = {
    from: selectedAddress,
    to,
    value,
    gas: '0x0',
    gasPrice,
    data,
  };

  if (sendToken && !sendToken.isNative) {
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
    paramsForGasEstimate.data = generateTokenTransferData({
      toAddress: to,
      amount: value,
    });

    paramsForGasEstimate.to = sendToken.contractAddress?.toLowerCase();
  } else {
    if (!data) {
      // eth.getCode will return the compiled smart contract code at the
      // address. If this returns 0x, 0x0 or a nullish value then the address
      // is an externally owned account (NOT a contract account). For these
      // types of transactions the gasLimit will always be 21,000 or 0x5208
      // const { isContractAddress } = to
      //   ? await readAddressAsContract(global.eth, to)
      //   : { isContractAddress: undefined };
      // TODO: need to get isContractAddress
      const isContractAddress = false;
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
      })
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
      bufferMultiplier
    );
    return addHexPrefix(estimateWithBuffer);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// After modification of specific fields in specific circumstances we must
// recompute the gasLimit estimate to be as accurate as possible. the cases
// that necessitate this logic are listed below:
// 1. when the amount sent changes when sending a token due to the amount being
//    part of the hex encoded data property of the transaction.
// 2. when updating the data property while sending NATIVE currency (ex: ETH)
//    because the data parameter defines function calls that the EVM will have
//    to execute which is where a large chunk of gas is potentially consumed.
// 3. when the recipient changes while sending a token due to the recipient's
//    address being included in the hex encoded data property of the
//    transaction
// 4. when the asset being sent changes due to the contract address and details
//    of the token being included in the hex encoded data property of the
//    transaction. If switching to NATIVE currency (ex: ETH), the gasLimit will
//    change due to hex data being removed (unless supplied by user).
// This method computes the gasLimit estimate which is written to state in an
// action handler in extraReducers.
export const computeEstimatedGasLimit = createAsyncThunk(
  'send/computeEstimatedGasLimit',
  async (_, thunkApi) => {
    const state: RootState = thunkApi.getState() as RootState;
    const { send, preference } = state;
    //const isMultiLayerFeeNetwork = getIsMultiLayerFeeNetwork(state);
    const isNonStandardEthChain = getIsNonStandardEthChain(state);
    const chainId = getCurrentChainId(state);

    let layer1GasTotal;
    /** 
     * here to calc optimism
    if (isMultiLayerFeeNetwork) {
      layer1GasTotal = await fetchEstimatedL1Fee(global.eth, {
        txParams: {
          gasPrice: send.gas.gasPrice,
          gas: send.gas.gasLimit,
          to: send.recipient.address?.toLowerCase(),
          value:
            send.amount.mode === 'MAX'
              ? send.account.balance
              : send.amount.value,
          from: send.account.address,
          data: send.draftTransaction.userInputHexData,
          type: '0x0',
        },
      });
    }
    */

    const gasLimit = await estimateGasLimitForSend({
      gasPrice: send.gas.gasPrice,
      blockGasLimit: getCurrentBlockGasLimit(state),
      selectedAddress: preference.currentAccount?.address,
      sendToken: send.asset.details,
      to: send.recipient.address?.toLowerCase(),
      value: send.amount.value,
      data: send.draftTransaction.userInputHexData,
      isNonStandardEthChain,
      chainId,
      gasLimit: send.gas.gasLimit,
    });
    //await thunkApi.dispatch(setCustomGasLimit(gasLimit));
    console.log('============[gasLimit]==============', gasLimit);
    return {
      gasLimit,
      layer1GasTotal,
    };
  }
);

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
export const initializeSendState = createAsyncThunk<any, any>(
  'send/initializeSendState',
  async (_, thunkApi) => {
    const { assetId } = _;
    const state: RootState = thunkApi.getState() as RootState;
    const eip1559support = isEIP1559Network(state);
    console.log('===========[eip1559support]=============', eip1559support);

    let gasPrice = '0x1';
    /**
     * Show loading indicator to block the page
     * avoid user to click next without gas estimation
     */
    thunkApi.dispatch(showLoadingIndicator());
    const balances = await getTokenBalancesSync();
    const selectedAsset: Token =
      assetId && balances.find((t: Token) => assetId === t.tokenId);
    const { gasEstimateType, gasFeeEstimates } = await fetchGasFeeEstimates();
    console.log('===========[gasEstimateType]=============', gasEstimateType);
    console.log('===========[gasFeeEstimates]=============', gasFeeEstimates);
    if (gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY) {
      gasPrice = getGasPriceInHexWei(gasFeeEstimates.medium);
    } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
      gasPrice = getRoundedGasPrice(gasFeeEstimates.gasPrice);
    } else if (gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET) {
      gasPrice = getGasPriceInHexWei(
        gasFeeEstimates.medium.suggestedMaxFeePerGas
      );
    } else {
      gasPrice = gasFeeEstimates.gasPrice
        ? getRoundedGasPrice(gasFeeEstimates.gasPrice)
        : '0x0';
    }
    // Set a basic gasLimit in the event that other estimation fails
    const gasLimit = selectedAsset.isNative
      ? GAS_LIMITS.SIMPLE
      : GAS_LIMITS.BASE_TOKEN_ESTIMATE;
    thunkApi.dispatch(hideLoadingIndicator());
    return {
      address: null,
      selectedAsset,
      chainId: getCurrentChainId(state),
      gasLimit,
      gasPrice,
      eip1559support,
    };
  }
);

export const sendSlice = createSlice<
  any,
  {
    updateDraftTransaction: (state: any) => void;
    resetSendState: () => any;
    updateGasLimit: (state: any, action: any) => void;
    updateAsset: (state: any, action: any) => void;
    updateSendAmount: (state: any, action: any) => void;
    updateRecipient: (state: any, action: any) => void;
  }
>({
  name: 'send',
  initialState: initialState,
  reducers: {
    updateDraftTransaction: (state) => {
      // gasLimit always needs to be set regardless of the asset being sent
      // or the type of transaction.
      state.draftTransaction.txParams.gas = state.gas.gasLimit;
      // We need to make sure that we only include the right gas fee fields
      // based on the type of transaction the network supports. We will also set
      // the type param here. We must delete the opposite fields to avoid
      // stale data in txParams.
      if (state.eip1559support) {
        state.draftTransaction.txParams.type =
          TransactionEnvelopeTypes.FEE_MARKET;

        (state.draftTransaction.txParams as any).maxFeePerGas =
          state.gas.maxFeePerGas;
        state.draftTransaction.txParams.maxPriorityFeePerGas =
          state.gas.maxPriorityFeePerGas;

        if (
          !state.draftTransaction.txParams.maxFeePerGas ||
          state.draftTransaction.txParams.maxFeePerGas === '0x0'
        ) {
          state.draftTransaction.txParams.maxFeePerGas = state.gas.gasPrice;
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
    updateGasLimit: (state, action) => {
      state.gas.gasLimit = addHexPrefix(action.payload);
    },
    updateAsset: (state, action) => {
      state.asset.id = action.payload.tokenId;
      state.asset.type = action.payload.isNative
        ? ASSET_TYPES.NATIVE
        : ASSET_TYPES.TOKEN;
      state.asset.balance = action.payload.amount;
      state.asset.details = action.payload;
    },
    updateSendAmount: (state, action) => {
      state.amount.value = addHexPrefix(action.payload);
    },
    updateRecipient: (state, action) => {
      state.recipient.address = action.payload.address ?? '';
      state.recipient.nickname = action.payload.nickname ?? '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeSendState.fulfilled, (state, action) => {
        state.eip1559support = action.payload.eip1559support;
        state.gas.gasLimit = action.payload.gasLimit;
        state.gas.gasPrice = action.payload.gasPrice;
        sendSlice.caseReducers.updateAsset(state, {
          payload: action.payload.selectedAsset,
        });
        sendSlice.caseReducers.updateDraftTransaction(state);
      })
      .addCase(computeEstimatedGasLimit.fulfilled, (state, action) => {
        state.gas.isGasEstimateLoading = false;
        if (action.payload?.gasLimit) {
          sendSlice.caseReducers.updateGasLimit(state, {
            payload: action.payload.gasLimit,
          });
        }
        sendSlice.caseReducers.updateDraftTransaction(state);
      })
      .addCase(computeEstimatedGasLimit.pending, (state) => {
        // When we begin to fetch gasLimit we should indicate we are loading
        // a gas estimate.
        state.gas.isGasEstimateLoading = true;
      })
      .addCase(computeEstimatedGasLimit.rejected, (state) => {
        // If gas estimation fails, we should set the loading state to false,
        // because it is no longer loading
        state.gas.isGasEstimateLoading = false;
      });
  },
});

export function resetSendState() {
  return async (dispatch) => {
    dispatch(actions.resetSendState());
  };
}

export function updateSendAsset(asset: Token) {
  return async (dispatch) => {
    await dispatch(actions.updateAsset(asset));
    await dispatch(computeEstimatedGasLimit());
  };
}

export function updateSendAmount(amount) {
  return async (dispatch) => {
    await dispatch(actions.updateSendAmount(amount));
    await dispatch(computeEstimatedGasLimit());
  };
}

export function updateRecipient({ address, nickname }) {
  return async (dispatch) => {
    await dispatch(
      actions.updateRecipient({
        address,
        nickname: nickname,
      })
    );
    await dispatch(computeEstimatedGasLimit());
  };
}

const { actions, reducer } = sendSlice;
export default reducer;
