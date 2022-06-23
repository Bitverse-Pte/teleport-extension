export enum ErrorCode {
  DEFAULT = 0,
  WRONG_PSD = 10001,
  WALLET_NAME_REPEAT,
  ADDRESS_REPEAT,
  INVALID_PSD,
  HD_INDEX_REPEAT,
  INVALID_NAME,
  // network provider related errors
  WRONG_CHAIN_ID,
  CUSTOM_PROVIDER_RPC_INVALID,
  DEFAULT_NETWORK_PROVIDER_PRESET_MISSING,
  CUSTOM_NETWORK_PROVIDER_MISSING,
  CUSTOM_NETWORK_NAME_DUPLICATED,
  CUSTOM_ERC20_TOKEN_DUPLICATED,
  NOT_EXISTED_CHAIN_TO_SWITCH,
  CUSTOM_NETWORK_NAME_TOO_LONG,
  INVALID_MNEMONIC,
  INVALID_PRIVATE_KEY,
  INVALID_CONTRACT_ADDRESS,
  CUSTOM_TOKEN_MISSING,
  ACCOUNT_DOES_NOT_EXIST,
  WALLET_WAS_LOCKED,
  NORMAL_WALLET_SWITCH_EVM_ONLY,
}
