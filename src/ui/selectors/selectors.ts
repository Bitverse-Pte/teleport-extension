import { createSelector } from 'reselect';
import Eth from 'ethjs';
// import { addHexPrefix } from '../../app/scripts/lib/util';
// import {
//   MAINNET_CHAIN_ID,
//   TEST_CHAINS,
//   NETWORK_TYPE_RPC,
//   NATIVE_CURRENCY_TOKEN_IMAGE_MAP,
//   OPTIMISM_CHAIN_ID,
//   OPTIMISM_TESTNET_CHAIN_ID,
// } from '../../shared/constants/network';
// import {
//   KEYRING_TYPES,
//   WEBHID_CONNECTED_STATUSES,
//   LEDGER_TRANSPORT_TYPES,
//   TRANSPORT_STATES,
// } from '../../shared/constants/hardware-wallets';

// import {
//   SWAPS_CHAINID_DEFAULT_TOKEN_MAP,
//   ALLOWED_SWAPS_CHAIN_IDS,
// } from '../../shared/constants/swaps';

// import { TRUNCATED_NAME_CHAR_LIMIT } from '../../shared/constants/labels';

// import {
//   shortenAddress,
//   getAccountByAddress,
//   isEqualCaseInsensitive,
// } from '../helpers/utils/util';
// import {
//   getValueFromWeiHex,
//   hexToDecimal,
// } from '../helpers/utils/conversions.util';

// import { TEMPLATED_CONFIRMATION_MESSAGE_TYPES } from '../pages/confirmation/templates';

// import { toChecksumHexAddress } from '../../shared/modules/hexstring-utils';
// import { DAY } from '../../shared/constants/time';
// import {
//   getConversionRate,
//   isNotEIP1559Network,
//   isEIP1559Network,
//   getLedgerTransportType,
//   isAddressLedger,
//   findKeyringForAddress,
// } from '../ducks/metamask/metamask';
// import {
//   getLedgerWebHidConnectedStatus,
//   getLedgerTransportStatus,
// } from '../ducks/app/app';
// import { MESSAGE_TYPE } from '../../shared/constants/app';
import {
  MAINNET_CHAIN_ID,
  NATIVE_CURRENCY_TOKEN_IMAGE_MAP,
  NETWORK_TYPE_RPC,
  OPTIMISM_CHAIN_ID,
  OPTIMISM_TESTNET_CHAIN_ID,
  TEST_CHAINS,
} from 'constants/network';
import { RootState } from '../reducer';
import { addHexPrefix } from 'ethereumjs-util';
import { MESSAGE_TYPE } from 'constants/app';
import {
  EthDenomination,
  getValueFromWeiHex,
  hexToDecimal,
} from '../utils/conversion';
import { toChecksumHexAddress } from '../utils';
import { GAS_ESTIMATE_TYPES } from 'constants/gas';

/**
 * One of the only remaining valid uses of selecting the network subkey of the
 * metamask state tree is to determine if the network is currently 'loading'.
 *
 * This will be used for all cases where this state key is accessed only for that
 * purpose.
 * @param state - redux state object
 */
export function isNetworkLoading(state: RootState) {
  return state.network.network === 'loading';
}

export function getNetworkIdentifier(state: RootState) {
  const {
    network: {
      provider: { type, nickname, rpcUrl },
    },
  } = state;

  return nickname || rpcUrl || type;
}

export function getMetricsNetworkIdentifier(state: RootState) {
  const { provider } = state.network;
  return provider.type === NETWORK_TYPE_RPC ? provider.rpcUrl : provider.type;
}

export function getCurrentChainId(state: RootState) {
  const { chainId } = state.network.provider;
  return chainId;
}

export function getCurrentQRHardwareState(state: RootState) {
  // const { qrHardware } = state.network;
  return {};
}

// export function hasUnsignedQRHardwareTransaction(state: RootState) {
//   const { txParams } = state.confirmTransaction.txData;
//   if (!txParams) return false;
//   const { from } = txParams;
//   const { keyrings } = state.network;
//   const qrKeyring = keyrings.find((kr) => kr.type === KEYRING_TYPES.QR);
//   if (!qrKeyring) return false;
//   return Boolean(
//     qrKeyring.accounts.find(
//       (account) => account.toLowerCase() === from.toLowerCase(),
//     ),
//   );
// }

