import React from 'react';
import Header from 'ui/components/Header';
import TeleportLogoURI from 'assets/walletLogo.svg';
import './style.less';
import { useTranslation } from 'react-i18next';
import { IconComponent } from 'ui/components/IconComponents';
import { BetaIcon } from 'ui/components/Widgets';

export default function AboutSoftware() {
  const version = process.env.version;
  const { t } = useTranslation();

  const onTeleportHomePage = () => {
    window.open('https://teleport.network');
  };

  return (
    <div className="about-software">
      <Header title="About" />
      <div className="page-container flex flex-col items-center">
        <img
          src={TeleportLogoURI}
          alt="Teleport Network Logo"
          className="logo"
        />
        <p className="software-version flexR">
          V {process.env.version}
          <BetaIcon />
        </p>
        <p className="software-introductions">
          {t('about_software_introductions', {
            replace: {
              software_name: 'Teleport Wallet',
            },
          })}
        </p>
        <div
          className="jump-to-home-page cursor-pointer flex"
          onClick={onTeleportHomePage}
        >
          <img
            src={TeleportLogoURI}
            alt="Teleport Network Logo"
            className="web-icon"
          />
          <span className="url">https://teleport.network</span>
          <IconComponent name="chevron-right" cls="ml-auto" />
        </div>
      </div>
    </div>
  );
}
