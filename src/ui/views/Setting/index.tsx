import './style.less';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { IconComponent } from 'ui/components/IconComponents';
import walletLogo from 'assets/walletLogo.svg';
import TeleportText from 'assets/teleportText.svg';
import { useAsyncEffect, useWallet } from 'ui/utils';
import { TipButton } from 'ui/components/Widgets';
import { TipButtonEnum } from 'constants/wallet';
import Switch from 'react-switch';
import { stat } from 'fs';
import { BetaIcon } from 'ui/components/Widgets';

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
    link: 'https://forms.gle/6ZLWmHXZGnioE1uQ6',
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
  return (
    <div className="logo-header flexR">
      <div className="logo-header-left flexR">
        <img src={walletLogo} className="logo-header-left-logo" />
        <img src={TeleportText} className="logo-header-left-title" />
        <BetaIcon />
      </div>
      <div
        className="logo-header-right flexR"
        style={props.hideClosIcon ? { display: 'none' } : {}}
      >
        {props.component && props.component}
        <IconComponent name="close" onClick={props.handleCloseClick} />
      </div>
    </div>
  );
};

export interface ISettingProps {
  handleCloseClick: () => void;
}

const Setting: React.FC<ISettingProps> = (props: ISettingProps) => {
  const history = useHistory();
  const wallet = useWallet();
  const [isDefaultWallet, setIsDefaultWallet] = useState(false);

  const init = async () => {
    const status = await wallet.isDefaultWallet();
    setIsDefaultWallet(status);
  };

  useAsyncEffect(async () => {
    init();
  }, []);

  const handleWalletManageClick = () => {
    history.push('/wallet-manage');
  };

  const handleLockClick = () => {
    history.replace('/unlock');
    wallet.lockWallet();
  };

  const handleDefaultWalletChange = (checked: boolean) => {
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
    <div className="setting flexCol">
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
          onHandleColor="#1484F5"
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
      {SettingFeat.map((setting: ISettingFeat, i) => (
        <div
          className="setting-item flexR cursor"
          key={setting.title}
          onClick={() => jumpToPage(setting)}
        >
          <span className="title">{setting.title}</span>
          <span
            className="tag"
            style={{ display: setting?.opts?.tag ? 'block' : 'none' }}
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
