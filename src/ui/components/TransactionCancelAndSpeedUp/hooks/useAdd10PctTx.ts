import { PRIORITY_LEVELS } from 'constants/gas';
import { Transaction } from 'constants/transaction';
import { BigNumber, utils } from 'ethers';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { addTenPercentAndRound as _addTenPercentAndRound } from 'ui/helpers/utils/gas';
import { useGasFeeEstimates } from 'ui/hooks/gas/useGasFeeEstimates';
import { toHumanReadableTime } from 'ui/utils/utils';

const addTenPercentAndRound = (hexStr?: string) =>
  _addTenPercentAndRound(hexStr)?.split('.')[0];

export function useAdd10PctTxParams(
  transaction: Transaction,
  gasLimit?: string
) {
  const { t } = useTranslation();
  const { gasFeeEstimates } = useGasFeeEstimates();

  const add10PercentTxParams = useMemo(() => {
    return {
      ...transaction.txParams,
      // default will add 10% because it's a override tx(for both speedup and cancel)
      estimateSuggested: PRIORITY_LEVELS.TEN_PERCENT_INCREASED,
      estimateUsed: PRIORITY_LEVELS.TEN_PERCENT_INCREASED,
      maxFeePerGas: addTenPercentAndRound(transaction.txParams.maxFeePerGas),
      maxPriorityFeePerGas: addTenPercentAndRound(
        transaction.txParams.maxPriorityFeePerGas
      ),
      gasPrice: addTenPercentAndRound(transaction.txParams.gasPrice),
      gas: gasLimit,
      gasLimit,
    };
  }, [transaction, gasLimit]);

  const add10PctEstimate = useMemo<string>(() => {
    if (!gasFeeEstimates) return '--';

    try {
      const ms = BigNumber.from(
        add10PercentTxParams.maxFeePerGas?.split('.')[0]
      ).gt(
        utils.parseUnits(gasFeeEstimates?.high.suggestedMaxFeePerGas, 'gwei')
      )
        ? gasFeeEstimates?.high.minWaitTimeEstimate
        : gasFeeEstimates?.low.maxWaitTimeEstimate;
      return toHumanReadableTime(t, ms);
    } catch (error) {
      return '--';
    }
  }, [add10PercentTxParams, gasFeeEstimates]);

  return [add10PercentTxParams, add10PctEstimate] as const;
}