// export function hasUnsignedQRHardwareMessage(state: RootState) {
//   const { type, msgParams } = state.confirmTransaction.txData;
//   if (!type || !msgParams) {
//     return false;
//   }
//   const { from } = msgParams;
//   const { keyrings } = state.network;
//   const qrKeyring = keyrings.find((kr) => kr.type === KEYRING_TYPES.QR);
//   if (!qrKeyring) return false;
//   switch (type) {
//     case MESSAGE_TYPE.ETH_SIGN_TYPED_DATA:
//     case MESSAGE_TYPE.ETH_SIGN:
//     case MESSAGE_TYPE.PERSONAL_SIGN:
//       return Boolean(
//         qrKeyring.accounts.find(
//           (account) => account.toLowerCase() === from.toLowerCase(),
//         ),
//       );
//     default:
//       return false;
//   }
// }

// export function getCurrentKeyring(state: RootState) {
//   const identity = getSelectedIdentity(state);

//   if (!identity) {
//     return null;
//   }

//   const keyring = findKeyringForAddress(state, identity.address);

//   return keyring;
// }

export function getParticipateInMetaMetrics(state: RootState) {
  // return Boolean(state.network.participateInMetaMetrics);
  return false;
}

/**
 * from `ui/ducks/metamask/metamask.js`
 */
export function isEIP1559Network(state: RootState) {
  return state.network.networkDetails?.EIPS['1559'] === true;
}

export function isNotEIP1559Network(state: RootState) {
  return state.network.networkDetails?.EIPS['1559'] === false;
}

export function isEIP1559Account(state: RootState) {
  return true;
}

export function getGasEstimateType(state: RootState) {
  return state.currentBlock.gasEstimateType;
}

export function getGasFeeEstimates(state: RootState) {
  return state.currentBlock.gasFeeEstimates;
}

export function getIsGasEstimatesLoading(state: RootState) {
  const networkAndAccountSupports1559 =
    checkNetworkAndAccountSupports1559(state);
  const gasEstimateType = getGasEstimateType(state);

  // We consider the gas estimate to be loading if the gasEstimateType is
  // 'NONE' or if the current gasEstimateType cannot be supported by the current
  // network
  const isEIP1559TolerableEstimateType =
    gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET ||
    gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE;
  const isGasEstimatesLoading =
    gasEstimateType === GAS_ESTIMATE_TYPES.NONE ||
    (networkAndAccountSupports1559 && !isEIP1559TolerableEstimateType) ||
    (!networkAndAccountSupports1559 &&
      gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET);

  return isGasEstimatesLoading;
}

/**
 * The function returns true if network and account details are fetched and
 * both of them support EIP-1559.
 */
export function checkNetworkAndAccountSupports1559(state: RootState) {
  const networkSupports1559 = isEIP1559Network(state);
  const accountSupports1559 = isEIP1559Account(state);

  return networkSupports1559 && accountSupports1559;
}

/**
 * The function returns true if network and account details are fetched and
 * either of them do not support EIP-1559.
 */
export function checkNetworkOrAccountNotSupports1559(state: RootState) {
  const networkNotSupports1559 = isNotEIP1559Network(state);
  const accountSupports1559 = isEIP1559Account(state);

  return networkNotSupports1559 || accountSupports1559 === false;
}

/**
 * Checks if the current wallet is a hardware wallet.
 * @param state
 * @returns {Boolean}
 */
// export function isHardwareWallet(state: RootState) {
//   const keyring = getCurrentKeyring(state);
//   return Boolean(keyring?.type?.includes('Hardware'));
// }

/**
 * Get a HW wallet type, e.g. "Ledger Hardware"
 * @param state
 * @returns {String|undefined}
 */
// export function getHardwareWalletType(state: RootState) {
//   const keyring = getCurrentKeyring(state);
//   return isHardwareWallet(state) ? keyring.type : undefined;
// }

export function getAccountType(state: RootState) {
  // const currentKeyring = getCurrentKeyring(state);
  // const type = currentKeyring && currentKeyring.type;
  // @todo: remove this later
  const type = 'Simple Key Pair';
  switch (type) {
    // case KEYRING_TYPES.TREZOR:
    // case KEYRING_TYPES.LEDGER:
    // case KEYRING_TYPES.LATTICE:
    //   return 'hardware';
    case 'Simple Key Pair':
      return 'imported';
    default:
      return 'default';
  }
}

