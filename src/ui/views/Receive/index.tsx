import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { PageHeader, Button, message } from 'antd';
import { useHistory } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QrCodeView from 'ui/components/QrCode';
import { useWallet, useAsyncEffect } from 'ui/utils';
import { BaseAccount } from 'types/extend';
import './style.less';

const SendToken = () => {
  const wallet = useWallet();
  const history = useHistory();
  const [fromAccount, setFromAccount] = useState<BaseAccount>();
  const currentNetworkController = useSelector((state) => state.network);

  useAsyncEffect(async () => {
    const current: BaseAccount = await wallet.getCurrentAccount();
    setFromAccount(current);
  }, []);

  return (
    <div>
      <PageHeader
        className="receive-header"
        onBack={() => history.go(-1)}
        title="Receive"
      />
      <div className="receive">
        <div className="chain-box">
          <h1>{currentNetworkController.provider.chainName} </h1>{' '}
          <span className="chain-name">
            ({currentNetworkController.provider.nickname})
          </span>
        </div>
        <div className="account-box">{fromAccount?.accountName}</div>
        <div className="qrcode-box">
          <QrCodeView data={fromAccount?.address || ''} />
        </div>
        <div className="address-box">{fromAccount?.address}</div>
        <div className="copy-box">
          <CopyToClipboard
            text={fromAccount?.address}
            onCopy={() => message.success('Copied')}
          >
            <Button type="primary" block className="copy-btn">
              Copy
            </Button>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  );
};

export default SendToken;
