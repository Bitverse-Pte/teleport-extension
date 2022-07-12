import clsx from 'clsx';
import { BigNumber, utils } from 'ethers';
import React from 'react';
import { useSelector } from 'react-redux';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import { getCurrentProviderNativeToken } from 'ui/selectors/selectors';

interface TierItemProps {
  levelName: string;
  estimateTime: string;
  gasPrice: BigNumber;
  gasLimit?: string | number;
  selected: boolean;
  disabled?: boolean;
  fast?: boolean;
  onClick?: (e: any) => void;
}

export const TierItem = ({
  levelName,
  estimateTime,
  gasPrice,
  gasLimit = 21000,
  selected,
  onClick,
  ...props
}: TierItemProps) => {
  const nativeToken = useSelector(getCurrentProviderNativeToken);

  return (
    <div
      className={clsx('tier', {
        selected: selected,
        disabled: props.disabled,
      })}
      onClick={
        !props.disabled
          ? onClick
          : () =>
              ClickToCloseMessage.error(
                'Not enough to replace the old transaction'
              )
      }
    >
      <div className="level-name bold">{levelName}</div>
      <div
        className={clsx('estimate-time narrow-letter-spacing', {
          fast: props.fast,
          bold: props.fast,
        })}
      >
        {estimateTime}
      </div>
      <div className="maximum-charge">
        <span className="amount narrow-letter-spacing">
          {utils.formatEther(gasPrice.mul(gasLimit))}
        </span>
        {nativeToken?.symbol}
      </div>
    </div>
  );
};
