import React from 'react';
import Header from 'ui/components/Header';
import TeleportLogoURI from 'assets/walletLogo.png';
import './style.less';
import { useTranslation } from 'react-i18next';
import { IconComponent } from 'ui/components/IconComponents';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';

export default function AboutSoftware() {
  const version = process.env.version;
  const { t } = useTranslation();

  const { isDarkMode } = useDarkmode();

  const onTeleportHomePage = () => {
    window.open('https://teleport.network');
  };

  return (
    <div className={clsx('about-software', { dark: isDarkMode })}>
      <Header title="About" />
      <div className="page-container flex flex-col items-center">
        <img
          src={TeleportLogoURI}
          alt="Teleport Network Logo"
          className="logo"
        />
        <p className="software-version flexR">V {process.env.version}</p>
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
