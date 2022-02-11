import { TransactionEnvelopeTypes as TRANSACTION_ENVELOPE_TYPES } from 'constants/transaction';
import { GAS_LIMITS } from 'constants/gas';
import { CoinType, Network, NetworkController, Provider } from 'types/network';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useInterval } from 'react-use';
import abi from 'human-standard-token-abi';
import {
  CONTRACT_ADDRESS_ERROR,
  INSUFFICIENT_FUNDS_ERROR,
  INSUFFICIENT_TOKENS_ERROR,
  INVALID_RECIPIENT_ADDRESS_ERROR,
  INVALID_RECIPIENT_ADDRESS_NOT_ETH_NETWORK_ERROR,
  KNOWN_RECIPIENT_ADDRESS_WARNING,
  MIN_GAS_LIMIT_HEX,
  NEGATIVE_ETH_ERROR,
} from './send.constants';
import {
  addGasBuffer,
  calcGasTotal,
  generateTokenTransferData,
  isBalanceSufficient,
  isTokenBalanceSufficient,
} from './send.utils';
import { addHexPrefix } from 'ethereumjs-util';
import {
  conversionGreaterThan,
  conversionUtil,
  multiplyCurrencies,
  subtractCurrencies,
} from 'ui/utils/conversion';
import { CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP } from 'constants/network';
import { useWallet } from '../utils';

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
  transactionType: TRANSACTION_ENVELOPE_TYPES.LEGACY,
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
      type: TRANSACTION_ENVELOPE_TYPES.LEGACY,
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

