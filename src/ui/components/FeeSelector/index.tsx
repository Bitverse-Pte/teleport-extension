import React from 'react';
import EIP1559 from './EIP1559';
import Legacy from './legacy';

function FeeSelector(props) {
  const { supportsEIP1559 } = props;
  if (supportsEIP1559) {
    return <EIP1559 {...props}></EIP1559>;
  } else {
    return <Legacy {...props}></Legacy>;
  }
}

export default FeeSelector;
