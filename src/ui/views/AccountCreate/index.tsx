import React, { useMemo, useState } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Checkbox } from 'antd';
import { useWallet, useWalletRequest, usePolicyAgreed } from 'ui/utils';
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
import skynet from 'utils/skynet';
import { ErrorCode } from 'constants/code';
const { sensors } = skynet;
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';

const AccountCreate = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);
  const [psd, setPsd] = useState('');
  const [confirmPsd, setConfirmPsd] = useState('');
  const [name, setName] = useState('');
  const [passwordCheckPassed, setPasswordCheckPassed] = useState(false);
  const [policyShow, updateStoragePolicyAgreed] = usePolicyAgreed();
  const wallet = useWallet();
  const { isDarkMode } = useDarkmode();

  const [run, loading] = useWalletRequest(wallet.createHdWallet, {
    onSuccess(mnemonic) {
      updateStoragePolicyAgreed();
      sensors.track('teleport_account_create_step1', {
        page: location.pathname,
      });
      history.push({
        pathname: '/mnemonic-backup',
        state: {
          mnemonic: btoa(unescape(encodeURIComponent(mnemonic))),
        },
      });
    },
    onError(err) {
      console.error(err);
      if (err?.code === ErrorCode.WALLET_NAME_REPEAT) {
        ClickToCloseMessage.error({
          content: 'Name already exists',
          key: 'Name already exists',
        });
      } else {
        ClickToCloseMessage.error({
          content: 'Unknown error, please try again later',
          key: 'Unknown error, please try again later',
        });
      }
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
      ClickToCloseMessage.error({
        content: 'Name length should be 1-20 characters',
        key: 'Name length should be 1-20 characters',
      });
      return;
    }
    if (policyShow) {
      if (psd.trim() !== confirmPsd.trim()) {
        ClickToCloseMessage.error({
          content: "Passwords don't match",
          key: "Passwords don't match",
        });
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
    <div className={clsx('account-create flexCol', { dark: isDarkMode })}>
      <AccountHeader title="Create Wallet" />
      <div className="content content-wrap-padding">
        <p className="account-create-title">Wallet name</p>
        <CustomInput
          placeholder="Enter wallet name"
          cls="account-create-name-input"
          onChange={(e) => {
            setName(e.target.value);
          }}
          onBlur={() => {
            if (name.trim().length > 20) {
              ClickToCloseMessage.error({
                content: 'Name length should be 1-20 characters',
                key: 'Name length should be 1-20 characters',
              });
              return;
            }
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
                ClickToCloseMessage.error({
                  content: "Passwords don't match",
                  key: "Passwords don't match",
                });
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
          loading={loading}
        >
          Continue
        </CustomButton>
      </div>
    </div>
  );
};

export default AccountCreate;
