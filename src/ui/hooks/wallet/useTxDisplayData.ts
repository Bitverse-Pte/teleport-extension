import { useDispatch, useSelector } from 'react-redux';
// import { getKnownMethodData } from '../selectors/selectors';
// import {
//   getStatusKey,
//   getTransactionTypeTitle,
// } from '../helpers/utils/transactions.util';
// import { camelCaseToCapitalize } from '../helpers/utils/common.util';
// import  from '../helpers/utils/util';

// import { captureSingleException } from '../store/actions';
import { useUserPreferencedCurrency } from './useUserPreferencedCurrency';
// import { useCurrencyDisplay } from './useCurrencyDisplay';
import { useTokenDisplayValue } from './useTokenDisplayValue';
import { useTokenData } from './useTokenData';
// import { useSwappedTokenValue } from './useSwappedTokenValue';
// import { useCurrentAsset } from './useCurrentAsset';
/**
 * After added imports
 */
import { useTranslation } from 'react-i18next';
import {
  PENDING_STATUS_HASH,
  TOKEN_CATEGORY_HASH,
  Transaction,
  TransactionGroup,
  TransactionGroupCategories,
  TransactionStatuses,
  TransactionTypes,
} from 'constants/transaction';
import { getStatusKey, getTransactionTypeTitle } from 'ui/utils/transactions';
import {
  isEqualCaseInsensitive,
  formatDateWithWeekContext,
  shortenAddress,
  stripHttpSchemes,
} from 'ui/utils/utils';
import { useCurrencyDisplay } from './useCurrencyDisplay';
import { getKnownMethodData } from 'ui/selectors/selectors';
import { get } from 'lodash';
import { Token } from 'types/token';
import { useMethodData } from './useMethodData';
export function camelCaseToCapitalize(str = '') {
  return str.replace(/([A-Z])/gu, ' $1').replace(/^./u, (s) => s.toUpperCase());
}
// import { getTokenAddressParam } from '../helpers/utils/token-util';
export function getTokenAddressParam(tokenData: any = {}): string {
  const value = tokenData?.args?._to || tokenData?.args?.[0];
  return value?.toString().toLowerCase() || '';
}

interface TransactionDisplayData {
  /**
   * primary description of the transaction
   */
  title: string;
  /**
   * supporting text describing the transaction
   */
  subtitle: string;
  /**
   * true if the subtitle includes the origin of the tx
   */
  subtitleContainsOrigin: boolean;
  /**
   * the transaction category
   */
  category: string;
  /**
   * the currency string to display in the primary position
   */
  primaryCurrency: string;
  /**
   * the currency string to display in the secondary position
   */
  secondaryCurrency?: string;
  /**
   * the Ethereum address of the sender
   */
  senderAddress: string;
  /**
   * the Ethereum address of the recipient
   */
  recipientAddress?: string | null;

  /**
   * The Tx Date
   */
  date: string;

  /**
   * missing typed properties
   */
  displayedStatusKey: TransactionStatuses | 'cancelled';

  isPending: boolean;
  isSubmitted: boolean;

  token?: Token;
}

/**
 * Get computed values used for displaying transaction data to a user
 *
 * The goal of this method is to perform all of the necessary computation and
 * state access required to take a transactionGroup and derive from it a shape
 * of data that can power all views related to a transaction. Presently the main
 * case is for shared logic between transaction-list-item and transaction-detail-view
 * @param transactionGroup - group of transactions
 * @return {TransactionDisplayData} - the parsed tx data for display
 */
