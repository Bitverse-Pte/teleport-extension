import React from 'react';
import Header from 'ui/components/Header';
import BitverseLogoImg from 'assets/logo.svg';
import QrCodeImg_Android from 'assets/qc_android.png';
import QrCodeImg_IOS from 'assets/qc_ios.png';
import './style.less';
import { useTranslation } from 'react-i18next';
import { IconComponent } from 'ui/components/IconComponents';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
import { ReactComponent as TlpTextLogo } from 'assets/teleportText.svg';

export default function AboutSoftware() {
  const version = process.env.version;
  const { t } = useTranslation();

  const { isDarkMode } = useDarkmode();

  const goToWWW = () => {
    window.open('https://www.bitverse.zone');
  };

  return (
    <div className={clsx('about-software', { dark: isDarkMode })}>
      <Header title="About" />
      <div className="page-container flex flex-col items-center">
        <img src={BitverseLogoImg} alt="Bitverse Logo" className="logo" />
        <TlpTextLogo className="logotext" viewBox="0 0 102 13" />
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
          onClick={goToWWW}
        >
          <img src={BitverseLogoImg} alt="Bitverse Logo" className="web-icon" />
          <span className="url">https://bitverse.zone/</span>
          <IconComponent name="chevron-right" cls="ml-auto" />
        </div>
        <div className="about-qrcode-container">
          <div className="qrcode_box">
            <div className="qrcode_box_title">for Android</div>
            <img
              src={QrCodeImg_Android}
              alt="android"
              className="about-qrcode"
            />
          </div>
          <div className="qrcode_box">
            <div className="qrcode_box_title">for iOS</div>
            <img src={QrCodeImg_IOS} alt="ios" className="about-qrcode" />
          </div>
        </div>
      </div>
    </div>
  );
}
