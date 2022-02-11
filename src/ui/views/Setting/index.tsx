import './style.less';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IconComponent } from 'ui/components/IconComponents';
import walletLogo from 'assets/walletLogo.svg';
import { useWallet } from 'ui/utils';
import { TipButton } from 'ui/components/Widgets';
import { TipButtonEnum } from 'constants/wallet';

interface ISettingFeat {
  title: string;
  link: string;
  opts?: any;
}

const SettingFeat: ISettingFeat[] = [
  {
    title: 'Exchange',
    link: '/exchange',
    opts: {
      tag: 'USD',
    },
  },
  {
    title: 'Language',
    link: '/language',
    opts: {
      tag: 'English',
    },
  },
  {
    title: 'Address Book',
    link: '/address-book',
  },
  {
    title: 'Safety Setting',
    link: '/safety setting',
  },
  {
    title: 'About Me',
    link: '/about',
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
        <span className="logo-header-left-title">Teleport Wallet</span>
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

  const handleWalletManageClick = () => {
    history.push('/wallet-manage');
  };

  const handleLockClick = () => {
    history.replace('/unlock');
    wallet.lockWallet();
  };

  return (
    <div className="setting flexCol">
      <LogoHeader handleCloseClick={props.handleCloseClick} />
      <div className="setting-button-container content-wrap-padding flex">
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
      {SettingFeat.map((setting: ISettingFeat) => (
        <div className="setting-item flex cursor" key={setting.title}>
          <span className="title">{setting.title}</span>
          <span
            className="tag"
            style={{ display: setting?.opts?.tag ? 'block' : 'none' }}
          >
            {setting?.opts?.tag}
          </span>
          <IconComponent name="chevron-right" cls="base-text-color" />
        </div>
      ))}
    </div>
  );
};

export default Setting;