export function useTransactionDisplayData(
  transactionGroup: TransactionGroup
): TransactionDisplayData {
  // To determine which primary currency to display for swaps transactions we need to be aware
  // of which asset, if any, we are viewing at present
  // const dispatch = useDispatch();
  //   const currentAsset = useCurrentAsset();
  const knownTokens = useSelector((state) => state.tokens.tokens);

  const { t } = useTranslation();
  const { initialTransaction, primaryTransaction } = transactionGroup;
  // initialTransaction contains the data we need to derive the primary purpose of this transaction group
  // const { type } = initialTransaction;
  const { type } = primaryTransaction;

  const { from: senderAddress, to } = primaryTransaction.txParams || {};

  // for smart contract interactions, methodData can be used to derive the name of the action being taken
  // const methodData = useMethodData(initialTransaction.txParams.data);
  const methodData = useMethodData(primaryTransaction.txParams.data);

  const displayedStatusKey = getStatusKey(primaryTransaction);
  const isPending = displayedStatusKey in PENDING_STATUS_HASH;
  const isSubmitted = displayedStatusKey === TransactionStatuses.SUBMITTED;

  const primaryValue = primaryTransaction.txParams?.value;
  let prefix = '-';
  /**
   * As requested, will be formatted to relative time
   * if tx is happened in 7 days
   */
  // const date = formatDateWithWeekContext(initialTransaction.time);
  const date = formatDateWithWeekContext(primaryTransaction.time);
  let subtitle = '';
  let subtitleContainsOrigin = false;
  let recipientAddress = to;

  // This value is used to determine whether we should look inside txParams.data
  // to pull out and render token related information
  const isTokenCategory: true | undefined = TOKEN_CATEGORY_HASH[type];

  // these values are always instantiated because they are either
  // used by or returned from hooks. Hooks must be called at the top level,
  // so as an additional safeguard against inappropriately associating token
  // transfers, we pass an additional argument to these hooks that will be
  // false for non-token transactions. This additional argument forces the
  // hook to return null
  const token = isTokenCategory
    ? knownTokens.find(({ contractAddress }) =>
        isEqualCaseInsensitive(contractAddress, recipientAddress as string)
      )
    : undefined;
  const tokenData = useTokenData(
    // initialTransaction?.txParams?.data,
    primaryTransaction?.txParams?.data,
    isTokenCategory
  );
  const tokenDisplayValue = useTokenDisplayValue(
    // initialTransaction?.txParams?.data,
    primaryTransaction?.txParams?.data,
    token,
    isTokenCategory
  );
  const tokenFiatAmount = undefined;
  /** @todo: use this later
    useTokenFiatAmount(
    token?.address,
    tokenDisplayValue,
    token?.symbol,
  );
   */

  const origin = stripHttpSchemes(
    initialTransaction.origin || get(initialTransaction, 'msgParams.origin', '')
  );

  /* eslint-disable prefer-const */
  // used to append to the primary display value. initialized to either token.symbol or undefined
  // but can later be modified if dealing with a swap
  let primarySuffix = isTokenCategory ? token?.symbol : undefined;
  // used to display the primary value of tx. initialized to either tokenDisplayValue or undefined
  // but can later be modified if dealing with a swap
  let primaryDisplayValue = isTokenCategory ? tokenDisplayValue : undefined;
  // used to display fiat amount of tx. initialized to either tokenFiatAmount or undefined
  // but can later be modified if dealing with a swap
  let secondaryDisplayValue = isTokenCategory ? tokenFiatAmount : undefined;
  // The transaction group category that will be used for rendering the icon in the activity list
  let category = '';
  // The primary title of the Tx that will be displayed in the activity list
  let title = '';

  //   const {
  //     swapTokenValue,
  //     isNegative,
  //     swapTokenFiatAmount,
  //     isViewingReceivedTokenFromSwap,
  //   } = useSwappedTokenValue(transactionGroup, currentAsset);

  // There are seven types of transaction entries that are currently differentiated in the design
  // 1. Signature request
  // 2. Send (sendEth sendTokens)
  // 3. Deposit
  // 4. Site interaction
  // 5. Approval
  // 6. Swap
  // 7. Swap Approval

  const signatureTypes = [
    null,
    undefined,
    TransactionTypes.SIGN,
    TransactionTypes.PERSONAL_SIGN,
    TransactionTypes.SIGN_TYPED_DATA,
    TransactionTypes.ETH_DECRYPT,
    TransactionTypes.ETH_GET_ENCRYPTION_PUBLIC_KEY,
  ];

  if (signatureTypes.includes(type as TransactionTypes)) {
    category = TransactionGroupCategories.SIGNATURE_REQUEST;
    title = t('signatureRequest');
    subtitle = origin;
    subtitleContainsOrigin = true;
  }
  //   if (type === TransactionTypes.SWAP) {
  //     category = TransactionGroupCategories.SWAP;
  //     title = t('swapTokenToToken', [
  //       initialTransaction.sourceTokenSymbol,
  //       initialTransaction.destinationTokenSymbol,
  //     ]);
  //     subtitle = origin;
  //     subtitleContainsOrigin = true;
  //     primarySuffix = isViewingReceivedTokenFromSwap
  //       ? currentAsset.symbol
  //       : initialTransaction.sourceTokenSymbol;
  //     primaryDisplayValue = swapTokenValue;
  //     secondaryDisplayValue = swapTokenFiatAmount;
  //     if (isNegative) {
  //       prefix = '';
  //     } else if (isViewingReceivedTokenFromSwap) {
  //       prefix = '+';
  //     } else {
  //       prefix = '-';
  //     }
  //   } else
  // if (type === TransactionTypes.SWAP_APPROVAL) {
  //   category = TransactionGroupCategories.APPROVAL;
  //   title = t('swapApproval', [primaryTransaction.sourceTokenSymbol]);
  //   subtitle = origin;
  //   subtitleContainsOrigin = true;
  //   primarySuffix = primaryTransaction.sourceTokenSymbol;
  // } else
  else if (type === TransactionTypes.TOKEN_METHOD_APPROVE) {
    category = TransactionGroupCategories.APPROVAL;
    prefix = '';
    title = t('approveSpendLimit', {
      replace: { $1: token?.symbol || t('token') },
    });
    subtitle = origin;
    subtitleContainsOrigin = true;
  } else if (
    type === TransactionTypes.DEPLOY_CONTRACT ||
    type === TransactionTypes.CONTRACT_INTERACTION
  ) {
    category = TransactionGroupCategories.INTERACTION;
    const transactionTypeTitle = getTransactionTypeTitle(t, type);
    title =
      (methodData?.name && camelCaseToCapitalize(methodData.name)) ||
      transactionTypeTitle;
    subtitle = origin;
    subtitleContainsOrigin = true;
  } else if (type === TransactionTypes.INCOMING) {
    category = TransactionGroupCategories.RECEIVE;
    title = t('receive');
    prefix = '';
    subtitle = t('fromAddress', {
      replace: { $1: shortenAddress(senderAddress) },
    });
  } else if (
    type === TransactionTypes.TOKEN_METHOD_TRANSFER_FROM ||
    type === TransactionTypes.TOKEN_METHOD_TRANSFER
  ) {
    category = TransactionGroupCategories.SEND;
    title = t('sendSpecifiedTokens', {
      replace: { $1: token?.symbol || t('token') },
    });
    recipientAddress = getTokenAddressParam(tokenData);
    subtitle = t('toAddress', {
      replace: { $1: shortenAddress(recipientAddress) },
    });
  } else if (type === TransactionTypes.SIMPLE_SEND) {
    category = TransactionGroupCategories.SEND;
    title = t('send');
    subtitle = t('toAddress', {
      replace: { $1: shortenAddress(recipientAddress as string) },
    });
  } else {
    // dispatch(
    //   // captureSingleException(
    //   //   `useTransactionDisplayData does not recognize transaction type. Type received is: ${type}`,
    //   // ),
    // );
  }

  const primaryCurrencyPreferences = useUserPreferencedCurrency('PRIMARY');
  const secondaryCurrencyPreferences = useUserPreferencedCurrency('SECONDARY');

  const [primaryCurrency] = useCurrencyDisplay(primaryValue, {
    prefix,
    displayValue: primaryDisplayValue,
    suffix: primarySuffix,
    ...primaryCurrencyPreferences,
  });

  const [secondaryCurrency] = useCurrencyDisplay(primaryValue, {
    prefix,
    displayValue: secondaryDisplayValue,
    hideLabel: isTokenCategory,
    // || Boolean(swapTokenValue),
    ...secondaryCurrencyPreferences,
  });

  return {
    title,
    category,
    date,
    subtitle,
    subtitleContainsOrigin,
    primaryCurrency:
      type === TransactionTypes.SWAP && isPending ? '' : primaryCurrency,
    senderAddress,
    recipientAddress,
    secondaryCurrency: secondaryCurrency,
    //   (isTokenCategory && !tokenFiatAmount) ||
    //   (type === TransactionTypes.SWAP && !swapTokenFiatAmount)
    //     ? undefined
    //     : secondaryCurrency,
    displayedStatusKey,
    isPending,
    isSubmitted,
    token,
  };
}