/**
 * get the currently selected networkId which will be 'loading' when the
 * network changes. The network id should not be used in most cases,
 * instead use chainId in most situations. There are a limited number of
 * use cases to use this method still, such as when comparing transaction
 * metadata that predates the switch to using chainId.
 * @deprecated - use getCurrentChainId instead
 * @param state - redux state object
 */
export function deprecatedGetCurrentNetworkId(state: RootState) {
  return state.network.network;
}

// export const getWalletAccounts = createSelector(
//   getWalletAccountsRaw,
//   getTeleportWalletCachedBalances,
//   (currentAccounts, cachedBalances) =>
//     Object.entries(currentAccounts).reduce(
//       (selectedAccounts, [accountID, account]) => {
//         if (account.balance === null || account.balance === undefined) {
//           return {
//             ...selectedAccounts,
//             [accountID]: {
//               ...account,
//               balance: cachedBalances && cachedBalances[accountID],
//             },
//           };
//         }
//         return {
//           ...selectedAccounts,
//           [accountID]: account,
//         };
//       },
//       {},
//     ),
// );

// export function getSelectedIdentity(state: RootState) {
//   const selectedAddress = getSelectedAddress(state);
//   const { identities } = state.network;

//   return identities[selectedAddress];
// }

// export function getNumberOfAccounts(state: RootState) {
//   return Object.keys(state.network.accounts).length;
// }

// export function getNumberOfTokens(state: RootState) {
//   const { tokens } = state.network;
//   return tokens ? tokens.length : 0;
// }

// export function getTeleportWalletKeyrings(state: RootState) {
//   return state.network.keyrings;
// }

// export function getTeleportWalletIdentities(state: RootState) {
//   return state.network.identities;
// }

export const getCurrentSelectedAccount = (state: RootState) =>
  state.preference.currentAccount;
export const getSelectedAddress = (state: RootState) =>
  state.preference.currentAccount?.address;

// export function getWalletAccountsRaw(state: RootState) {
//   return state.network.accounts;
// }

export const getCurrentProviderNativeToken = (s: RootState) => {
  const currentProviderId = s.network.provider.id;
  return s.tokens.tokens.find(
    (t) => t.isNative && t.chainCustomId === currentProviderId
  );
};

export const getBalanceMapOfToken = (
  s: RootState,
  providerId: string,
  account: string
) => {
  return s.tokens.balances![account].find(
    (t) => t.isNative && t.chainCustomId === providerId
  );
};

export function getTeleportWalletCachedBalances(state: RootState) {
  const token = getCurrentProviderNativeToken(state);
  const currentAddress = getSelectedAddress(state);
  const tokenWithBalance = getBalanceMapOfToken(
    state,
    token?.chainCustomId as string,
    currentAddress as string
  );
  return tokenWithBalance?.amount;
}

// /**
//  * Get ordered (by keyrings) accounts with identity and balance
//  */
// export const getWalletAccountsOrdered = createSelector(
//   getTeleportWalletKeyrings,
//   getTeleportWalletIdentities,
//   getWalletAccounts,
//   (keyrings, identities, accounts) =>
//     keyrings
//       .reduce((list, keyring) => list.concat(keyring.accounts), [])
//       .filter((address) => Boolean(identities[address]))
//       .map((address) => ({ ...identities[address], ...accounts[address] })),
// );

// export const getWalletAccountsConnected = createSelector(
//   getWalletAccountsOrdered,
//   (connectedAccounts) =>
//     connectedAccounts.map(({ address }) => address.toLowerCase()),
// );

// export function isBalanceCached(state: RootState) {
//   const selectedAccountBalance =
//     state.network.accounts[getSelectedAddress(state)].balance;
//   const cachedBalance = getSelectedAccountCachedBalance(state);

//   return Boolean(!selectedAccountBalance && cachedBalance);
// }

// export function getSelectedAccountCachedBalance(state: RootState) {
//   const cachedBalances = getTeleportWalletCachedBalances(state);
//   const selectedAddress = getSelectedAddress(state);

//   return cachedBalances && cachedBalances[selectedAddress];
// }

