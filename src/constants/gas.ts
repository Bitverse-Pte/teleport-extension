import { addHexPrefix } from 'ethereumjs-util';

const MIN_GAS_LIMIT_DEC = '21000';
const MIN_GAS_LIMIT_HEX = parseInt(MIN_GAS_LIMIT_DEC, 10).toString(16);

const ONE_HUNDRED_THOUSAND = 100000;

export const GAS_LIMITS = {
  // maximum gasLimit of a simple send
  SIMPLE: addHexPrefix(MIN_GAS_LIMIT_HEX),
  // a base estimate for token transfers.
  BASE_TOKEN_ESTIMATE: addHexPrefix(ONE_HUNDRED_THOUSAND.toString(16)),
};

/**
 * These are already declared in @metamask/controllers but importing them from
 * that module and re-exporting causes the UI bundle size to expand beyond 4MB
 */
export const GAS_ESTIMATE_TYPES = {
  FEE_MARKET: 'fee-market',
  LEGACY: 'legacy',
  ETH_GASPRICE: 'eth_gasPrice',
  NONE: 'none',
};

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
export const EDIT_GAS_MODES = {
  SPEED_UP: 'speed-up',
  CANCEL: 'cancel',
  MODIFY_IN_PLACE: 'modify-in-place',
  SWAPS: 'swaps',
};
