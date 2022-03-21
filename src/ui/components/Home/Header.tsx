import React, { useContext } from 'react';
import { Button } from 'antd';
import walletLogo from 'assets/logoBeta.png';
import './style.less';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { IconComponent } from '../IconComponents';
import clsx from 'clsx';
export function HomeHeader({
  menuOnClick,
  networkOnClick,
}: {
  menuOnClick: React.MouseEventHandler;
  networkOnClick: React.MouseEventHandler;
}) {
  const networkContext = useContext(NetworkProviderContext);
  return (
    <div className="flex headerOfMenu justify-between items-center">
      <div className="logo-container">
        <img src={walletLogo} />
      </div>
      <button
        type="button"
        onClick={networkOnClick}
        className={clsx(
          'network-select-bar relative truncate bg-white text-center cursor-pointer sm:text-sm',
          'flex justify-center items-center'
        )}
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="listbox-label"
      >
        <span className="block truncate network-nickname">
          {networkContext?.currentNetworkController?.provider.nickname}
        </span>
        <IconComponent name="chevron-down" cls="expand-list base-text-color" />
      </button>
      <Button type="text" className="expand-menu-btn" onClick={menuOnClick}>
        <IconComponent
          name="menu"
          cls="expand-menu-btn-icon base-text-color "
        />
      </Button>
    </div>
  );
}
