import { Transaction } from 'constants/transaction';
import { useSelector } from 'react-redux';
import { getNativeCurrency, getShouldShowFiat } from 'ui/selectors/selectors';
import { subtractHexes } from 'ui/utils/conversion';
import { getHexGasTotal, sumHexes } from 'ui/utils/transactions';
import { isEIP1559Transaction } from 'utils/transaction.utils';

/**
 * `TransactionBreakdown` container's logic into hook
 * @param transaction the transcation object
 * @param isTokenApprove if it's a `approve` tx
 * @returns the breakdown data
 */
export function useTransactionBreakDown(
  transaction: Transaction,
  isTokenApprove?: boolean
) {
  const {
    txParams: { gas, gasPrice, maxFeePerGas, value } = {},
    txReceipt: {
      gasUsed,
      effectiveGasPrice,
      // l1Fee: l1HexGasTotal
    } = {},
    baseFeePerGas,
  } = transaction;

  const gasLimit = typeof gasUsed === 'string' ? gasUsed : gas;

  const priorityFee =
    effectiveGasPrice &&
    baseFeePerGas &&
    subtractHexes(effectiveGasPrice, baseFeePerGas);

  // To calculate the total cost of the transaction, we use gasPrice if it is in the txParam,
  // which will only be the case on non-EIP1559 networks. If it is not in the params, we can
  // use the effectiveGasPrice from the receipt, which will ultimately represent to true cost
  // of the transaction. Either of these are used the same way with gasLimit to calculate total
  // cost. effectiveGasPrice will be available on the txReciept for all EIP1559 networks
  const usedGasPrice = gasPrice || effectiveGasPrice;
  const hexGasTotal =
    (gasLimit &&
      usedGasPrice &&
      getHexGasTotal({ gasLimit, gasPrice: usedGasPrice })) ||
    '0x0';

  const totalInHex = sumHexes(hexGasTotal, value);

  //   const isMultiLayerFeeNetwork = useSelector(getIsMultiLayerFeeNetwork) && l1HexGasTotal !== undefined;

  //   if (isMultiLayerFeeNetwork) {
  //     totalInHex = sumHexes(totalInHex, l1HexGasTotal);
  //   }

  const nativeCurrency = useSelector(getNativeCurrency);
  const showFiat = useSelector(getShouldShowFiat);
  return {
    nativeCurrency,
    showFiat,
    totalInHex,
    gas,
    gasPrice,
    maxFeePerGas,
    gasUsed,
    isTokenApprove,
    hexGasTotal,
    priorityFee,
    baseFee: baseFeePerGas,
    isEIP1559Transaction: isEIP1559Transaction(transaction),
    // isMultiLayerFeeNetwork,
    // l1HexGasTotal,
  };
}