// export function getSelectedAccount(state: RootState) {
//   const accounts = getWalletAccounts(state);
//   const selectedAddress = getSelectedAddress(state);

//   return accounts[selectedAddress];
// }

// export function getTargetAccount(state: RootState, targetAddress: string) {
//   const accounts = getWalletAccounts(state);
//   return accounts[targetAddress];
// }

// export const getTokenExchangeRates = (state: RootState) =>
//   state.network.contractExchangeRates;

// export function getAddressBook(state: RootState) {
//   const chainId = getCurrentChainId(state);
//   if (!state.network.addressBook[chainId]) {
//     return [];
//   }
//   return Object.values(state.network.addressBook[chainId]);
// }

// export function getAddressBookEntry(state, address) {
//   const addressBook = getAddressBook(state);
//   const entry = addressBook.find((contact) =>
//     isEqualCaseInsensitive(contact.address, toChecksumHexAddress(address)),
//   );
//   return entry;
// }

// export function getAddressBookEntryOrAccountName(state, address) {
//   const entry =
//     getAddressBookEntry(state, address) ||
//     Object.values(state.network.identities).find((identity) =>
//       isEqualCaseInsensitive(identity.address, toChecksumHexAddress(address)),
//     );
//   return entry && entry.name !== '' ? entry.name : address;
// }

// export function accountsWithSendEtherInfoSelector(state: RootState) {
//   const accounts = getWalletAccounts(state);
//   const identities = getTeleportWalletIdentities(state);

//   const accountsWithSendEtherInfo = Object.entries(identities).map(
//     ([key, identity]) => {
//       return { ...identity, ...accounts[key] };
//     },
//   );

//   return accountsWithSendEtherInfo;
// }

// export function getAccountsWithLabels(state: RootState) {
//   return getWalletAccountsOrdered(state).map(
//     ({ address, name, balance }) => ({
//       address,
//       addressLabel: `${
//         name.length < TRUNCATED_NAME_CHAR_LIMIT
//           ? name
//           : `${name.slice(0, TRUNCATED_NAME_CHAR_LIMIT - 1)}...`
//       } (${shortenAddress(address)})`,
//       label: name,
//       balance,
//     }),
//   );
// }

// export function getCurrentAccountWithSendEtherInfo(state: RootState) {
//   const currentAddress = getSelectedAddress(state);
//   const accounts = accountsWithSendEtherInfoSelector(state);

//   return getAccountByAddress(accounts, currentAddress);
// }

// export function getTargetAccountWithSendEtherInfo(state, targetAddress) {
//   const accounts = accountsWithSendEtherInfoSelector(state);
//   return getAccountByAddress(accounts, targetAddress);
// }

// export function getCurrentEthBalance(state: RootState) {
//   return getCurrentAccountWithSendEtherInfo(state).balance;
// }

// export function getGasIsLoading(state: RootState) {
//   return state.appState.gasIsLoading;
// }

// @todo: getCurrentCurrency
export function getCurrentCurrency(state: RootState) {
  // return state.network.currentCurrency;
  // might be USD / EUR or something, we just lock this to native currency
  return getNativeCurrency(state);
}

// export function getTotalUnapprovedCount(state: RootState) {
//   const {
//     unapprovedMsgCount = 0,
//     unapprovedPersonalMsgCount = 0,
//     unapprovedDecryptMsgCount = 0,
//     unapprovedEncryptionPublicKeyMsgCount = 0,
//     unapprovedTypedMessagesCount = 0,
//     pendingApprovalCount = 0,
//   } = state.network;

//   return (
//     unapprovedMsgCount +
//     unapprovedPersonalMsgCount +
//     unapprovedDecryptMsgCount +
//     unapprovedEncryptionPublicKeyMsgCount +
//     unapprovedTypedMessagesCount +
//     getUnapprovedTxCount(state) +
//     pendingApprovalCount +
//     getSuggestedAssetCount(state)
//   );
// }

// function getUnapprovedTxCount(state: RootState) {
//   const { unapprovedTxs = {} } = state.network;
//   return Object.keys(unapprovedTxs).length;
// }

// export function getUnapprovedConfirmations(state: RootState) {
//   const { pendingApprovals } = state.network;
//   return Object.values(pendingApprovals);
// }

