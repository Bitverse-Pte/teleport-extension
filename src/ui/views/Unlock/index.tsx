import React, { useState } from 'react';
import { message } from 'antd';
import { useWallet, useWalletRequest, useApproval } from 'ui/utils';
import walletLogo from 'assets/walletLogo.svg';
import { CustomButton, CustomPasswordInput } from 'ui/components/Widgets';

import './style.less';
import { LogoHeader } from '../Setting';
import defenseImg from '../../../assets/defense.png';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';

const Unlock = () => {
  const wallet = useWallet();
  const [, resolveApproval] = useApproval();
  const [psd, setPsd] = useState();

  const [unlock, loading] = useWalletRequest(wallet.unlock, {
    onSuccess() {
      resolveApproval();
    },
    onError(err) {
      ClickToCloseMessage.error('Wrong password');
    },
  });

  const handleUnlockClick = async () => {
    await wallet.setManualLocked(false);
    unlock(psd);
  };

  return (
    <div className="unlock-container">
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
