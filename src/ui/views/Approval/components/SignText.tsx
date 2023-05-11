import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseAccount } from 'types/extend';
import { NetworkDisplay } from 'ui/components';
import { useApproval, useWallet, transferAddress2Display } from 'ui/utils';
import Jazzicon from 'react-jazzicon';
import { getUnit10ByAddress } from 'background/utils';
import { CustomButton, WalletName } from '../../../components/Widgets';
import { FallbackSiteLogo } from 'ui/components';
import * as ethUtil from 'ethereumjs-util';

import './signTypedData.less';
import { utils } from 'ethers';
import { isHexString } from 'ethereumjs-util';
const itemsCenteredCls = 'flex items-center justify-center';

const SignText = ({ params }) => {
  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();
  const wallet = useWallet();
  const [currentAccount, setCurrentAccount] = useState<
    BaseAccount | undefined
  >();
  const [data, setData] = useState<any>();

  //const data = params.data[0]

  const init = async () => {
    const account: BaseAccount | undefined = await wallet.getCurrentAccount();
    setCurrentAccount(account);
    setData(params.data[0]);
  };

  useEffect(() => {
    init();
  }, []);

  const parsedData = useMemo(() => {
    console.info('SignText::parsedData data:', data);
    if (isHexString(data)) {
      try {
        return utils.toUtf8String(data);
      } catch {
        console.log('SignText::parsedData Fail to decode:');
      }
      return data;
    } else {
      return data;
    }
  }, [data]);

  return (
    <div className="approval-sign flexCol">
      <div className="sign-title text-center">{t('Signnature Request')}</div>
      <div className="top-part-container flexCol flex-wrap items-center">
        <NetworkDisplay />
        <div className="from-container flexCol">
          <div className="account-info flexR">
            <Jazzicon
              seed={getUnit10ByAddress(currentAccount?.address)}
              diameter={16}
            />
            <WalletName cls="account-name" width={100}>
              {currentAccount?.accountName || currentAccount?.hdWalletName}
            </WalletName>
          </div>
          <span className="account-address">
            {transferAddress2Display(currentAccount?.address)}
          </span>
        </div>
        <div className="site-container flexR">
          <div className="site-info__icon">
            <FallbackSiteLogo
              url={params.session.icon}
              origin={params.session.origin}
              width="24px"
            />
          </div>
          <div className="site-info__text">
            <div>{params.session.origin}</div>
            <div className="site-info__subtext">{params?.data[2]}</div>
          </div>
        </div>
      </div>
      <div className="sign-body flexCol">
        <div className="sign-data-title">{`${t('Message')}:`}</div>
        <pre className="sign-data">{parsedData}</pre>
      </div>
      <footer className="connect-footer">
        <div className={clsx(['action-buttons mt-4'])}>
          <CustomButton
            type="primary"
            onClick={() => resolveApproval({})}
            cls="theme tx-btn-container-top mb-14"
            block
          >
            {t('Sign')}
          </CustomButton>
          <CustomButton
            type="default"
            cls="custom-button-default"
            onClick={() => rejectApproval('User rejected the request.')}
            block
          >
            {t('Decline')}
          </CustomButton>
        </div>
      </footer>
    </div>
  );
};

export default SignText;
