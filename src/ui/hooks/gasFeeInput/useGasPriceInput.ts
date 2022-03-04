import { useState } from 'react';
import { isEqual } from 'lodash';
import { CUSTOM_GAS_ESTIMATE, GAS_ESTIMATE_TYPES } from 'constants/gas';
import { hexWEIToDecGWEI } from 'utils/conversion';
import { isLegacyTransaction } from 'utils/transaction.utils';
import { feeParamsAreCustom } from './utils';
import { Transaction } from 'constants/transaction';

// import {
//   GAS_ESTIMATE_TYPES,
//   CUSTOM_GAS_ESTIMATE,
// } from '../../../shared/constants/gas';
// import { hexWEIToDecGWEI } from '../../helpers/utils/conversions.util';
// import { isLegacyTransaction } from '../../helpers/utils/transactions.util';

// import { feeParamsAreCustom } from './utils';

function getGasPriceEstimate(
  gasFeeEstimates,
  gasEstimateType: GAS_ESTIMATE_TYPES,
  estimateToUse
) {
  if (gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY) {
    return gasFeeEstimates?.[estimateToUse] ?? '0';
  } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
    return gasFeeEstimates?.gasPrice ?? '0';
  }
  return '0';
}

interface useGasPriceInputParams {
  estimateToUse;
  gasEstimateType: GAS_ESTIMATE_TYPES;
  gasFeeEstimates;
  transaction: Transaction;
}

interface GasPriceInputsReturnType {
  gasPrice: string;
  setGasPrice: (v: number | null) => void;
  setGasPriceHasBeenManuallySet: (v: boolean) => void;
}

export function useGasPriceInput({
  estimateToUse,
  gasEstimateType,
  gasFeeEstimates,
  transaction,
}: useGasPriceInputParams): GasPriceInputsReturnType {
  const [gasPriceHasBeenManuallySet, setGasPriceHasBeenManuallySet] = useState(
    transaction?.userFeeLevel === CUSTOM_GAS_ESTIMATE
  );

  const [gasPrice, setGasPrice] = useState(() => {
    const { gasPrice: txGasPrice } = transaction?.txParams || {};
    return txGasPrice && feeParamsAreCustom(transaction)
      ? Number(hexWEIToDecGWEI(txGasPrice))
      : null;
  });

  const [initialGasPriceEstimates] = useState(gasFeeEstimates);
  const gasPriceEstimatesHaveNotChanged = isEqual(
    initialGasPriceEstimates,
    gasFeeEstimates
  );

  const gasPriceToUse =
    gasPrice !== null &&
    (gasPriceHasBeenManuallySet ||
      gasPriceEstimatesHaveNotChanged ||
      // isLegacyTransaction(transaction?.txParams))
      // code from mm
      // typing is error, tried to any this
      isLegacyTransaction(transaction?.txParams as any))
      ? gasPrice
      : getGasPriceEstimate(gasFeeEstimates, gasEstimateType, estimateToUse);

  return {
    gasPrice: gasPriceToUse,
    setGasPrice,
    setGasPriceHasBeenManuallySet,
  };
}
