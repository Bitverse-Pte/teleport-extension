import { useMemo } from 'react';
// import {
//   getTokenValueParam,
//   calcTokenAmount,
// } from '../helpers/utils/token-util';
import { useTokenData } from './useTokenData';
import { calcTokenAmount } from 'utils/conversion';
import { Token } from 'types/token';
export function getTokenValueParam(tokenData: any = {}): string {
  return tokenData?.args?._value?.toString();
}

/**
 * useTokenDisplayValue
 * Given the data string from txParams and a token object with symbol and decimals, return
 * a displayValue that represents a string representing that token amount as a string. Also
 * return a tokenData object for downstream usage and the suffix for the token to use as props
 * for other hooks and/or components
 * @param {string}  [transactionData]    - Raw data string from token transaction
 * @param {Token}   [token]              - The token associated with this transaction
 * @param {boolean} [isTokenTransaction] - Due to the nature of hooks, it isn't possible
 *                                         to conditionally call this hook. This flag will
 *                                         force this hook to return null if it set as false
 *                                         which indicates the transaction is not associated
 *                                         with a token.
 * @return {string} - The computed displayValue of the provided transactionData and token
 */
export function useTokenDisplayValue(
  transactionData?: string,
  token?: Token,
  isTokenTransaction = true
): string | undefined {
  const tokenData = useTokenData(transactionData, isTokenTransaction);
  const shouldCalculateTokenValue = Boolean(
    // If we are currently processing a token transaction
    isTokenTransaction &&
      // and raw transaction data string is provided
      transactionData &&
      // and a token object has been provided
      token &&
      // and we are able to parse the token details from the raw data
      tokenData?.args?.length
  );

  const displayValue = useMemo(() => {
    if (!shouldCalculateTokenValue) {
      return undefined;
    }
    const tokenValue = getTokenValueParam(tokenData);
    return calcTokenAmount(tokenValue, token?.decimal).toString(10);
  }, [shouldCalculateTokenValue, tokenData, token]);

  return displayValue;
}
