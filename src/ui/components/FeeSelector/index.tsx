import React from 'react';
import EIP1559 from './EIP1559';
import Legacy from './legacy';
import CosmosFee from './cosmos';
import { Currency } from '@keplr-wallet/types';
import { StdFee } from '@cosmjs/launchpad';
interface FeeSelectorProps {
  visible: boolean;
  onClose: (...args: any[]) => void;
  gasLimit?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  supportsEIP1559?: boolean;
  isCosmos?: boolean;
  currency?: Currency;
  customGas?: Partial<StdFee>;
  chainId?: string;
}

function FeeSelector(props: FeeSelectorProps) {
  const { supportsEIP1559 = false, isCosmos = false } = props;
  if (supportsEIP1559) {
    return <EIP1559 {...props}></EIP1559>;
  }
  if (isCosmos) {
    return <CosmosFee {...props}></CosmosFee>;
  }
  return <Legacy {...props}></Legacy>;
}

export default FeeSelector;
