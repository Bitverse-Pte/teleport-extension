import { TransactionGroupCategories } from 'constants/transaction';
import { useSelector } from 'react-redux';
import { formatDateWithWeekContext } from 'ui/utils/utils';
import { MockCosmosTxHistory } from './_MockCosmosTxHistory';

const activityId = '_pBWBbRUSHFMqiBDW6xcd';
const transaction = MockCosmosTxHistory[activityId];

export function useCosmosTxDisplayData() {
  const senderAddress = transaction.account.address;
  const recipientAddress = transaction.aminoMsgs[0].value.to_address;
  const date = formatDateWithWeekContext(transaction.timestamp);

  /** @TODO refine displayedStatusKey */
  const displayedStatusKey = transaction.status;

  const knownTokens = useSelector((state) => state.tokens.tokens);

  /** @TODO support other than native token */
  const token = knownTokens.find(
    ({ denom }) => denom === transaction.currency.coinDenom
  );

  return {
    title: TransactionGroupCategories.SEND,
    category: TransactionGroupCategories.SEND,
    date,
    primaryCurrency: transaction.aminoMsgs[0].value.amount[0],
    senderAddress,
    recipientAddress,
    //   (isTokenCategory && !tokenFiatAmount) ||
    //   (type === TransactionTypes.SWAP && !swapTokenFiatAmount)
    //     ? undefined
    //     : secondaryCurrency,
    displayedStatusKey,
    // isPending,
    // isSubmitted,
    token,
  };
}
