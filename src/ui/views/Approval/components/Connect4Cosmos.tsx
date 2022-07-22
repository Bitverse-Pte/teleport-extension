import Jazzicon from 'react-jazzicon';
import { WalletName } from '../../../components/Widgets';
import { useTranslation } from 'react-i18next';
import { Spin, FallbackSiteLogo } from 'ui/components';
import {
  transferAddress2Display,
  useApproval,
  useAsyncEffect,
  useWallet,
} from 'ui/utils';
import { decGWEIToHexWEI } from 'ui/utils/conversion';
import { CHAINS_ENUM } from 'constants/index';
import './connect.less';
import { CustomButton } from 'ui/components/Widgets';
import { BaseAccount } from 'types/extend';
import { IconComponent } from 'ui/components/IconComponents';
import React, { useEffect, useState } from 'react';
import { Provider } from 'types/network';
import './connect4cosmos.less';
import { IdToChainLogoSVG } from 'ui/utils/networkCategoryToIcon';

interface ConnectProps {
  params: any;
}

const Connect4Cosmos = ({
  params: { origin, name, icon, chainId },
}: ConnectProps) => {
  console.log(
    '======[ origin, name, icon, chainId]=====',
    origin,
    name,
    icon,
    chainId
  );
  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();
  const [provider, setProvider] = useState<Provider | undefined>();
  const wallet = useWallet();

  const init = async () => {
    const provider = await wallet.getCosmosProviderByChainId(chainId);
    setProvider(provider);
  };

  useAsyncEffect(init, []);

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  const handleAllow = async () => {
    resolveApproval({});
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
              'This site is requesting to connect to all your accounts on below network.'
            )}
          </div>
        </div>
        <div className="network-title">Network</div>
        <div className="network-item flex">
          <img
            src={IdToChainLogoSVG(provider?.id || '')}
            className="chain-icon"
          />
          <div className="chain-name">{provider?.chainName}</div>
        </div>
        <div className="network-title-1">Network Type</div>
        <div className="network-content">Cosmos Ecosystem</div>
        <div className="network-title-2">
          Once connected the site will be able to:
        </div>
        <div className="network-content">- Know your wallet address</div>
        <div className="network-content">
          - Being able to request signture for transactions
        </div>
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

export default Connect4Cosmos;
