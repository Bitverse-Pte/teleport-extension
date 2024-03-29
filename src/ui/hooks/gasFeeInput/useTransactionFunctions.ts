import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { EDIT_GAS_MODES, PRIORITY_LEVELS } from 'constants/gas';
import { decGWEIToHexWEI, decimalToHex } from 'ui/utils/conversion';
import { addTenPercentAndRound } from 'ui/helpers/utils/gas';
import {
  createCancelTransaction,
  createSpeedUpTransaction,
  updateTransaction as updateTransactionFn,
} from 'ui/state/actions';
import { Transaction } from 'constants/transaction';
import type { GasFeeEstimates } from '@metamask/controllers';

interface ParamsOfuseTransactionFunctions {
  defaultEstimateToUse: any;
  editGasMode: EDIT_GAS_MODES;
  estimatedBaseFee: string;
  gasFeeEstimates: GasFeeEstimates;
  gasLimit: number;
  maxPriorityFeePerGas: number | null;
  transaction: Transaction;
}

export const useTransactionFunctions = ({
  defaultEstimateToUse,
  editGasMode,
  estimatedBaseFee,
  gasFeeEstimates,
  gasLimit: gasLimitValue,
  maxPriorityFeePerGas: maxPriorityFeePerGasValue,
  transaction,
}: ParamsOfuseTransactionFunctions) => {
  const dispatch = useDispatch();
  const getTxMeta = useCallback(() => {
    if (
      (editGasMode !== EDIT_GAS_MODES.CANCEL &&
        editGasMode !== EDIT_GAS_MODES.SPEED_UP) ||
      transaction.previousGas
    ) {
      return {};
    }
    const { maxFeePerGas, maxPriorityFeePerGas, gasLimit } =
      transaction.txParams;
    return {
      previousGas: {
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasLimit,
      },
    };
  }, [editGasMode, transaction?.previousGas, transaction?.txParams]);
  const updateTransaction = useCallback(
    ({
      estimateUsed,
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasPrice,
      estimateSuggested,
    }) => {
      const newGasSettings: any = {
        gas: decimalToHex(gasLimit || gasLimitValue),
        gasLimit: decimalToHex(gasLimit || gasLimitValue),
        estimateSuggested: estimateSuggested || defaultEstimateToUse,
        estimateUsed,
      };
      if (maxFeePerGas) {
        newGasSettings.maxFeePerGas = maxFeePerGas;
      }
      if (maxPriorityFeePerGas) {
        newGasSettings.maxPriorityFeePerGas =
          maxPriorityFeePerGas || decGWEIToHexWEI(maxPriorityFeePerGasValue);
      }
      if (gasPrice) {
        newGasSettings.gasPrice = gasPrice;
      }
      const txMeta = getTxMeta();
      const updatedTxMeta: Transaction = {
        ...transaction,
        userFeeLevel: estimateUsed || PRIORITY_LEVELS.CUSTOM,
        txParams: {
          ...transaction.txParams,
          ...newGasSettings,
        },
        ...txMeta,
      };
      /**
       * Disabled because we do not have swap feature now
       */
      // if (editGasMode === EDIT_GAS_MODES.SWAPS) {
      //   dispatch(
      //     updateSwapsUserFeeLevel(estimateUsed || PRIORITY_LEVELS.CUSTOM)
      //   );
      //   dispatch(updateCustomSwapsEIP1559GasParams(newGasSettings));
      // } else {
      dispatch(updateTransactionFn(updatedTxMeta));
      // }
    },
    [
      defaultEstimateToUse,
      dispatch,
      editGasMode,
      gasLimitValue,
      getTxMeta,
      maxPriorityFeePerGasValue,
      transaction,
    ]
  );
  const cancelTransaction = useCallback(() => {
    dispatch(
      createCancelTransaction(transaction.id, transaction.txParams, {
        estimatedBaseFee,
      })
    );
  }, [dispatch, estimatedBaseFee, transaction]);
  const speedUpTransaction = useCallback(() => {
    dispatch(
      createSpeedUpTransaction(transaction.id, transaction.txParams, {
        estimatedBaseFee,
      })
    );
  }, [dispatch, estimatedBaseFee, transaction]);
  const cancelTransactionWithTxParams = useCallback(
    (txParams: Transaction['txParams']) => {
      console.debug('cancelTransactionWithTxParams', txParams);
      dispatch(
        createCancelTransaction(transaction.id, txParams, {
          estimatedBaseFee,
        })
      );
    },
    [dispatch, estimatedBaseFee, transaction]
  );
  const speedUpTransactionWithTxParams = useCallback(
    (txParams: Transaction['txParams']) => {
      console.debug('speedUpTransactionWithTxParams', txParams);
      dispatch(
        createSpeedUpTransaction(transaction.id, txParams, {
          estimatedBaseFee,
        })
      );
    },
    [dispatch, estimatedBaseFee, transaction]
  );
  const updateTransactionToTenPercentIncreasedGasFee = useCallback(
    (initTransaction = false) => {
      const {
        gas: gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
      } = transaction.previousGas || transaction.txParams;
      updateTransaction({
        estimateSuggested: initTransaction
          ? defaultEstimateToUse
          : PRIORITY_LEVELS.TEN_PERCENT_INCREASED,
        estimateUsed: PRIORITY_LEVELS.TEN_PERCENT_INCREASED,
        gasLimit,
        maxFeePerGas: addTenPercentAndRound(maxFeePerGas),
        maxPriorityFeePerGas: addTenPercentAndRound(maxPriorityFeePerGas),
      });
    },
    [defaultEstimateToUse, transaction, updateTransaction]
  );
  const updateTransactionUsingEstimate = useCallback(
    (gasFeeEstimateToUse) => {
      if (!gasFeeEstimates[gasFeeEstimateToUse]) {
        return;
      }
      const { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas } =
        gasFeeEstimates[gasFeeEstimateToUse];
      updateTransaction({
        estimateUsed: gasFeeEstimateToUse,
        maxFeePerGas: decGWEIToHexWEI(suggestedMaxFeePerGas),
        maxPriorityFeePerGas: decGWEIToHexWEI(suggestedMaxPriorityFeePerGas),
      });
    },
    [gasFeeEstimates, updateTransaction]
  );
  const updateTransactionUsingDAPPSuggestedValues = useCallback(() => {
    const { maxFeePerGas, maxPriorityFeePerGas } =
      transaction.dappSuggestedGasFees!;
    updateTransaction({
      estimateUsed: PRIORITY_LEVELS.DAPP_SUGGESTED,
      maxFeePerGas,
      maxPriorityFeePerGas,
    });
  }, [transaction, updateTransaction]);
  return {
    cancelTransaction,
    speedUpTransaction,
    cancelTransactionWithTxParams,
    speedUpTransactionWithTxParams,
    updateTransaction,
    updateTransactionToTenPercentIncreasedGasFee,
    updateTransactionUsingDAPPSuggestedValues,
    updateTransactionUsingEstimate,
  };
};
