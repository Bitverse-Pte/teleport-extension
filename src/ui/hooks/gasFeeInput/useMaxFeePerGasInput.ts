import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// import { GAS_ESTIMATE_TYPES } from '../../../shared/constants/gas';
// import { SECONDARY } from '../../helpers/constants/common';
// import { getMaximumGasTotalInHexWei } from '../../../shared/modules/gas.utils';
// import {
//   decGWEIToHexWEI,
//   decimalToHex,
//   hexWEIToDecGWEI,
// } from '../../helpers/utils/conversions.util';
import {
  checkNetworkAndAccountSupports1559,
  getShouldShowFiat,
} from 'ui/selectors/selectors';
import { isLegacyTransactionParams } from 'utils/transaction.utils';

import { useCurrencyDisplay } from '../wallet/useCurrencyDisplay';
import { useUserPreferencedCurrency } from '../wallet/useUserPreferencedCurrency';
import { feeParamsAreCustom, getGasFeeEstimate } from './utils';

import { decimalToHex } from 'ui/utils/conversion';
import { hexWEIToDecGWEI, decGWEIToHexWEI } from 'utils/conversion';
import { GAS_ESTIMATE_TYPES } from 'constants/gas';
import { Transaction } from 'constants/transaction';
import { getMaximumGasTotalInHexWei } from 'utils/gas';

const getMaxFeePerGasFromTransaction = (transaction, gasFeeEstimates) => {
  if (gasFeeEstimates?.[transaction?.userFeeLevel]) {
    return gasFeeEstimates[transaction.userFeeLevel].suggestedMaxFeePerGas;
  }
  const { maxFeePerGas, gasPrice } = transaction?.txParam || {};
  return Number(hexWEIToDecGWEI(maxFeePerGas || gasPrice));
};

interface MaxFeePerGasInputType {
  estimateToUse;
  gasEstimateType;
  gasFeeEstimates;
  gasLimit;
  gasPrice;
  supportsEIP1559V2: boolean;
  transaction: Transaction;
}

interface MaxFeePerGasInputReturnType {
  maxFeePerGas: string;
  setMaxFeePerGas: (v: string | null) => void;
  maxFeePerGasFiat: string;
}

/**
 * @param options
 * @param options.supportsEIP1559V2
 * @param options.estimateToUse
 * @param options.gasEstimateType
 * @param options.gasFeeEstimates
 * @param options.gasLimit
 * @param options.gasPrice
 * @param options.transaction
 * @returns {MaxFeePerGasInputReturnType}
 */
export function useMaxFeePerGasInput({
  estimateToUse,
  gasEstimateType,
  gasFeeEstimates,
  gasLimit,
  gasPrice,
  supportsEIP1559V2,
  transaction,
}: MaxFeePerGasInputType): MaxFeePerGasInputReturnType {
  const supportsEIP1559 =
    useSelector(checkNetworkAndAccountSupports1559) &&
    // !isLegacyTransactionParams(transaction.txParam || transaction);
    !isLegacyTransactionParams(transaction.txParam || (transaction as any));

  const { currency: fiatCurrency, numberOfDecimals: fiatNumberOfDecimals } =
    useUserPreferencedCurrency('SECONDARY');

  const showFiat = useSelector(getShouldShowFiat);

  const initialMaxFeePerGas = supportsEIP1559
    ? getMaxFeePerGasFromTransaction(transaction, gasFeeEstimates)
    : 0;

  // This hook keeps track of a few pieces of transitional state. It is
  // transitional because it is only used to modify a transaction in the
  // metamask (background) state tree.
  const [maxFeePerGas, setMaxFeePerGas] = useState(() => {
    if (initialMaxFeePerGas && feeParamsAreCustom(transaction)) {
      return initialMaxFeePerGas;
    }
    return null;
  });

  useEffect(() => {
    if (supportsEIP1559V2 && initialMaxFeePerGas) {
      setMaxFeePerGas(initialMaxFeePerGas);
    }
  }, [initialMaxFeePerGas, setMaxFeePerGas, supportsEIP1559V2]);

  let gasSettings: Record<string, any> = {
    gasLimit: decimalToHex(gasLimit),
  };
  if (supportsEIP1559) {
    gasSettings = {
      ...gasSettings,
      maxFeePerGas: decGWEIToHexWEI(maxFeePerGas || gasPrice || '0'),
    };
  } else if (gasEstimateType === GAS_ESTIMATE_TYPES.NONE) {
    gasSettings = {
      ...gasSettings,
      gasPrice: '0x0',
    };
  } else {
    gasSettings = {
      ...gasSettings,
      gasPrice: decGWEIToHexWEI(gasPrice),
    };
  }

  const maximumCostInHexWei = getMaximumGasTotalInHexWei(gasSettings);

  // We need to display thee estimated fiat currency impact of the maxFeePerGas
  // field to the user. This hook calculates that amount. This also works for
  // the gasPrice amount because in legacy transactions cost is always gasPrice
  // * gasLimit.
  const [, { value: maxFeePerGasFiat }] = useCurrencyDisplay(
    maximumCostInHexWei,
    {
      numberOfDecimals: fiatNumberOfDecimals,
      currency: fiatCurrency,
    }
  );

  // We specify whether to use the estimate value by checking if the state
  // value has been set. The state value is only set by user input and is wiped
  // when the user selects an estimate. Default here is '0' to avoid bignumber
  // errors in later calculations for nullish values.
  const maxFeePerGasToUse =
    maxFeePerGas ??
    getGasFeeEstimate(
      'suggestedMaxFeePerGas',
      gasFeeEstimates,
      gasEstimateType,
      estimateToUse,
      initialMaxFeePerGas || 0
    );

  return {
    maxFeePerGas: maxFeePerGasToUse,
    maxFeePerGasFiat: showFiat ? maxFeePerGasFiat : '',
    setMaxFeePerGas,
  };
}
