import React from 'react';
import { useSelector } from 'react-redux';
import { categoryToIconSVG } from 'ui/utils/networkCategoryToIcon';
import { IconComponent } from '../IconComponents';
import './style.less';

interface SwitchChainCardProps {
  toChain: {
    category: string;
    nickname: string;
  };
}

export function SwitchChainCard({ toChain }: SwitchChainCardProps) {
  const currentNetwork = useSelector((state) => state.network.provider);

  return (
    <div className="flex items-center justify-center switch-chain-card">
      <div className="from-chain chain-card flex-wrap">
        <img
          src={categoryToIconSVG(currentNetwork.category)}
          className="chain-icon"
        />
        <span className="chain-nickname">{currentNetwork.nickname}</span>
      </div>
      <IconComponent name="chevron-right" cls="grey-05 to-icon" />
      <div className="to-chain chain-card flex-wrap">
        <img src={categoryToIconSVG(toChain.category)} className="chain-icon" />
        <span className="chain-nickname">{toChain.nickname}</span>
      </div>
    </div>
  );
}
