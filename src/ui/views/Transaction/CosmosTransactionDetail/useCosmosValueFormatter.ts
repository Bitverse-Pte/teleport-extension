import { utils } from 'ethers';
import { useSelector } from 'react-redux';

export function useCosmosValueFormatter(transactionValue?: {
  amount: string;
  denom: string;
}) {
  const knownTokens = useSelector((state) => state.tokens.tokens);

  const token = knownTokens.find(
    ({ denom }) => denom === transactionValue?.denom
  );
  let formattedValue: { amount: string; denom: string } | undefined;
  if (!transactionValue) return undefined;
  if (token) {
    formattedValue = {
      amount: utils.formatUnits(transactionValue.amount, token?.decimal),
      denom: token?.symbol || transactionValue.denom,
    };
  } else {
    // fallback if no token was matched
    return transactionValue;
  }

  return formattedValue;
}
