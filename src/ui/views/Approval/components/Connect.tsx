import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import Jazzicon from 'react-jazzicon';
import { WalletName } from '../../../components/Widgets';
import { useTranslation } from 'react-i18next';
import { Spin, FallbackSiteLogo } from 'ui/components';
import { transferAddress2Display, useApproval, useWallet } from 'ui/utils';
import { decGWEIToHexWEI } from 'ui/utils/conversion';
import { CHAINS_ENUM } from 'constants/index';
import './connect.less';
import { CustomButton } from 'ui/components/Widgets';
import { BaseAccount } from 'types/extend';
import { IconComponent } from 'ui/components/IconComponents';

interface ConnectProps {
  params: any;
  onChainChange(chain: CHAINS_ENUM): void;
  defaultChain: CHAINS_ENUM;
}

const Connect = ({ params: { icon, origin } }: ConnectProps) => {
  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();
  const wallet = useWallet();
  const [defaultChain, setDefaultChain] = useState(CHAINS_ENUM.ETH);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAccount, setCurrentAccount] = useState<
    BaseAccount | undefined
  >();
  const init = async () => {
    setDefaultChain(CHAINS_ENUM.ETH);
    setIsLoading(false);
    const account: BaseAccount | undefined = await wallet.getCurrentAccount();
    setCurrentAccount(account);
  };

  useEffect(() => {
    init();
  }, []);

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleAllow = async () => {
    resolveApproval({
      defaultChain,
    });
  };

  return (
    <div className="approval-connect flexCol">
      <div className="connect-title text-center">{t('Request to Connect')}</div>
      <div className="connect-body">
        <div className="site-info content-center">
          <div className="site-info__icon">
            <FallbackSiteLogo url={icon} origin={origin} width="44px" />
          </div>
          <div className="site-info__text">
            <p className="text-15 font-medium">{origin}</p>
          </div>
        </div>
        <div className="warnning_info_container">
          <div className="warnning_info_text">
            {t(
              'This site is requesting access to your account. Please make sure you are accessing a trusted website.'
            )}
          </div>
        </div>
        <div className="account-title">{t('Current Account')}</div>
        <div className="account-item flex" key={currentAccount?.address}>
          <div className="account-left flex">
            <Jazzicon
              diameter={30}
              seed={Number(currentAccount?.address?.substr(0, 8) || 0)}
            />
            <div className="account-info flexCol">
              <WalletName cls="account-name" width={100}>
                {currentAccount?.accountName || currentAccount?.hdWalletName}
              </WalletName>
              <span className="account-address">
                {transferAddress2Display(currentAccount?.address)}
              </span>
            </div>
          </div>
          <div className="account-right">
            <IconComponent name="check" cls="base-text-color" />
          </div>
        </div>

        {/* <div className="account-title">{t('Connected Account')}</div>
        <div></div> */}
      </div>
      <div className="button-container flexCol">
        <CustomButton
          type="primary"
          onClick={handleAllow}
          cls="theme btn-container-top"
          block
        >
          {t('Connect')}
        </CustomButton>
        <CustomButton
          type="default"
          cls="custom-button-default"
          onClick={handleCancel}
          block
        >
          {t('Cancel')}
        </CustomButton>
      </div>
    </div>
  );
};

export default Connect;
