import React from 'react';
import { Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ACCOUNT_CREATE_TYPE } from '../../../constants/index';
import walletLogo from 'assets/walletLogo.svg';
import { BetaIcon } from 'ui/components/Widgets';

import './style.less';
import { CustomButton } from 'ui/components/Widgets';
import skynet from 'utils/skynet';
const { sensors } = skynet;

const Welcome = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const handleBtnClick: (type: ACCOUNT_CREATE_TYPE) => void = (
    type: ACCOUNT_CREATE_TYPE
  ) => {
    history.push({
      pathname: type === ACCOUNT_CREATE_TYPE.CREATE ? '/create' : '/recover',
    });
    sensors.track('teleport_welcome' + type.toString(), {
      page: 'welcome',
    });
  };
  return (
    <div className="welcome-container">
      <div className="logo-container">
        <img src={walletLogo} className="logo" />
        <p className="welcome-to">Welcome to</p>
        <p className="wallet-name flexR">
          Teleport Wallet
          <BetaIcon />
        </p>
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
          cls="custom-button-default"
          onClick={() => handleBtnClick(ACCOUNT_CREATE_TYPE.IMPORT)}
        >
          Import Wallet
        </CustomButton>
      </div>
    </div>
  );
};

export default Welcome;