// export function getUnapprovedTemplatedConfirmations(state: RootState) {
//   const unapprovedConfirmations = getUnapprovedConfirmations(state);
//   return unapprovedConfirmations.filter((approval) =>
//     TEMPLATED_CONFIRMATION_MESSAGE_TYPES.includes(approval.type),
//   );
// }

// function getSuggestedAssetCount(state: RootState) {
//   const { suggestedAssets = [] } = state.network;
//   return suggestedAssets.length;
// }

export function getIsNonStandardEthChain(state) {
  return !(getIsMainnet(state) || getIsTestnet(state));
}

export function getIsMainnet(state: RootState) {
  const chainId = getCurrentChainId(state);
  return chainId === MAINNET_CHAIN_ID;
}

export function getIsTestnet(state: RootState) {
  const chainId = getCurrentChainId(state);
  return TEST_CHAINS.includes(chainId);
}

// export function getIsNonStandardEthChain(state: RootState) {
//   return !(getIsMainnet(state) || getIsTestnet(state) || process.env.IN_TEST);
// }

// export function getPreferences({ metamask }) {
//   return metamask.preferences;
// }

// export function getShowTestNetworks(state: RootState) {
//   const { showTestNetworks } = getPreferences(state);
//   return Boolean(showTestNetworks);
// }

// @todo: getShouldShowFiat
export function getShouldShowFiat(state: RootState) {
  // const isMainNet = getIsMainnet(state);
  // const conversionRate = getConversionRate(state);
  // const { showFiatInTestnets } = getPreferences(state);
  // return Boolean((isMainNet || showFiatInTestnets) && conversionRate);
  return false;
}

// export function getShouldHideZeroBalanceTokens(state: RootState) {
//   const { hideZeroBalanceTokens } = getPreferences(state);
//   return hideZeroBalanceTokens;
// }

// export function getAdvancedInlineGasShown(state: RootState) {
//   return Boolean(state.network.featureFlags.advancedInlineGas);
// }

// export function getUseNonceField(state: RootState) {
//   return Boolean(state.network.useNonceField);
// }

// export function getCustomNonceValue(state: RootState) {
//   return String(state.network.customNonceValue);
// }

// export function getSubjectMetadata(state: RootState) {
//   return state.network.subjectMetadata;
// }

export function getRpcPrefsForCurrentProvider(state: RootState) {
  const { provider } = state.network;
  // const selectRpcInfo = frequentRpcListDetail.find(
  //   (rpcInfo) => rpcInfo.rpcUrl === provider.rpcUrl,
  // );
  const { rpcPrefs = {} } = provider || {};
  return rpcPrefs;
}

export function getKnownMethodData(state: RootState, data?: string) {
  if (!data) {
    return null;
  }
  const prefixedData = addHexPrefix(data);
  const fourBytePrefix = prefixedData.slice(0, 10);
  const knownMethodData = state.knownMethod;

  return knownMethodData && knownMethodData[fourBytePrefix];
}

export function currentEthProviderSelector({ network }: RootState) {
  return new Eth.HttpProvider(network.provider.rpcUrl);
}

// export function getFeatureFlags(state: RootState) {
//   return state.network.featureFlags;
// }

// export function getOriginOfCurrentTab(state: RootState) {
//   return state.activeTab.origin;
// }

// export function getIpfsGateway(state: RootState) {
//   return state.network.ipfsGateway;
// }

// export function getInfuraBlocked(state: RootState) {
//   return Boolean(state.network.infuraBlocked);
// }

// export function getUSDConversionRate(state: RootState) {
//   return state.network.usdConversionRate;
// }

export function getWeb3ShimUsageStateForOrigin(state, origin) {
  return state.network.web3ShimUsageOrigins[origin];
}

/**
 * @typedef {Object} SwapsEthToken
 * @property {string} symbol - The symbol for ETH, namely "ETH"
 * @property {string} name - The name of the ETH currency, "Ether"
 * @property {string} address - A substitute address for the metaswap-api to
 * recognize the ETH token
 * @property {string} decimals - The number of ETH decimals, i.e. 18
 * @property {string} balance - The user's ETH balance in decimal wei, with a
 * precision of 4 decimal places
 * @property {string} string - The user's ETH balance in decimal ETH
 */

