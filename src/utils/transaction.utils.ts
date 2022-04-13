import { Transaction } from 'constants/transaction';
import { isHexString } from 'ethereumjs-util';

export function transactionMatchesNetwork(
  transaction: Transaction,
  chainId: string,
  networkId: any
) {
  if (typeof transaction.chainId !== 'undefined') {
    return transaction.chainId === chainId;
  }
  return transaction.metamaskNetworkId === networkId;
}

/**
 * Determines if the maxFeePerGas and maxPriorityFeePerGas fields are supplied
 * and valid inputs. This will return false for non hex string inputs.
 *
 * @param  transaction -
 *  the transaction to check
 * @returns {boolean} true if transaction uses valid EIP1559 fields
 */
export function isEIP1559Transaction(transaction: Transaction): boolean {
  return (
    !!transaction?.txParams?.maxFeePerGas &&
    !!transaction?.txParams?.maxPriorityFeePerGas &&
    isHexString(transaction?.txParams?.maxFeePerGas) &&
    isHexString(transaction?.txParams?.maxPriorityFeePerGas)
  );
}

/**
 * Determine if the maxFeePerGas and maxPriorityFeePerGas fields are not
 * supplied and that the gasPrice field is valid if it is provided. This will
 * return false if gasPrice is a non hex string.
 *
 * @param  transaction -
 *  the transaction to check
 * @returns {boolean} true if transaction uses valid Legacy fields OR lacks
 *  EIP1559 fields
 */
export function isLegacyTransaction(transaction: Transaction) {
  return (
    typeof transaction.txParams.maxFeePerGas === 'undefined' &&
    typeof transaction.txParams.maxPriorityFeePerGas === 'undefined' &&
    (typeof transaction.txParams.gasPrice === 'undefined' ||
      isHexString(transaction.txParams.gasPrice))
  );
}
export function isLegacyTransactionParams(txParams: Transaction['txParams']) {
  return (
    typeof txParams.maxFeePerGas === 'undefined' &&
    typeof txParams.maxPriorityFeePerGas === 'undefined' &&
    (typeof txParams.gasPrice === 'undefined' || isHexString(txParams.gasPrice))
  );
}

export function withoutDigits(hexstr: string): string {
  return hexstr.split('.')[0];
}

/**
 * I hate BN! they caused incompatibility with `BigNumber` from ethers
 * let get rid of hexstring with digits!
 * @param transaction tx object
 * @returns a purified tx object
 */
export function purifyTxParamsGasFields(originalTx: Transaction) {
  // const transaction = { ...originalTx };
  const partsOfNewTxParams: Partial<Transaction['txParams']> = {};

  if (originalTx.txParams.maxFeePerGas)
    partsOfNewTxParams.maxFeePerGas = withoutDigits(
      originalTx.txParams.maxFeePerGas
    );
  if (originalTx.txParams.maxPriorityFeePerGas)
    partsOfNewTxParams.maxPriorityFeePerGas = withoutDigits(
      originalTx.txParams.maxPriorityFeePerGas
    );
  if (originalTx.txParams.gasLimit)
    partsOfNewTxParams.gasLimit = withoutDigits(originalTx.txParams.gasLimit);
  if (originalTx.txParams.gasPrice)
    partsOfNewTxParams.gasPrice = withoutDigits(originalTx.txParams.gasPrice);

  /**
   * Avoid readonly object error issues
   */
  const newTxParams = Object.assign(
    {},
    originalTx.txParams,
    partsOfNewTxParams
  );

  return Object.assign({}, originalTx, { txParams: newTxParams });
}

/**
 * Determine if a transactions gas fees in txParams match those in its dappSuggestedGasFees property
 *
 * @param  transaction -
 *  the transaction to check
 * @returns {boolean} true if both the txParams and dappSuggestedGasFees are objects with truthy gas fee properties,
 *   and those properties are strictly equal
 */
export function txParamsAreDappSuggested(transaction: Transaction) {
  const { gasPrice, maxPriorityFeePerGas, maxFeePerGas } =
    transaction?.txParams || {};
  return (
    (gasPrice && gasPrice === transaction?.dappSuggestedGasFees?.gasPrice) ||
    (maxPriorityFeePerGas &&
      maxFeePerGas &&
      transaction?.dappSuggestedGasFees?.maxPriorityFeePerGas ===
        maxPriorityFeePerGas &&
      transaction?.dappSuggestedGasFees?.maxFeePerGas === maxFeePerGas)
  );
}
