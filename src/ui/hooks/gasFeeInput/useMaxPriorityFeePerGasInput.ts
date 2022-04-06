import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { addHexPrefix } from 'ethereumjs-util';

import {
  checkNetworkAndAccountSupports1559,
  getShouldShowFiat,
} from 'ui/selectors/selectors';
import { isLegacyTransactionParams } from 'utils/transaction.utils';
import { hexWEIToDecGWEI, multiplyCurrencies } from 'utils/conversion';

import { useCurrencyDisplay } from '../wallet/useCurrencyDisplay';
import { useUserPreferencedCurrency } from '../wallet/useUserPreferencedCurrency';
import { feeParamsAreCustom, getGasFeeEstimate } from './utils';
import { Transaction } from 'constants/transaction';

const getMaxPriorityFeePerGasFromTransaction = (
  transaction: Transaction,
  gasFeeEstimates
): number => {
  if (gasFeeEstimates?.[transaction?.userFeeLevel as any]) {
    return gasFeeEstimates[transaction.userFeeLevel!]
      .suggestedMaxPriorityFeePerGas;
  }
  const { maxPriorityFeePerGas, maxFeePerGas, gasPrice } =
    transaction?.txParam || {};
  return Number(
    hexWEIToDecGWEI(maxPriorityFeePerGas || maxFeePerGas || gasPrice)
  );
};

/**
 * @typedef {Object} MaxPriorityFeePerGasInputReturnType
 * @property {DecGweiString} [maxPriorityFeePerGas] - the maxPriorityFeePerGas
 *  input value.
 * @property {string} [maxPriorityFeePerGasFiat] - the maxPriorityFeePerGas
 *  converted to the user's preferred currency.
 * @property {(DecGweiString) => void} setMaxPriorityFeePerGas - state setter
 *  method to update the maxPriorityFeePerGas.
 */
interface MaxPriorityFeePerGasInputReturnType {
  maxPriorityFeePerGas: number | null;
  maxPriorityFeePerGasFiat: string;
  setMaxPriorityFeePerGas: (v: number | null) => void;
}

/**
 * @param options
 * @param options.supportsEIP1559V2
 * @param options.estimateToUse
 * @param options.gasEstimateType
 * @param options.gasFeeEstimates
 * @param options.gasLimit
 * @param options.transaction
 * @returns {MaxPriorityFeePerGasInputReturnType}
 */
export function useMaxPriorityFeePerGasInput({
  estimateToUse,
  gasEstimateType,
  gasFeeEstimates,
  gasLimit,
  supportsEIP1559V2,
  transaction,
}): MaxPriorityFeePerGasInputReturnType {
  const supportsEIP1559 =
    useSelector(checkNetworkAndAccountSupports1559) &&
    !isLegacyTransactionParams(transaction.txParam || transaction);

  const { currency: fiatCurrency, numberOfDecimals: fiatNumberOfDecimals } =
    useUserPreferencedCurrency('SECONDARY');

  const showFiat = useSelector(getShouldShowFiat);

  const initialMaxPriorityFeePerGas = supportsEIP1559
    ? getMaxPriorityFeePerGasFromTransaction(transaction, gasFeeEstimates)
    : 0;

  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState<
    null | number
  >(() => {
    if (initialMaxPriorityFeePerGas && feeParamsAreCustom(transaction)) {
      return initialMaxPriorityFeePerGas;
    }
    return null;
  });

  useEffect(() => {
    if (supportsEIP1559V2 && initialMaxPriorityFeePerGas) {
      setMaxPriorityFeePerGas(initialMaxPriorityFeePerGas);
    }
  }, [initialMaxPriorityFeePerGas, setMaxPriorityFeePerGas, supportsEIP1559V2]);

  const maxPriorityFeePerGasToUse =
    maxPriorityFeePerGas ??
    getGasFeeEstimate(
      'suggestedMaxPriorityFeePerGas',
      gasFeeEstimates,
      gasEstimateType,
      estimateToUse,
      initialMaxPriorityFeePerGas || 0
    );

  // We need to display the estimated fiat currency impact of the
  // maxPriorityFeePerGas field to the user. This hook calculates that amount.
  const [, { value: maxPriorityFeePerGasFiat }] = useCurrencyDisplay(
    addHexPrefix(
      multiplyCurrencies(maxPriorityFeePerGasToUse, gasLimit, {
        toNumericBase: 'hex',
        fromDenomination: 'GWEI',
        toDenomination: 'WEI',
        multiplicandBase: 10,
        multiplierBase: 10,
      })
    ),
    {
      numberOfDecimals: fiatNumberOfDecimals,
      currency: fiatCurrency,
    }
  );

  return {
    maxPriorityFeePerGas: maxPriorityFeePerGasToUse,
    maxPriorityFeePerGasFiat: showFiat ? maxPriorityFeePerGasFiat : '',
    setMaxPriorityFeePerGas,
  };
}
