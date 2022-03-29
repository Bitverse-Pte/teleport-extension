import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BigNumber from 'bignumber.js';

// import { GAS_ESTIMATE_TYPES } from '@metamask/controllers';
import { usePrevious } from 'react-use';
import { GAS_ESTIMATE_TYPES, GAS_FORM_ERRORS } from 'constants/gas';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';
import {
  getGasEstimateType,
  getGasFeeEstimates,
  getIsGasEstimatesLoading,
} from 'ui/selectors/selectors';
import { useWallet } from 'ui/utils';

// import { GAS_ESTIMATE_TYPES } from '../../../../shared/constants/gas';

// import { usePrevious } from '../../../hooks/usePrevious';
// import { I18nContext } from '../../../contexts/i18n';

// import {
//   getGasEstimateType,
//   getGasFeeEstimates,
//   getIsGasEstimatesLoading,
// } from '../../../ducks/metamask/metamask';

// import h6 from '../../ui/h6/h6';
// import {
//   h6,
//   FONT_WEIGHT,
// } from '../../../helpers/constants/design-system';
// import InfoTooltip from '../../ui/info-tooltip/info-tooltip';

// import { getGasFeeTimeEstimate } from '../../../store/actions';
// import { GAS_FORM_ERRORS } from '../../../helpers/constants/gas';
// import { useGasFeeContext } from '../../../contexts/gasFee';

// Once we reach this second threshold, we switch to minutes as a unit
const SECOND_CUTOFF = 90;
// eslint-disable-next-line prefer-destructuring
const EIP_1559_V2 = process.env.EIP_1559_V2;

// Shows "seconds" as unit of time if under SECOND_CUTOFF, otherwise "minutes"
const toHumanReadableTime = (milliseconds = 1, t: any) => {
  const seconds = Math.ceil(milliseconds / 1000);
  if (seconds <= SECOND_CUTOFF) {
    return t('gasTimingSeconds', { replace: { $1: seconds } });
  }
  return t('gasTimingMinutes', { replace: { $1: Math.ceil(seconds / 60) } });
};

interface GasTimingPropTypes {
  maxPriorityFeePerGas: string | number;
  maxFeePerGas: string | number;
  gasWarnings?: any;
}

