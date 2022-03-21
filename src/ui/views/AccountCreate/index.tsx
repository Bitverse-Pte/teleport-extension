import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MIN_PASSWORD_LENGTH } from 'constants/index';
import { Checkbox, message } from 'antd';
import { useWallet, useWalletRequest, usePolicyAgreed } from 'ui/utils';
import Header from '../../components/Header';
import './style.less';
import { CreateAccountOpts } from 'types/extend';
import {
  CustomButton,
  CustomInput,
  CustomPasswordInput,
  PasswordCheckPassed,
} from 'ui/components/Widgets';
import { AccountHeader } from '../AccountRecover';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';

const AccountCreate = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [agreed, setAgreed] = useState(false);
  const [psd, setPsd] = useState('');
  const [confirmPsd, setConfirmPsd] = useState('');
  const [name, setName] = useState('');
  const [passwordCheckPassed, setPasswordCheckPassed] = useState(false);
  const [policyShow, updateStoragePolicyAgreed] = usePolicyAgreed();
  const wallet = useWallet();

  const [run, loading] = useWalletRequest(wallet.createHdWallet, {
    onSuccess(mnemonic) {
      updateStoragePolicyAgreed();
      history.push({
        pathname: '/mnemonic-backup',
        state: {
          mnemonic: btoa(unescape(encodeURIComponent(mnemonic))),
        },
      });
    },
    onError(err) {
      console.error(err);
      ClickToCloseMessage.error('Unknown error, please try again later');
    },
  });

  const disabled = useMemo(
    () => {
      const str =
        (policyShow &&
          (!name.trim() ||
            !agreed ||
            !psd ||
            !confirmPsd ||
            !passwordCheckPassed)) ||
        (!policyShow && !name.trim());
      return Boolean(str);
    },
    policyShow ? [agreed, name, psd, confirmPsd, passwordCheckPassed] : [name]
  );

  const submit = () => {
    if (name.trim().length > 20) {
      ClickToCloseMessage.error('Name length should be 1-20 chars');
      return;
    }
    if (policyShow) {
      if (psd.trim() !== confirmPsd.trim()) {
        ClickToCloseMessage.error("Passwords don't match");
        return;
      }
    }
    const createOpts: CreateAccountOpts = {
      name: name.trim(),
    };
    if (policyShow) {
      createOpts.password = psd;
    }
    run(createOpts);
  };

  return (
    <div className="account-create flexCol">
      <AccountHeader title="Create Wallet" />
      <div className="content content-wrap-padding">
        <p className="account-create-title">Wallet name</p>
        <CustomInput
          placeholder="Enter wallet name"
          cls="account-create-name-input"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />

        <div
          className="password-container"
          style={{ display: policyShow ? 'block' : 'none' }}
        >
          <p className="account-create-title">Password</p>
          <p className="account-create-notice">
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
          <p className="account-create-title">Confirm password</p>
          <CustomPasswordInput
            onChange={(e) => {
              setConfirmPsd(e.target.value);
            }}
            onBlur={(e) => {
              if (
                psd.trim() &&
                e.target.value?.trim() &&
                psd.trim() !== e.target.value?.trim()
              ) {
                ClickToCloseMessage.error("Passwords don't match");
              }
            }}
            placeholder="Enter password again"
          />
        </div>

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
          <span
            className="policy-link cursor"
            onClick={() => {
              history.push('/policy');
            }}
          >
            the privacy & terms
          </span>
        </div>
      </div>
      <div className="button content-wrap-padding">
        <CustomButton
          type="primary"
          cls="theme"
          onClick={submit}
          block
          disabled={disabled}
          loading={loading}
        >
          Continue
        </CustomButton>
      </div>
    </div>
  );
};

export default AccountCreate;
