
import React, { useMemo, useState } from 'react';
import { Checkbox } from 'antd';
import Header from 'ui/components/Header';
import clsx from 'clsx';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import './style.less';
import { CustomButton, CustomPasswordInput, PasswordCheckPassed } from 'ui/components/Widgets';
import { usePolicyAgreed, useWallet } from 'ui/utils';
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';
import { Link, useHistory, useLocation } from 'react-router-dom';

function MPCCreatePwd() {
  const { isDarkMode } = useDarkmode();
  const history = useHistory();
  const { state }: any = useLocation();
  const [policyShow, updateStoragePolicyAgreed] = usePolicyAgreed();
  const wallet = useWallet();
  const [agreed, setAgreed] = useState(false);
  const [psd, setPsd] = useState('');
  const [confirmPsd, setConfirmPsd] = useState('');
  const [passwordCheckPassed, setPasswordCheckPassed] = useState(false);
  const disabled = useMemo(
    () => {
      const str =
        (!agreed || !policyShow) ||
        !psd ||
        !confirmPsd ||
        !passwordCheckPassed
      return Boolean(str);
    },
    [agreed, psd, confirmPsd, passwordCheckPassed]
  );

  const ClickToCloseMessage = useStyledMessage();

  const submit = async () => {
    updateStoragePolicyAgreed()
    await wallet.setPassword(psd)
    history.push(state.redirect || 'TODO 备份钱包')
  }

  return (
    <div className={clsx('mpc-create-pwd flexCol', { dark: isDarkMode })}>
      <Header title='Set Wallet Password' />

      <div
        className="mpc-password-container"
      >
        <p className="create-title">Password</p>
        <p className="create-notice">
          Will be used to encrypt your data and unlock your wallet.
        </p>
        <CustomPasswordInput
          cls="custom-password-input"
          onChange={(e) => {
            setPsd(e.target.value);
          }}
          placeholder="Password"
        />
        <PasswordCheckPassed
          value={psd}
          setPassed={(pass) => {
            setPasswordCheckPassed(pass);
          }}
        />
        <p className="create-title">Confirm password</p>
        <CustomPasswordInput
          cls="custom-password-input"
          onChange={(e) => {
            setConfirmPsd(e.target.value);
          }}
          onBlur={(e) => {
            if (
              psd.trim() &&
              e.target.value?.trim() &&
              psd.trim() !== e.target.value?.trim()
            ) {
              ClickToCloseMessage('error')({
                content: "Password don't match",
                key: "Password don't match",
              });
            }
          }}
          placeholder="Enter password again"
        />
        <div
          className="policy flexR"
          style={{ display: policyShow ? 'block' : 'none' }}
        >
          <Checkbox
            style={{
              width: '14px',
              height: '14px',
            }}
            onChange={(e) => {
              setAgreed(e.target.checked);
            }}
          />
          <span className="policy-title">I have read and agree to&nbsp;</span>
          <Link className="policy-link cursor" to="/policy">
            the privacy & terms
          </Link>
        </div>
      </div>
      <div className="button content-wrap-padding">
        <CustomButton
          type="primary"
          cls="theme"
          onClick={submit}
          block
          disabled={disabled}
        >
          Continue
        </CustomButton>
      </div>
    </div>
  );
}

export default MPCCreatePwd;
