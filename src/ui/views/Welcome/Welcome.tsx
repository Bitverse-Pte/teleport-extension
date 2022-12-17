import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ACCOUNT_CREATE_TYPE } from '../../../constants/index';
import walletLogo from 'assets/walletLogo.png';
import { ReactComponent as TlpTextLogo } from 'assets/teleportText.svg';

import './style.less';
import { CustomButton } from 'ui/components/Widgets';
import skynet from 'utils/skynet';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
const { sensors } = skynet;

const Welcome = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { isDarkMode } = useDarkmode();

  const handleBtnClick: (type: ACCOUNT_CREATE_TYPE) => void = (
    type: ACCOUNT_CREATE_TYPE
  ) => {
    sensors.track('teleport_welcome_' + ACCOUNT_CREATE_TYPE[type], {
      page: 'welcome',
    });
    history.push({
      pathname: type === ACCOUNT_CREATE_TYPE.CREATE ? '/create' : '/recover',
    });
  };
  return (
    <div className={clsx('welcome-container', { dark: isDarkMode })}>
      <div className="logo-container">
        <img src={walletLogo} className="logo" />
        {/* <img src={TeleportText} className="logo-header-left-title" /> */}
        <TlpTextLogo className="logo-header-left-title" viewBox="0 0 102 13" />
        <p className="welcome-to">Welcome to Teleport Wallet</p>
      </div>

      <div className="btn-container">
        <CustomButton
          size="large"
          block
          type="primary"
          cls="create"
          onClick={() => handleBtnClick(ACCOUNT_CREATE_TYPE.CREATE)}
        >
          Create Wallet
        </CustomButton>

        <CustomButton
          size="large"
          block
          type="default"
          cls="custom-button-default import-wallet-btn"
          onClick={() => handleBtnClick(ACCOUNT_CREATE_TYPE.IMPORT)}
        >
          Import Wallet
        </CustomButton>
      </div>
    </div>
  );
};

export default Welcome;
