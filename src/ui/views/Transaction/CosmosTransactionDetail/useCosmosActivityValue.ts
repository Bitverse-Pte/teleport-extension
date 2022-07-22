import type { CosmosTx } from 'background/service/transactions/cosmos/cosmos';

export function useCosmosActivityValue(transaction?: CosmosTx) {
  if (!transaction?.aminoMsgs) return undefined;
  if (
    transaction.aminoMsgs[0].type === 'cosmos-sdk/MsgSend' &&
    transaction.aminoMsgs[0].value.amount[0]
  ) {
    const { amount, denom } = transaction.aminoMsgs[0].value.amount[0];
    const recipient = transaction.aminoMsgs[0].value.to_address;
    return { amount, denom, recipient };
  } else if (
    transaction.aminoMsgs[0].type === 'wasm/MsgExecuteContract' &&
    transaction.aminoMsgs[0].value.msg.transfer
  ) {
    const { amount, recipient } = transaction.aminoMsgs[0].value.msg.transfer;
    return { amount, denom: transaction.currency?.coinMinimalDenom, recipient };
  }

  /** fallback to undefined if none of these condition were met */
  return undefined;
}