export default function GasTiming({
  maxFeePerGas = 0,
  maxPriorityFeePerGas = 0,
  gasWarnings,
}: GasTimingPropTypes) {
  const wallet = useWallet();
  const gasEstimateType = useSelector(getGasEstimateType);
  const gasFeeEstimates = useSelector(getGasFeeEstimates);
  const isGasEstimatesLoading = useSelector(getIsGasEstimatesLoading);

  const [customEstimatedTime, setCustomEstimatedTime] = useState<any>(null);
  const { t } = useTranslation();
  // @todo: useGasFeeContext()
  // const { estimateUsed } = useGasFeeContext();
  const estimateUsed = 'low';

  // If the user has chosen a value lower than the low gas fee estimate,
  // We'll need to use the useEffect hook below to make a call to calculate
  // the time to show
  const isUnknownLow =
    gasFeeEstimates?.low &&
    Number(maxPriorityFeePerGas) <
      Number(gasFeeEstimates.low.suggestedMaxPriorityFeePerGas);

  const previousMaxFeePerGas = usePrevious(maxFeePerGas);
  const previousMaxPriorityFeePerGas = usePrevious(maxPriorityFeePerGas);
  const previousIsUnknownLow = usePrevious(isUnknownLow);

  useEffect(() => {
    const priority = maxPriorityFeePerGas;
    const fee = maxFeePerGas;

    if (
      isUnknownLow ||
      (priority && priority !== previousMaxPriorityFeePerGas) ||
      (fee && fee !== previousMaxFeePerGas)
    ) {
      // getGasFeeTimeEstimate requires parameters in string format
      wallet
        .getGasFeeTimeEstimate(
          new BigNumber(priority, 10).toString(10),
          new BigNumber(fee, 10).toString(10)
        )
        .then((result) => {
          if (maxFeePerGas === fee && maxPriorityFeePerGas === priority) {
            setCustomEstimatedTime(result);
          }
        });
    }

    if (isUnknownLow !== false && previousIsUnknownLow === true) {
      setCustomEstimatedTime(null);
    }
  }, [
    maxPriorityFeePerGas,
    maxFeePerGas,
    isUnknownLow,
    previousMaxFeePerGas,
    previousMaxPriorityFeePerGas,
    previousIsUnknownLow,
  ]);

  let unknownProcessingTimeText: React.ReactNode | undefined;
  if (EIP_1559_V2) {
    unknownProcessingTimeText = t('editGasTooLow');
  } else {
    unknownProcessingTimeText = (
      // <>
      <Tooltip placement="top" title={t('editGasTooLowTooltip')}>
        {t('editGasTooLow')}
      </Tooltip>
      // </>
    );
  }

  if (
    gasWarnings?.maxPriorityFee === GAS_FORM_ERRORS.MAX_PRIORITY_FEE_TOO_LOW ||
    gasWarnings?.maxFee === GAS_FORM_ERRORS.MAX_FEE_TOO_LOW
  ) {
    return (
      <h6
        style={{ fontWeight: 'bold' }}
        className={classNames('gas-timing', 'gas-timing--negative')}
      >
        {unknownProcessingTimeText}
      </h6>
    );
  }

  // Don't show anything if we don't have enough information
  if (
    isGasEstimatesLoading ||
    gasEstimateType !== GAS_ESTIMATE_TYPES.FEE_MARKET
  ) {
    return null;
  }

  const { low = {}, medium = {}, high = {} } = gasFeeEstimates;

  let text: React.ReactNode = '';
  let attitude = 'positive';

  // Anything medium or faster is positive
  if (
    Number(maxPriorityFeePerGas) >= Number(medium.suggestedMaxPriorityFeePerGas)
  ) {
    // High+ is very likely, medium is likely
    if (
      Number(maxPriorityFeePerGas) < Number(high.suggestedMaxPriorityFeePerGas)
    ) {
      // Medium
      text = t('gasTimingPositive', {
        replace: { $1: toHumanReadableTime(low.maxWaitTimeEstimate, t) },
      });
    } else {
      // High
      text = t('gasTimingVeryPositive', {
        replace: {
          $1: toHumanReadableTime(high.minWaitTimeEstimate, t),
        },
      });
    }
  } else {
    if (!EIP_1559_V2 || estimateUsed === 'low') {
      attitude = 'negative';
    }
    // If the user has chosen a value less than our low estimate,
    // calculate a potential wait time
    if (isUnknownLow) {
      // If we didn't get any useful information, show the
      // "unknown processing time" message
      if (
        !customEstimatedTime ||
        customEstimatedTime === 'unknown' ||
        customEstimatedTime?.upperTimeBound === 'unknown'
      ) {
        text = unknownProcessingTimeText;
      } else {
        text = t('gasTimingNegative', {
          $1: toHumanReadableTime(
            Number(customEstimatedTime?.upperTimeBound),
            t
          ),
        });
      }
    }
    // code below needs to cleaned-up once EIP_1559_V2 flag is removed
    else if (EIP_1559_V2) {
      text = t('gasTimingNegative', {
        replace: { $1: toHumanReadableTime(low.maxWaitTimeEstimate, t) },
      });
    } else {
      text = (
        <Tooltip placement="top" title={t('editGasTooLowWarningTooltip')}>
          {t('gasTimingNegative', {
            replace: {
              $1: toHumanReadableTime(low.maxWaitTimeEstimate, t),
            },
          })}
        </Tooltip>
      );
    }
  }

  return (
    <h6
      className={classNames('gas-timing', {
        [`gas-timing--${attitude}`]: attitude && !EIP_1559_V2,
        [`gas-timing--${attitude}-V2`]: attitude && EIP_1559_V2,
      })}
    >
      {text}
    </h6>
  );
}
