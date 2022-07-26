import React, { useState } from 'react';
import { message } from 'antd';
import { useWallet, useWalletRequest, useApproval } from 'ui/utils';
import walletLogo from 'assets/walletLogo.png';
import { CustomButton, CustomPasswordInput } from 'ui/components/Widgets';

import './style.less';
import { LogoHeader } from '../Setting';
import defenseImg from '../../../assets/defense.png';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import clsx from 'clsx';
import { useDarkmode } from 'ui/hooks/useDarkMode';

const Unlock = () => {
  const wallet = useWallet();
  const [, resolveApproval] = useApproval();
  const [psd, setPsd] = useState();

  const [unlock, loading] = useWalletRequest(wallet.unlock, {
    onSuccess() {
      wallet.setManualLocked(false);
      resolveApproval();
    },
    onError(err) {
      ClickToCloseMessage.error({
        content: 'Wrong password',
        key: 'Wrong password',
      });
    },
  });

  const handleUnlockClick = async () => {
    unlock(psd);
  };

  const { isDarkMode } = useDarkmode();

  return (
    <div className={clsx('unlock-container', { dark: isDarkMode })}>
      <LogoHeader hideClosIcon />
      <div className="unlock-defense flexCol content-wrap-padding">
        <img src={defenseImg} className="unlock-defense-img" />
        <p className="unlock-defense-notice">
          Your Wallet is under Protection Enter Password to Unlock
        </p>
      </div>
      <div className="btn-container content-wrap-padding">
        <p className="unlock-title">Password</p>
        <CustomPasswordInput
          cls="password-input"
          value={psd}
          placeholder="Password"
          onChange={(e) => {
            setPsd(e.target.value);
          }}
          onPressEnter={() => handleUnlockClick()}
        />
        <CustomButton
          size="large"
          block
          type="primary"
          cls="theme"
          disabled={!psd}
          loading={loading}
          onClick={() => handleUnlockClick()}
        >
          Unlock
        </CustomButton>
      </div>
    </div>
  );
};

export default Unlock;
