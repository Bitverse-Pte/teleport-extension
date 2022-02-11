import React, { useContext } from 'react';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { Card } from 'antd';
import './index.less';

export default function NetworkDisplay() {
  const networkContext = useContext(NetworkProviderContext);

  const label = networkContext?.currentNetworkController?.provider.nickname;

  return <div className="network">{label}</div>;
}
