import React, { useContext } from 'react';
import { Button } from 'antd';
import walletLogo from 'assets/logo.svg';
import './style.less';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { IconComponent } from '../IconComponents';
import clsx from 'clsx';
import SettingIcon from 'assets/settingIcon.svg';
import { ReactComponent as SettingLogo } from 'assets/settingIcon.svg';
import { useSelector } from 'react-redux';
import { getProvider } from 'ui/selectors/selectors';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import { useWallet, useWalletRequest } from 'ui/utils';
import { keygenMPC } from 'ui/utils/mpc.utils';

export function HomeHeader({
  menuOnClick,
  networkOnClick,
}: {
  menuOnClick: React.MouseEventHandler;
  networkOnClick: React.MouseEventHandler;
}) {
  const { isDarkMode } = useDarkmode();
  const currentProvider = useSelector(getProvider);
  const wallet = useWallet();
  const expandClick = (e) => {
    chrome.tabs.create({ url: location.href });
  };
  const keygenMPCClick = async (e) => {
    const rtn = await keygenMPC();
    // const rtn = await wallet.keygenMPC();
    console.log(rtn, '-------keygenMPC rtn');
  };
  return (
    <div
      className={clsx('flex headerOfMenu justify-between items-center', {
        dark: isDarkMode,
      })}
    >
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
      {/* <img
        src={SettingIcon}
        style={{ transform: 'scale(1.5)' }}
        className="expand-menu-btn cursor"
        onClick={menuOnClick}
      /> */}
      <button className="expand-menu-btn cursor" onClick={expandClick}>
        expand
      </button>
      <button className="expand-menu-btn cursor" onClick={keygenMPCClick}>
        keygenMPC
      </button>
      <button className="expand-menu-btn cursor" onClick={menuOnClick}>
        <SettingLogo />
      </button>
      {/* <Button type="text" className="expand-menu-btn" >
        <IconComponent
          name="menu"
          cls="expand-menu-btn-icon base-text-color "
        />
      </Button> */}
    </div>
  );
}
