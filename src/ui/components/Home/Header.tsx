import React, { useContext } from 'react';
import { Button } from 'antd';
import walletLogo from 'assets/walletLogo.svg';
import './style.less';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { IconComponent } from '../IconComponents';
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
        className="network-select-bar relative truncate bg-white pl-3 pr-10 py-2 text-center cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        aria-haspopup="listbox"
        aria-expanded="true"
        aria-labelledby="listbox-label"
      >
        <span className="block truncate network-nickname">
          {networkContext?.currentNetworkController?.provider.nickname}
        </span>
        <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <IconComponent
            name="chevron-down"
            cls="expand-list base-text-color"
          />
        </span>
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
