import { SECOND } from 'constants/time';
import { Transaction, TransactionGroup } from 'constants/transaction';
import { useEffect, useState } from 'react';

/**
 * Evaluates whether the transaction is eligible to be sped up, and registers
 * an effect to check the logic again after the transaction has surpassed 5 seconds
 * of queue time.
 * @param transactionGroup - the transaction group to check against
 * @param isEarliestNonce - Whether this group is currently the earliest nonce
 */
export function useShouldShowSpeedUp(
  transactionGroup: TransactionGroup,
  isEarliestNonce: boolean
) {
  const { transactions, hasRetried } = transactionGroup;
  const [earliestTransaction] = transactions;
  const { submittedTime } = earliestTransaction;
  const [speedUpEnabled, setSpeedUpEnabled] = useState(() => {
    if (!submittedTime) return false;
    return Date.now() - submittedTime > 5000 && isEarliestNonce && !hasRetried;
  });
  useEffect(() => {
    // because this hook is optimized to only run on changes we have to
    // key into the changing time delta between submittedTime and now()
    // and if the status of the transaction changes based on that difference
    // trigger a setState call to tell react to re-render. This effect will
    // also immediately set retryEnabled and not create a timeout if the
    // condition is already met. This effect will run anytime the variables
    // for determining enabled status change
    let timeoutId;

    // type safeguard
    if (!submittedTime) return;

    if (!hasRetried && isEarliestNonce && !speedUpEnabled) {
      if (Date.now() - submittedTime > SECOND * 5) {
        setSpeedUpEnabled(true);
      } else {
        timeoutId = setTimeout(() => {
          setSpeedUpEnabled(true);
          clearTimeout(timeoutId);
        }, 5001 - (Date.now() - submittedTime));
      }
    }
    // Anytime the effect is re-ran, make sure to remove a previously set timeout
    // so as to avoid multiple timers potentially overlapping
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [submittedTime, speedUpEnabled, hasRetried, isEarliestNonce]);

  return speedUpEnabled;
}