export const SendContext = React.createContext<null>(null);
/*
export function SendStoreProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const [initState, setInitState] = useState(initialState)
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
  
    let blockGasLimit = MIN_GAS_LIMIT_HEX;
    if (options.blockGasLimit) {
      blockGasLimit = options.blockGasLimit;
    } else if (sendToken) {
      blockGasLimit = GAS_LIMITS.BASE_TOKEN_ESTIMATE;
    }
  
    const paramsForGasEstimate: any = { from: selectedAddress, value, gasPrice };
  
    if (sendToken) {
      if (!to) {
        return GAS_LIMITS.BASE_TOKEN_ESTIMATE;
      }
      paramsForGasEstimate.value = '0x0';
      paramsForGasEstimate.data = generateTokenTransferData({
        toAddress: to,
        amount: value,
        sendToken,
      });
      paramsForGasEstimate.to = sendToken.address;
    } else {
      if (!data) {
        const { isContractAddress }: any = to
          ? await wallet.readAddressAsContract(to)
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
        paramsForGasEstimate.value = '0xff';
      }
    }
  
    if (!isSimpleSendOnNonStandardNetwork) {
      paramsForGasEstimate.gas = addHexPrefix(
        multiplyCurrencies(blockGasLimit, 0.95, {
          multiplicandBase: 16,
          multiplierBase: 10,
          roundDown: '0',
          toNumericBase: 'hex',
        }),
      );
    }
  
    let bufferMultiplier = 1.5;
    if (isSimpleSendOnNonStandardNetwork) {
      bufferMultiplier = 1;
    } else if (CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP[chainId]) {
      bufferMultiplier = CHAIN_ID_TO_GAS_LIMIT_BUFFER_MAP[chainId];
    }
  
    try {
      const estimatedGasLimit = await wallet.estimateGas(paramsForGasEstimate);
      const estimateWithBuffer = addGasBuffer(
        estimatedGasLimit,
        blockGasLimit,
        bufferMultiplier,
      );
      return addHexPrefix(estimateWithBuffer);
    } catch (error: any) {
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
  const computeEstimatedGasLimit = async () => {
    const state: any = initState;
    const { send, metamask } = state;
    const isNonStandardEthChain = getIsNonStandardEthChain(state);
    const chainId = getCurrentChainId(state);
    if (send.stage !== SEND_STAGES.EDIT) {
      const gasLimit = await estimateGasLimitForSend({
        gasPrice: send.gas.gasPrice,
        blockGasLimit: metamask.currentBlockGasLimit,
        selectedAddress: metamask.selectedAddress,
        sendToken: send.asset.details,
        to: send.recipient.address?.toLowerCase(),
        value: send.amount.value,
        data: send.draftTransaction.userInputHexData,
        isNonStandardEthChain,
        chainId,
      });
      await thunkApi.dispatch(setCustomGasLimit(gasLimit));
      return {
        gasLimit,
      };
    }
    return null;
  }

  async function initializeSendState() {
    const state: any = initState;
    const isNonStandardEthChain = getIsNonStandardEthChain(state);
    const chainId = getCurrentChainId(state);
    const eip1559support = checkNetworkAndAccountSupports1559(state);
    const {
      send: { asset, stage, recipient, amount, draftTransaction },
      metamask,
    } = state;
    // First determine the correct from address. For new sends this is always
    // the currently selected account and switching accounts switches the from
    // address. If editing an existing transaction (by clicking 'edit' on the
    // send page), the fromAddress is always the address from the txParams.
    const fromAddress =
      stage === SEND_STAGES.EDIT
        ? draftTransaction.txParams.from
        : metamask.selectedAddress;
    // We need the account's balance which is calculated from cachedBalances in
    // the getMetaMaskAccounts selector. getTargetAccount consumes this
    // selector and returns the account at the specified address.
    const account = getTargetAccount(state, fromAddress);

    // Default gasPrice to 1 gwei if all estimation fails, this is only used
    // for gasLimit estimation and won't be set directly in state. Instead, we
    // will return the gasFeeEstimates and gasEstimateType so that the reducer
    // can set the appropriate gas fees in state.
    let gasPrice = '0x1';
    let gasEstimatePollToken = null;

    // Instruct the background process that polling for gas prices should begin
    gasEstimatePollToken = await wallet.getGasFeeEstimatesAndStartPolling();

    addPollingTokenToAppState(gasEstimatePollToken);

    const {
      metamask: { gasFeeEstimates, gasEstimateType },
    } = thunkApi.getState();

    // Because we are only interested in getting a gasLimit estimation we only
    // need to worry about gasPrice. So we use maxFeePerGas as gasPrice if we
    // have a fee market estimation.
    if (gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY) {
      gasPrice = getGasPriceInHexWei(gasFeeEstimates.medium);
    } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
      gasPrice = getRoundedGasPrice(gasFeeEstimates.gasPrice);
    } else if (gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET) {
      gasPrice = getGasPriceInHexWei(
        gasFeeEstimates.medium.suggestedMaxFeePerGas,
      );
    } else {
      gasPrice = gasFeeEstimates.gasPrice
        ? getRoundedGasPrice(gasFeeEstimates.gasPrice)
        : '0x0';
    }

    // Set a basic gasLimit in the event that other estimation fails
    let gasLimit =
      asset.type === ASSET_TYPES.TOKEN
        ? GAS_LIMITS.BASE_TOKEN_ESTIMATE
        : GAS_LIMITS.SIMPLE;
    if (
      gasEstimateType !== GAS_ESTIMATE_TYPES.NONE &&
      stage !== SEND_STAGES.EDIT &&
      recipient.address
    ) {
      // Run our estimateGasLimit logic to get a more accurate estimation of
      // required gas. If this value isn't nullish, set it as the new gasLimit
      const estimatedGasLimit = await estimateGasLimitForSend({
        gasPrice,
        blockGasLimit: metamask.currentBlockGasLimit,
        selectedAddress: fromAddress,
        sendToken: asset.details,
        to: recipient.address.toLowerCase(),
        value: amount.value,
        data: draftTransaction.userInputHexData,
        isNonStandardEthChain,
        chainId,
      });
      gasLimit = estimatedGasLimit || gasLimit;
    }
    // We have to keep the gas slice in sync with the draft send transaction
    // so that it'll be initialized correctly if the gas modal is opened.
    await thunkApi.dispatch(setCustomGasLimit(gasLimit));
    // We must determine the balance of the asset that the transaction will be
    // sending. This is done by referencing the native balance on the account
    // for native assets, and calling the balanceOf method on the ERC20
    // contract for token sends.
    let { balance } = account;
    if (asset.type === ASSET_TYPES.TOKEN) {
      if (asset.details === null) {
        // If we're sending a token but details have not been provided we must
        // abort and set the send slice into invalid status.
        throw new Error(
          'Send slice initialized as token send without token details',
        );
      }
      balance = await getERC20Balance(asset.details, fromAddress);
    }
    return {
      address: fromAddress,
      nativeBalance: account.balance,
      assetBalance: balance,
      chainId: getCurrentChainId(state),
      tokens: getTokens(state),
      gasFeeEstimates,
      gasEstimateType,
      gasLimit,
      gasTotal: addHexPrefix(calcGasTotal(gasLimit, gasPrice)),
      gasEstimatePollToken,
      eip1559support,
      useTokenDetection: getUseTokenDetection(state),
      tokenAddressList: Object.keys(getTokenList(state)),
    };
  }
  return <SendContext.Provider value={null}>{children}</SendContext.Provider>
}
*/
