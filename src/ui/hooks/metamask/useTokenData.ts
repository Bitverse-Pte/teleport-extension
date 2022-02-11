import { useMemo } from 'react';
import { getTokenData } from 'ui/utils/transactions';

/**
 * useTokenData
 * Given the data string from txParams return a decoded object of the details of the
 * transaction data.
 * @param [transactionData]     - Raw data string from token transaction
 * @param [isTokenTransaction] - Due to the nature of hooks, it isn't possible
 *                                         to conditionally call this hook. This flag will
 *                                         force this hook to return null if it set as false
 *                                         which indicates the transaction is not associated
 *                                         with a token.
 * @return Decoded token data
 */
export function useTokenData(
  transactionData?: string,
  isTokenTransaction = true
) {
  return useMemo(() => {
    if (!isTokenTransaction || !transactionData) {
      return null;
    }
    return getTokenData(transactionData);
  }, [isTokenTransaction, transactionData]);
}
