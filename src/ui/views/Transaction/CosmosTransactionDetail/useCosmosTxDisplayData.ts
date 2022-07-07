import type { CosmosTx } from 'background/service/transactions/cosmos/cosmos';
import { TransactionGroupCategories } from 'constants/transaction';
import { utils } from 'ethers';
import { useSelector } from 'react-redux';
import { CosmosTxStatus } from 'types/cosmos/transaction';
import { getTokenBalancesOfCurrentAccount } from 'ui/selectors/token.selector';
import { formatDateWithWeekContext } from 'ui/utils/utils';
import { useCosmosActivityValue } from './useCosmosActivityValue';
import { useCosmosValueFormatter } from './useCosmosValueFormatter';

type CosmosTxType = 'sign' | 'send';

export function useCosmosTxDisplayData(transaction?: CosmosTx) {
  const senderAddress = transaction?.account.address;
  const transactionValue = useCosmosActivityValue(transaction);
  const recipientAddress = transactionValue
    ? transactionValue.recipient
    : undefined;
  const date = transaction
    ? formatDateWithWeekContext(transaction?.timestamp)
    : undefined;

  const displayedStatusKey = transaction?.status || CosmosTxStatus.CREATED;

  const balances = useSelector(getTokenBalancesOfCurrentAccount);
  /**
   * IBC token / CW20 transfer are supported
   */
  const token = balances.find(
    ({ denom }) => denom === transaction?.currency?.coinMinimalDenom
  );
  console.debug('matched token: ', token);

  const primaryCurrency: { amount: string; denom: string } | undefined =
    useCosmosValueFormatter(transactionValue);

  const formattedFee = useCosmosValueFormatter(
    transaction?.fee?.amount ? transaction?.fee.amount[0] : undefined
  );

  const ibcChannel = token?.trace?.trace[0] || undefined;
  const ibcChainName = token?.chainName;

  /**
   * @TODO
   * These are props for Sign type
   * furthermore need to play with albert for sign tx's data stroage and its type
   */
  const title: CosmosTxType = TransactionGroupCategories.SEND;
  const fromDapp: string | undefined = undefined;

  return {
    title: title as CosmosTxType,
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
    ibcChannel,
    ibcChainName,

    fromDapp,
  };
}
