import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ACCOUNT_CREATE_TYPE } from '../../../constants/index';
import walletLogo from 'assets/Logo.svg';
import { ReactComponent as TlpTextLogo } from 'assets/teleportText.svg';

import './style.less';
import { CustomButton, CustomTab } from 'ui/components/Widgets';
import { Tabs } from 'constants/wallet';

import skynet from 'utils/skynet';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
import { openIndexPage } from 'background/webapi/tab';
const { sensors } = skynet;

const Welcome = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { isDarkMode } = useDarkmode();
  const [tabType, setTabType] = useState(Tabs.FIRST);

  const handleBtnClick: (type: ACCOUNT_CREATE_TYPE) => void = (
    type: ACCOUNT_CREATE_TYPE
  ) => {
    sensors.track('teleport_welcome_' + ACCOUNT_CREATE_TYPE[type], {
      page: 'welcome',
    });

    switch (ACCOUNT_CREATE_TYPE[type]) {
      case 'MPCCREATE':
        history.push({
          pathname: '/email',
          state: {
            redirect: '/mpcwalletbackup',
          },
        });
        break;
      case 'RECOVERY':
        history.push({
          pathname: '/email',
          state: {
            redirect: '/mpc-recovery-wallet',
          },
        });
        break;
      case 'CREATE':
        history.push('/create');
        break;
      case 'IMPORT':
        history.push('/recover');
        break;
    }
  };

  const handleBtnBackUp = () => {
    openIndexPage('/mpcwalletbackup');
    // history.push({
    //   pathname: '/MPCWalletBackUp',
    // });
  };

  return (
    <div className={clsx('welcome-container', { dark: isDarkMode })}>
      <div className="logo-container">
        <img src={walletLogo} className="logo" />
        <TlpTextLogo className="logo-header-left-title" viewBox="0 0 102 13" />
        <p className="welcome-to">Welcome to Bitverse Wallet</p>
      </div>

      <CustomButton
        size="large"
        block
        type="default"
        cls="custom-button-default import-wallet-btn"
        onClick={() => handleBtnBackUp()}
      >
        钱包备份
      </CustomButton>

      <CustomTab
        tab1="MPC Wallet"
        tab2="Wallet"
        currentTab={tabType}
        handleTabClick={(tab: Tabs) => {
          setTabType(tab);
        }}
      />

      <div className="btn-container">
        {tabType === Tabs.FIRST && (
          <>
            <CustomButton
              size="large"
              block
              type="primary"
              cls="create"
              onClick={() => handleBtnClick(ACCOUNT_CREATE_TYPE.MPCCREATE)}
            >
              Create MPC Wallet
            </CustomButton>

            <CustomButton
              size="large"
              block
              type="default"
              cls="custom-button-default import-wallet-btn"
              onClick={() => handleBtnClick(ACCOUNT_CREATE_TYPE.RECOVERY)}
            >
              Recovery Wallet
            </CustomButton>
          </>
        )}
        {tabType === Tabs.SECOND && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Welcome;
