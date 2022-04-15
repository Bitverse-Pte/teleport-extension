import { ETH, GWEI } from 'constants/transaction';
import { addHexPrefix } from 'ethereumjs-util';
import { cloneDeep } from 'lodash';
import { conversionUtil } from 'utils/conversion';

export const RESET_CUSTOM_DATA = 'gas/RESET_CUSTOM_DATA';
export const SET_CUSTOM_DATA = 'gas/SET_CUSTOM_DATA';
export const SET_CUSTOM_GAS_LIMIT = 'gas/SET_CUSTOM_GAS_LIMIT';
export const SET_CUSTOM_GAS_PRICE = 'gas/SET_CUSTOM_GAS_PRICE';
export const SET_GAS_TYPE = 'gas/SET_GAS_TYPE';
export const RESET_GAS_TYPE = 'gas/SET_GAS_TYPE';
export const SET_CUSTOM_TYPE = 'gas/SET_CUSTOM_TYPE';
export const SET_LEGACY_GAS = 'gas/SET_LEGACY_GAS';

const initState = {
  customType: false,
  customData: {
    gasLimit: 21000,
    suggestedMaxPriorityFeePerGas: null,
    suggestedMaxFeePerGas: null,
  },
  gasType: 'medium',
  legacyGas: {
    gasPrice: 0,
    gasLimit: 21000,
  },
};

// Reducer
export default function reducer(state = initState, action) {
  switch (action.type) {
    case SET_CUSTOM_GAS_PRICE:
      return {
        ...state,
        customData: {
          ...state.customData,
          price: action.value,
        },
      };
    case SET_CUSTOM_GAS_LIMIT:
      return {
        ...state,
        customData: {
          ...state.customData,
          limit: action.value,
        },
      };
    case SET_CUSTOM_TYPE:
      return {
        ...state,
        customType: action.value,
      };
    case SET_CUSTOM_DATA:
      return {
        ...state,
        customData: action.value,
      };
    case RESET_CUSTOM_DATA:
      return {
        ...state,
        customData: cloneDeep(initState.customData),
      };
    case SET_GAS_TYPE:
      return {
        ...state,
        gasType: action.value,
      };
    case RESET_GAS_TYPE:
      return {
        ...state,
        gasType: null,
      };
    case SET_LEGACY_GAS:
      return {
        ...state,
        legacyGas: action.value,
      };
    default:
      return state;
  }
}

/**
 * This method is used to keep the original logic from the gas.duck.js file
 * after receiving a gasPrice from eth_gasPrice. First, the returned gasPrice
 * was converted to GWEI, then it was converted to a Number, then in the send
 * duck (here) we would use getGasPriceInHexWei to get back to hexWei. Now that
 * we receive a GWEI estimate from the controller, we still need to do this
 * weird conversion to get the proper rounding.
 *
 * @param {T} gasPriceEstimate
 * @returns
 */
export function getRoundedGasPrice(gasPriceEstimate) {
  const gasPriceInDecGwei = conversionUtil(gasPriceEstimate, {
    numberOfDecimals: 9,
    toDenomination: GWEI,
    fromNumericBase: 'dec',
    toNumericBase: 'dec',
    fromCurrency: ETH,
    fromDenomination: GWEI,
  });
  const gasPriceAsNumber = Number(gasPriceInDecGwei);
  return getGasPriceInHexWei(gasPriceAsNumber);
}

export function getGasPriceInHexWei(price) {
  const value = conversionUtil(price, {
    fromNumericBase: 'dec',
    toNumericBase: 'hex',
  });
  return addHexPrefix(priceEstimateToWei(value));
}

export function priceEstimateToWei(priceEstimate) {
  return conversionUtil(priceEstimate, {
    fromNumericBase: 'hex',
    toNumericBase: 'hex',
    fromDenomination: 'GWEI',
    toDenomination: 'WEI',
    numberOfDecimals: 9,
  });
}
