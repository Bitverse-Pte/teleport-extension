import React, { useContext } from 'react';
import { Button } from 'antd';
import walletLogo from 'assets/walletLogo.svg';
import './style.less';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { IconComponent } from '../IconComponents';
import clsx from 'clsx';
import SettingIcon from 'assets/settingIcon.svg';
import { useSelector } from 'react-redux';
import { getProvider } from 'ui/selectors/selectors';
export function HomeHeader({
  menuOnClick,
  networkOnClick,
}: {
  menuOnClick: React.MouseEventHandler;
  networkOnClick: React.MouseEventHandler;
}) {
  const currentProvider = useSelector(getProvider);
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
          {currentProvider.nickname}
        </span>
        <IconComponent name="chevron-down" cls="expand-list base-text-color" />
      </button>
      <img
        src={SettingIcon}
        style={{ transform: 'scale(1.5)' }}
        className="expand-menu-btn cursor"
        onClick={menuOnClick}
      />
      {/* <Button type="text" className="expand-menu-btn" >
        <IconComponent
          name="menu"
          cls="expand-menu-btn-icon base-text-color "
        />
      </Button> */}
    </div>
  );
}
