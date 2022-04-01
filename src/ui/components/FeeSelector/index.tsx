import React from 'react';
import EIP1559 from './EIP1559';
import Legacy from './legacy';

interface FeeSelectorProps {
  supportsEIP1559: boolean;
  visible: boolean;
  onClose: (...args: any[]) => void;
}

function FeeSelector(props: FeeSelectorProps) {
  const { supportsEIP1559 } = props;
  if (supportsEIP1559) {
    return <EIP1559 {...props}></EIP1559>;
  } else {
    return <Legacy {...props}></Legacy>;
  }
}

export default FeeSelector;
