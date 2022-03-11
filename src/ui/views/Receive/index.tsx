import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { PageHeader, Button, message } from 'antd';
import { useHistory } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QrCodeView from 'ui/components/QrCode';
import { useWallet, useAsyncEffect, transferAddress2Display } from 'ui/utils';
import { BaseAccount } from 'types/extend';
import './style.less';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import GeneralHeader from 'ui/components/Header/GeneralHeader';
import { useTranslation } from 'react-i18next';
import Jazzicon from 'react-jazzicon';
import { ChainIdToChainLogoSVG } from 'ui/utils/networkCategoryToIcon';

const SendToken = () => {
  const wallet = useWallet();
  const history = useHistory();
  const { t } = useTranslation();
  const [fromAccount, setFromAccount] = useState<BaseAccount>();
  const currentNetworkController = useSelector((state) => state.network);

  useAsyncEffect(async () => {
    const current: BaseAccount = await wallet.getCurrentAccount();
    setFromAccount(current);
  }, []);

  return (
    <div>
      <GeneralHeader title="Receive" hideLogo extCls="receive-header" />
      <div className="receive">
        <div className="chain-box">
          <img src={ChainIdToChainLogoSVG(currentNetworkController.provider.chainId)} alt="Chain Logo" className="chain-logo" />
          <h1>{currentNetworkController.provider.chainName} </h1>{' '}
          <span className="chain-name">
            ({currentNetworkController.provider.nickname})
          </span>
        </div>

        <div className="account-and-qrcode">
          <div className="account-box">
            <Jazzicon
              diameter={30}
              seed={Number(fromAccount?.address?.substr(0, 8) || 0)}
            />
            <span className="account-address">{fromAccount?.accountName}</span>
          </div>
          <QrCodeView
            data={fromAccount?.address || ''}
            color="#364361"
            margin={0}
          />
        </div>

        <div className="address-box">
          {transferAddress2Display(fromAccount?.address)}
        </div>
        <div className="copy-box">
          <CopyToClipboard
            text={fromAccount?.address}
            onCopy={() => ClickToCloseMessage.success('Copied')}
          >
            <Button type="primary" block className="copy-btn">
              {t('copy_to_clipboard')}
            </Button>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  );
};

export default SendToken;
