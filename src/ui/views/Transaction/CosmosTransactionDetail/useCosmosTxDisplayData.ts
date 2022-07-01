import type { CosmosTx } from 'background/service/transactions/cosmos/cosmos';
import { TransactionGroupCategories } from 'constants/transaction';
import { utils } from 'ethers';
import { useSelector } from 'react-redux';
import { CosmosTxStatus } from 'types/cosmos/transaction';
import { getTokenBalancesOfCurrentAccount } from 'ui/selectors/token.selector';
import { formatDateWithWeekContext } from 'ui/utils/utils';
import { useCosmosValueFormatter } from './useCosmosValueFormatter';

export function useCosmosTxDisplayData(transaction?: CosmosTx) {
  const senderAddress = transaction?.account.address;
  const recipientAddress = transaction?.aminoMsgs
    ? transaction?.aminoMsgs[0].value.to_address
    : undefined;
  const date = transaction
    ? formatDateWithWeekContext(transaction?.timestamp)
    : undefined;

  const displayedStatusKey = transaction?.status || CosmosTxStatus.CREATED;

  const balances = useSelector(getTokenBalancesOfCurrentAccount);
  /**
   * IBC token transferred internally supported
   * @TODO it's there any more types of token to be supported?
   */
  const token = balances.find(
    ({ denom }) => denom === transaction?.currency?.coinMinimalDenom
  );
  console.debug('matched token: ', token);

  const transactionValue = transaction?.aminoMsgs
    ? transaction?.aminoMsgs[0].value.amount[0]
    : undefined;
  const primaryCurrency: { amount: string; denom: string } | undefined =
    useCosmosValueFormatter(transactionValue);

  const formattedFee = useCosmosValueFormatter(
    transaction?.fee?.amount ? transaction?.fee.amount[0] : undefined
  );

  return {
    title: TransactionGroupCategories.SEND,
    category: TransactionGroupCategories.SEND,
    date,
    primaryCurrency,
    formattedFee,
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