export interface SwapsEthToken {
  symbol: string;
  name: string;
  address: string;
  decimals: string;
  balance: string;
  string: string;
}

/**
 * Swaps related code uses token objects for various purposes. These objects
 * always have the following properties: `symbol`, `name`, `address`, and
 * `decimals`.
 *
 * When available for the current account, the objects can have `balance` and
 * `string` properties.
 * `balance` is the users token balance in decimal values, denominated in the
 * minimal token units (according to its decimals).
 * `string` is the token balance in a readable format, ready for rendering.
 *
 * Swaps treats the selected chain's currency as a token, and we use the token constants
 * in the SWAPS_CHAINID_DEFAULT_TOKEN_MAP to set the standard properties for
 * the token. The getSwapsDefaultToken selector extends that object with
 * `balance` and `string` values of the same type as in regular ERC-20 token
 * objects, per the above description.
 *
 * @param {object} state - the redux state object
 * @returns {SwapsEthToken} The token object representation of the currently
 * selected account's ETH balance, as expected by the Swaps API.
 */

// export function getSwapsDefaultToken(state: RootState): SwapsEthToken {
//   const selectedAccount = getSelectedAccount(state);
//   const { balance } = selectedAccount;
//   const chainId = getCurrentChainId(state);

//   const defaultTokenObject = SWAPS_CHAINID_DEFAULT_TOKEN_MAP[chainId];

//   return {
//     ...defaultTokenObject,
//     balance: hexToDecimal(balance),
//     string: getValueFromWeiHex({
//       value: balance,
//       numberOfDecimals: 4,
//       toDenomination: EthDenomination.ETH,
//     }),
//   };
// }

export function getIsSwapsChain(state: RootState) {
  const chainId = getCurrentChainId(state);
  // return ALLOWED_SWAPS_CHAIN_IDS[chainId];
  // @todo: support this later
  return false;
}

export function getNativeCurrencyImage(state: RootState) {
  const nativeCurrency = getNativeCurrency(state).toUpperCase();
  return NATIVE_CURRENCY_TOKEN_IMAGE_MAP[nativeCurrency];
}

// export function getNextSuggestedNonce(state: RootState) {
//   return Number(state.network.nextNonce);
// }

// export function getShowWhatsNewPopup(state: RootState) {
//   return state.appState.showWhatsNewPopup;
// }

// /**
//  * Get an object of notification IDs and if they are allowed or not.
//  * @param state
//  * @returns {Object}
//  */
// function getAllowedNotificationIds(state: RootState) {
//   const currentKeyring = getCurrentKeyring(state);
//   const currentKeyringIsLedger = currentKeyring?.type === KEYRING_TYPES.LEDGER;
//   const supportsWebHid = window.navigator.hid !== undefined;
//   const currentlyUsingLedgerLive =
//     getLedgerTransportType(state) === LEDGER_TRANSPORT_TYPES.LIVE;

//   return {
//     1: false,
//     2: false,
//     3: false,
//     4: false,
//     5: false,
//     6: false,
//     7: false,
//     8: supportsWebHid && currentKeyringIsLedger && currentlyUsingLedgerLive,
//     9: getIsMainnet(state),
//   };
// }

// /**
//  * @typedef {Object} Notification
//  * @property {number} id - A unique identifier for the notification
//  * @property {string} date - A date in YYYY-MM-DD format, identifying when the notification was first committed
//  */

// /**
//  * Notifications are managed by the notification controller and referenced by
//  * `state.network.notifications`. This function returns a list of notifications
//  * the can be shown to the user. This list includes all notifications that do not
//  * have a truthy `isShown` property.
//  *
//  * The returned notifications are sorted by date.
//  *
//  * @param state - the redux state object
//  * @returns {Notification[]} An array of notifications that can be shown to the user
//  */

// export function getSortedNotificationsToShow(state: RootState) {
//   const notifications = Object.values(state.network.notifications);
//   const allowedNotificationIds = getAllowedNotificationIds(state);
//   const notificationsToShow = notifications.filter(
//     (notification) =>
//       !notification.isShown && allowedNotificationIds[notification.id],
//   );
//   const notificationsSortedByDate = notificationsToShow.sort(
//     (a, b) => new Date(b.date) - new Date(a.date),
//   );
//   return notificationsSortedByDate;
// }

