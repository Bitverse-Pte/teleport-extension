import React, { useContext } from 'react';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { Card } from 'antd';
import './index.less';
import { useSelector } from 'react-redux';
import { getProvider } from 'ui/selectors/selectors';

export default function NetworkDisplay() {
  const currentProvider = useSelector(getProvider);

  const label = currentProvider.nickname;

  return <div className="network">{label}</div>;
}
