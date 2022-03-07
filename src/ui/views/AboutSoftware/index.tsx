import React from 'react';
import Header from 'ui/components/Header';
import TeleportLogoURI from 'assets/walletLogo.svg';
import './style.less';
import { useTranslation } from 'react-i18next';
import { IconComponent } from 'ui/components/IconComponents';

export default function AboutSoftware() {
  const version = process.env.version;
  const { t } = useTranslation();
  return (
    <div className="about-software">
      <Header title="About Us" />
      <div className="page-container flex flex-col items-center">
        <img
          src={TeleportLogoURI}
          alt="Teleport Network Logo"
          className="logo"
        />
        <p className="software-version">V {version}</p>
        <p className="software-introductions">
          {t('about_software_introductions', {
            replace: {
              software_name: 'Teleport Wallet',
            },
          })}
        </p>
        <div className="jump-to-home-page cursor-pointer flex">
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