// export function getShowRecoveryPhraseReminder(state: RootState) {
//   const {
//     recoveryPhraseReminderLastShown,
//     recoveryPhraseReminderHasBeenShown,
//   } = state.network;

//   const currentTime = new Date().getTime();
//   const frequency = recoveryPhraseReminderHasBeenShown ? DAY * 90 : DAY * 2;

//   return currentTime - recoveryPhraseReminderLastShown >= frequency;
// }

// /**
//  * To get the useTokenDetection flag which determines whether a static or dynamic token list is used
//  * @param {*} state
//  * @returns Boolean
//  */
// export function getUseTokenDetection(state: RootState) {
//   return Boolean(state.network.useTokenDetection);
// }

// /**
//  * To get the useCollectibleDetection flag which determines whether we autodetect NFTs
//  * @param {*} state
//  * @returns Boolean
//  */
// export function getUseCollectibleDetection(state: RootState) {
//   return Boolean(state.network.useCollectibleDetection);
// }

/**
 * To get the openSeaEnabled flag which determines whether we use OpenSea's API
 * @param {*} state
 * @returns Boolean
 */
export function getOpenSeaEnabled(state: RootState) {
  // return Boolean(state.network.openSeaEnabled);
  return false;
}

/**
 * To retrieve the tokenList produced by TokenListcontroller
 * @param {*} state
 * @returns {Object}
 */
// export function getTokenList(state: RootState) {
//   return state.network.tokenList;
// }

// export function doesAddressRequireLedgerHidConnection(state, address) {
//   const addressIsLedger = isAddressLedger(state, address);
//   const transportTypePreferenceIsWebHID =
//     getLedgerTransportType(state) === LEDGER_TRANSPORT_TYPES.WEBHID;
//   const webHidIsNotConnected =
//     getLedgerWebHidConnectedStatus(state: RootState) !==
//     WEBHID_CONNECTED_STATUSES.CONNECTED;
//   const ledgerTransportStatus = getLedgerTransportStatus(state);
//   const transportIsNotSuccessfullyCreated =
//     ledgerTransportStatus !== TRANSPORT_STATES.VERIFIED;

//   return (
//     addressIsLedger &&
//     transportTypePreferenceIsWebHID &&
//     (webHidIsNotConnected || transportIsNotSuccessfullyCreated)
//   );
// }

// export function getNewCollectibleAddedMessage(state: RootState) {
//   return state.appState.newCollectibleAddedMessage;
// }

/**
 * To retrieve the name of the new Network added using add network form
 * @param {*} state
 * @returns string
 */
// export function getNewNetworkAdded(state: RootState) {
//   return state.appState.newNetworkAdded;
// }

// export function getNetworksTabSelectedRpcUrl(state: RootState) {
//   return state.appState.networksTabSelectedRpcUrl;
// }

export function getProvider(state: RootState) {
  return state.network.provider;
}

// export function getFrequentRpcListDetail(state: RootState) {
//   return state.network.frequentRpcListDetail;
// }

export function getIsOptimism(state: RootState) {
  return (
    getCurrentChainId(state) === OPTIMISM_CHAIN_ID ||
    getCurrentChainId(state) === OPTIMISM_TESTNET_CHAIN_ID
  );
}

export function getNetworkSupportsSettingGasPrice(state: RootState) {
  return !getIsOptimism(state);
}

export function getIsMultiLayerFeeNetwork(state: RootState) {
  return getIsOptimism(state);
}

export function getNativeCurrency(state: RootState) {
  return state.network.provider.ticker || 'ETH';
}
// /**
//  *  To retrieve the maxBaseFee and priotitFee teh user has set as default
//  *  @param {*} state
//  *  @returns Boolean
//  */
// export function getAdvancedGasFeeValues(state: RootState) {
//   return state.network.advancedGasFee;
// }

// /**
//  *  To check if the user has set advanced gas fee settings as default with a non empty  maxBaseFee and priotityFee.
//  *  @param {*} state
//  *  @returns Boolean
//  */
// export function getIsAdvancedGasFeeDefault(state: RootState) {
//   const { advancedGasFee } = state.network;
//   return (
//     Boolean(advancedGasFee?.maxBaseFee) && Boolean(advancedGasFee?.priorityFee)
//   );
// }
