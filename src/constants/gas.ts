import { addHexPrefix } from 'ethereumjs-util';

const MIN_GAS_LIMIT_DEC = '21000';
const MIN_GAS_LIMIT_HEX = parseInt(MIN_GAS_LIMIT_DEC, 10).toString(16);

const ONE_HUNDRED_THOUSAND = 100000;

export const GAS_LIMITS = {
  // maximum gasLimit of a simple send
  SIMPLE: '0x5208', //addHexPrefix(MIN_GAS_LIMIT_HEX),
  // a base estimate for token transfers.
  BASE_TOKEN_ESTIMATE: '0x186a0', //addHexPrefix(ONE_HUNDRED_THOUSAND.toString(16)),
};

/**
 * These are already declared in @metamask/controllers but importing them from
 * that module and re-exporting causes the UI bundle size to expand beyond 4MB
 */
export enum GAS_ESTIMATE_TYPES {
  FEE_MARKET = 'fee-market',
  LEGACY = 'legacy',
  ETH_GASPRICE = 'eth_gasPrice',
  NONE = 'none',
}

/**
 * These represent gas recommendation levels presented in the UI
 */
export const GAS_RECOMMENDATIONS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

/**
 * These represent types of gas estimation
 */
// export const PRIORITY_LEVELS = {
//   LOW: 'low',
//   MEDIUM: 'medium',
//   HIGH: 'high',
//   CUSTOM: 'custom',
//   DAPP_SUGGESTED: 'dappSuggested',
// };

export enum PRIORITY_LEVELS {
  TEN_PERCENT_INCREASED = 'tenPercentIncreased',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CUSTOM = 'custom',
  DAPP_SUGGESTED = 'dappSuggested',
}

/**
 * Represents the user customizing their gas preference
 */
export const CUSTOM_GAS_ESTIMATE = 'custom';

/**
 * These represent the different edit modes presented in the UI
 */
export enum EDIT_GAS_MODES {
  SPEED_UP = 'speed-up',
  CANCEL = 'cancel',
  MODIFY_IN_PLACE = 'modify-in-place',
  SWAPS = 'swaps',
}

export enum GAS_FORM_ERRORS {
  GAS_LIMIT_OUT_OF_BOUNDS = 'editGasLimitOutOfBounds',
  MAX_PRIORITY_FEE_TOO_LOW = 'editGasMaxPriorityFeeLow',
  MAX_FEE_TOO_LOW = 'editGasMaxFeeLow',
  MAX_PRIORITY_FEE_BELOW_MINIMUM = 'editGasMaxPriorityFeeBelowMinimum',
  MAX_PRIORITY_FEE_HIGH_WARNING = 'editGasMaxPriorityFeeHigh',
  MAX_FEE_HIGH_WARNING = 'editGasMaxFeeHigh',
  MAX_FEE_IMBALANCE = 'editGasMaxFeeImbalance',
  GAS_PRICE_TOO_LOW = 'editGasPriceTooLow',
}

export const NETWORK_CONGESTION_THRESHOLDS = {
  NOT_BUSY: 0,
  STABLE: 0.33,
  BUSY: 0.66,
};

export function getGasFormErrorText(
  type: GAS_FORM_ERRORS,
  t: any,
  {
    minimumGasLimit = '',
  }: {
    minimumGasLimit?: string;
  }
) {
  switch (type) {
    case GAS_FORM_ERRORS.GAS_LIMIT_OUT_OF_BOUNDS:
      return t('editGasLimitOutOfBounds', {
        replace: { $1: minimumGasLimit },
      });
    case GAS_FORM_ERRORS.MAX_PRIORITY_FEE_TOO_LOW:
      return t('editGasMaxPriorityFeeLow');
    case GAS_FORM_ERRORS.MAX_FEE_TOO_LOW:
      return t('editGasMaxFeeLow');
    case GAS_FORM_ERRORS.MAX_PRIORITY_FEE_BELOW_MINIMUM:
      return t('editGasMaxPriorityFeeBelowMinimum');
    case GAS_FORM_ERRORS.MAX_PRIORITY_FEE_HIGH_WARNING:
      return t('editGasMaxPriorityFeeHigh');
    case GAS_FORM_ERRORS.MAX_FEE_HIGH_WARNING:
      return t('editGasMaxFeeHigh');
    case GAS_FORM_ERRORS.MAX_FEE_IMBALANCE:
      return t('editGasMaxFeePriorityImbalance');
    case GAS_FORM_ERRORS.GAS_PRICE_TOO_LOW:
      return t('editGasPriceTooLow');
    default:
      return '';
  }
}
