import { PRIORITY_LEVELS } from 'constants/gas';
import { Transaction } from 'constants/transaction';
import { utils, BigNumber } from 'ethers';
import React, { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGasFeeEstimates } from 'ui/hooks/gas/useGasFeeEstimates';
import { toHumanReadableTime } from 'ui/utils/utils';
import { priorityLevelToI18nKey } from './constant';
import { TierItem } from './TierItem.component';

interface FeeMarketTiersListProps {
  isEIP1559Tx: boolean;
  add10PercentTxParams: Transaction['txParams'];
  gasTierState: [PRIORITY_LEVELS, (x: PRIORITY_LEVELS) => void];
  gasLimit?: string;
}

export function FeeMarketTiersList({
  gasTierState: [selectedGasTier, setGasTier],
  add10PercentTxParams,
  ...props
}: FeeMarketTiersListProps) {
  const { t } = useTranslation();
  const { gasFeeEstimates, isGasEstimatesLoading } = useGasFeeEstimates();
  console.log('isGasEstimatesLoading', isGasEstimatesLoading);
  if (!props.isEIP1559Tx || isGasEstimatesLoading) return null;
  // avoid undefined error
  if (!gasFeeEstimates.low) return null;
  const getEstimatedTimeMinFast = (priorityLevel: string) => {
    const ms =
      priorityLevel === PRIORITY_LEVELS.HIGH
        ? gasFeeEstimates?.high.minWaitTimeEstimate
        : gasFeeEstimates?.low.maxWaitTimeEstimate;
    return toHumanReadableTime(t, ms);
  };
  const parsedMFPG = (tier: string) =>
    utils.parseUnits(gasFeeEstimates[tier].suggestedMaxFeePerGas, 'gwei');
  return (
    <Fragment>
      {[PRIORITY_LEVELS.LOW, PRIORITY_LEVELS.MEDIUM, PRIORITY_LEVELS.HIGH].map(
        (level) => (
          <TierItem
            key={level}
            levelName={t(priorityLevelToI18nKey[level])}
            estimateTime={getEstimatedTimeMinFast(level)}
            gasPrice={parsedMFPG(level)}
            gasLimit={props.gasLimit}
            selected={selectedGasTier == level}
            /**
             * add10Percent's maxFeePerGas > current level of maxFeePerGas
             */
            disabled={BigNumber.from(add10PercentTxParams.maxFeePerGas).gt(
              parsedMFPG(level)
            )}
            onClick={() => setGasTier(level)}
          />
        )
      )}
    </Fragment>
  );
}
