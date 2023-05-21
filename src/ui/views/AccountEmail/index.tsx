import React, { useState, useMemo, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
import { AccountHeader } from '../AccountRecover';
import { CustomButton, CustomInput } from 'ui/components/Widgets';
import { useWallet } from 'ui/utils';
import { browser } from 'webextension-polyfill-ts';
import skynet from 'utils/skynet';
const { sensors } = skynet;
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';
import './style.less';

const AccountEmail = () => {
  const { t } = useTranslation();
  const { state, pathname } = useLocation<{
    redirect: string;
  }>();
  const { redirect } = state;

  const history = useHistory();
  const { isDarkMode } = useDarkmode();
  const [emailAdd, setEmailAdd] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const wallet = useWallet();
  const mailReg =
    /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
  const ClickToCloseMessage = useStyledMessage();

  const handlePwdRedirect = async () => {
    const isBooted = await wallet.isBooted();
    // true 代表没有密码,跳转密码页
    if (isBooted) {
      history.push({
        pathname: '/mpc-create-pwd',
        state: {
          redirect: `/${redirect}`,
        },
      });
      return;
    }
    history.push(`/${redirect}`);
  };

  const submit = () => {
    console.log(emailAdd, emailCode);
    browser.storage.local.set({ email: emailAdd });
    handlePwdRedirect();
  };

  const handleGetCode = () => {
    console.log('getcode');
  };

  const disabled = useMemo(() => {
    const str =
      !emailAdd.trim() || !emailCode.trim() || !mailReg.test(emailAdd.trim());
    return Boolean(str);
  }, [emailAdd, emailCode]);

  return (
    <div className={clsx('email-wrap flexCol', { dark: isDarkMode })}>
      <AccountHeader title="Create MPC Wallet" />
      <div className="content content-wrap-padding">
        <CustomInput
          placeholder="Email address"
          cls="hover"
          onChange={(e) => {
            setEmailAdd(e.target.value);
          }}
          onBlur={() => {
            if (!mailReg.test(emailAdd.trim())) {
              ClickToCloseMessage('error')({
                content: 'invalid email',
                key: 'invalid email',
              });
              return;
            }
          }}
        />
        <div className="verified-wrap">
          <CustomButton type="primary" cls="code-btn" onClick={handleGetCode}>
            GetCode
          </CustomButton>
          <CustomInput
            placeholder="Enter the verification code"
            cls="hover"
            onChange={(e) => {
              setEmailCode(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="button content-wrap-padding">
        <CustomButton
          type="primary"
          cls="theme email-btn"
          block
          onClick={submit}
          disabled={disabled}
        >
          Continue
        </CustomButton>
      </div>
    </div>
  );
};

export default AccountEmail;
