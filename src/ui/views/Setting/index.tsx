import './style.less';
import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { IconComponent } from 'ui/components/IconComponents';
import walletLogo from 'assets/walletLogo.png';
import { ReactComponent as TeleportTextSVG } from 'assets/teleportText.svg';
import { ReactComponent as LightIcon } from 'assets/theme/light.svg';
import { ReactComponent as MoonIcon } from 'assets/theme/moon.svg';
import { ReactComponent as SystemIcon } from 'assets/theme/system.svg';
import { useAsyncEffect, useWallet } from 'ui/utils';
import { TipButton } from 'ui/components/Widgets';
import { TipButtonEnum } from 'constants/wallet';
import Switch from 'react-switch';
import skynet from 'utils/skynet';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
const { sensors } = skynet;
interface ISettingFeat {
  title: string;
  link?: string;
  opts?: any;
  showChevronRight?: boolean;
}

const SettingFeat: ISettingFeat[] = [
  {
    title: 'Currency',
    // link: '/exchange',
    opts: {
      tag: 'USD',
    },
  },
  {
    title: 'Language',
    // link: '/language',
    opts: {
      tag: 'English',
    },
  },
  {
    title: 'Support',
    /**
     * link start with http(s) will be open in a new page
     * since it's not in the extension's context
     */
    link: 'https://docs.teleportwallet.io/',
    showChevronRight: true,
  },
  {
    title: 'About',
    link: '/about',
    showChevronRight: true,
  },
];

export interface ILogoHeader {
  component?: any;
  handleCloseClick?: () => void;
  hideClosIcon?: boolean;
}

export const LogoHeader: React.FC<ILogoHeader> = (props) => {
  const { isDarkMode } = useDarkmode();
  return (
    <div className={clsx('logo-header flexR', { dark: isDarkMode })}>
      <div className="logo-header-left flexR">
        <img src={walletLogo} className="logo-header-left-logo" />
        {/* <img src={TeleportText} className="logo-header-left-title" /> */}
        <TeleportTextSVG className="logo-header-left-title" />
      </div>
      <div
        className="logo-header-right flexR"
        style={props.hideClosIcon ? { display: 'none' } : {}}
      >
        {props.component && props.component}
        <IconComponent
          name="close"
          onClick={props.handleCloseClick}
          cls="icon-close"
        />
      </div>
    </div>
  );
};

export interface ISettingProps {
  handleCloseClick: () => void;
}

const Setting: React.FC<ISettingProps> = (props: ISettingProps) => {
  const history = useHistory();
  const location = useLocation();
  const wallet = useWallet();
  const { isDarkMode, setDarkmode, darkmodeSetting } = useDarkmode();
  const [isDefaultWallet, setIsDefaultWallet] = useState(false);

  const init = async () => {
    const status = await wallet.isDefaultWallet();
    setIsDefaultWallet(status);
  };

  useAsyncEffect(async () => {
    init();
  }, []);

  const handleWalletManageClick = () => {
    sensors.track('teleport_setting_manage_wallet', {
      page: location.pathname,
    });
    history.push('/wallet-manage');
  };

  const handleLockClick = () => {
    sensors.track('teleport_setting_lock', {
      page: location.pathname,
    });
    history.replace('/unlock');
    wallet.setManualLocked(true);
    wallet.lockWallet();
  };

  const handleDefaultWalletChange = (checked: boolean) => {
    sensors.track('teleport_setting_default', {
      page: location.pathname,
      params: { default: checked },
    });
    wallet.setIsDefaultWallet(checked);
    setIsDefaultWallet(checked);
  };

  const jumpToPage = (setting: ISettingFeat) => {
    console.debug('jumpToPage', setting);
    if (setting.link) {
      if (setting.link.slice(0, 4) !== 'http') history.push(setting.link);
      else window.open(setting.link);
    } else
      console.warn(
        `'link' for ${setting.title} is undefined, click will be ignored. Please edit in ui/views/Setting/index.tsx about the 'SettingFeat'`
      );
  };

  return (
    <div className={clsx('setting flexCol', { dark: isDarkMode })}>
      <LogoHeader handleCloseClick={props.handleCloseClick} />
      <div className="setting-button-container content-wrap-padding flexR">
        <TipButton
          title="Manage Wallet"
          type={TipButtonEnum.WALLET_MANAGE}
          handleClick={handleWalletManageClick}
        />
        <TipButton
          title="Lock"
          type={TipButtonEnum.LOCK}
          handleClick={handleLockClick}
        />
      </div>
      <div className="setting-item flexR cursor" key="isDefault">
        <span className="title">Default Wallet</span>
        <span className="tag" style={{ display: 'none' }}></span>
        <Switch
          onColor="#CDEBFF"
          onHandleColor="#56FAA5"
          offColor="#A3B4CC"
          offHandleColor="#FFFFFF"
          uncheckedIcon={false}
          checkedIcon={false}
          height={20}
          width={36}
          checked={isDefaultWallet}
          onChange={handleDefaultWalletChange}
        />
      </div>
      <div
        className="setting-item flexR cursor theme-selection-bar"
        key="theme-select"
      >
        <span className="title">Theme</span>
        <span className="tag" style={{ display: 'none' }}></span>
        <div className="theme-buttons">
          <button
            className={clsx({
              selected: darkmodeSetting === 'light',
            })}
            onClick={() => setDarkmode('light')}
          >
            <LightIcon />
          </button>
          <button
            className={clsx({
              selected: darkmodeSetting === 'dark',
            })}
            onClick={() => setDarkmode('dark')}
          >
            <MoonIcon />
          </button>
          <button
            className={clsx({
              selected: darkmodeSetting === 'system',
            })}
            onClick={() => setDarkmode('system')}
          >
            <SystemIcon />
          </button>
        </div>
      </div>
      {SettingFeat.map((setting: ISettingFeat, i) => (
        <div
          className="setting-item flexR cursor"
          key={setting.title}
          onClick={() => jumpToPage(setting)}
        >
          <span className="title">{setting.title}</span>
          <span
            className="tag"
            style={{ display: setting?.opts?.tag ? 'contents' : 'none' }}
          >
            {setting?.opts?.tag}
          </span>
          {setting.showChevronRight ? (
            <IconComponent name="chevron-right" cls="base-text-color" />
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default Setting;
