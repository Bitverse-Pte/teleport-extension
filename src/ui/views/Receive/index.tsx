import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PageHeader, Button, message } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QrCodeView from 'ui/components/QrCode';
import { useWallet, useAsyncEffect } from 'ui/utils';
import { BaseAccount } from 'types/extend';
import './style.less';
import GeneralHeader from 'ui/components/Header/GeneralHeader';
import { useTranslation } from 'react-i18next';
import Jazzicon from 'react-jazzicon';
import { getUnit10ByAddress } from 'background/utils';
import { ChainIdToChainLogoSVG } from 'ui/utils/networkCategoryToIcon';
import skynet from 'utils/skynet';
import clsx from 'clsx';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';

const { sensors } = skynet;

const SendToken = () => {
  const { isDarkMode } = useDarkmode();
  const location = useLocation();
  const wallet = useWallet();
  const history = useHistory();
  const { symbol } = useParams<{
    symbol: string;
  }>();
  console.log('symbol:------------------------', symbol);
  const { t } = useTranslation();
  const [fromAccount, setFromAccount] = useState<BaseAccount>();
  const currentNetworkController = useSelector((state) => state.network);
  const ClickToCloseMessage = useStyledMessage();

  useAsyncEffect(async () => {
    const current: BaseAccount = await wallet.getCurrentAccount();
    setFromAccount(current);
  }, []);

  return (
    <div>
      <GeneralHeader title="Receive" hideLogo extCls="receive-header" />
      <div className={clsx('receive', { dark: isDarkMode })}>
        <div className="chain-box">
          <img
            src={ChainIdToChainLogoSVG(
              currentNetworkController.provider.chainId
            )}
            alt="Chain Logo"
            className="chain-logo"
          />
          <h1>{symbol}</h1>{' '}
          <span className="chain-name">
            ({currentNetworkController.provider.nickname})
          </span>
        </div>

        <div className="account-and-qrcode">
          <div className="account-box">
            <Jazzicon
              diameter={30}
              seed={getUnit10ByAddress(fromAccount?.address)}
            />
            <span className="account-address">{fromAccount?.accountName}</span>
          </div>
          <QrCodeView
            data={fromAccount?.address || ''}
            color="#02182B"
            margin={0}
            cellSize={5}
          />
        </div>

        <p className="address-box">{fromAccount?.address}</p>
        <div className="copy-box">
          <CopyToClipboard
            text={fromAccount?.address}
            onCopy={() => {
              ClickToCloseMessage('success')('Copied');
              sensors.track('teleport_receive_copy', {
                page: location.pathname,
              });
            }}
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
