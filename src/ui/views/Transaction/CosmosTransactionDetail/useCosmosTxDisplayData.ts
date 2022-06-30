import type { CosmosTx } from 'background/service/transactions/cosmos/cosmos';
import { TransactionGroupCategories } from 'constants/transaction';
import { useSelector } from 'react-redux';
import { CosmosTxStatus } from 'types/cosmos/transaction';
import { formatDateWithWeekContext } from 'ui/utils/utils';

export function useCosmosTxDisplayData(transaction?: CosmosTx) {
  const senderAddress = transaction?.account.address;
  const recipientAddress = transaction?.aminoMsgs
    ? transaction?.aminoMsgs[0].value.to_address
    : undefined;
  const date = transaction
    ? formatDateWithWeekContext(transaction?.timestamp)
    : undefined;

  const primaryCurrency: { amount: string; denom: number } | undefined =
    transaction?.aminoMsgs
      ? transaction?.aminoMsgs[0].value.amount[0]
      : undefined;

  /** @TODO refine displayedStatusKey */
  const displayedStatusKey = transaction?.status || CosmosTxStatus.CREATED;

  const knownTokens = useSelector((state) => state.tokens.tokens);

  /** @TODO support other than native token */
  const token = knownTokens.find(
    ({ denom }) => denom === transaction?.currency?.coinDenom
  );

  return {
    title: TransactionGroupCategories.SEND,
    category: TransactionGroupCategories.SEND,
    date,
    primaryCurrency,
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
