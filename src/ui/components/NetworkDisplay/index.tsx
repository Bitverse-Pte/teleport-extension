import React from 'react';
import './index.less';
import { useSelector } from 'react-redux';
import { getProvider } from 'ui/selectors/selectors';

export default function NetworkDisplay({
  networkName,
}: {
  networkName?: string;
}) {
  const currentProvider = useSelector(getProvider);
  const label = networkName || currentProvider.nickname;
  return <div className="network">{label}</div>;
}
