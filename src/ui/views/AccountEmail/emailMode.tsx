import React, { useState, useMemo, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomButton, CustomInput } from 'ui/components/Widgets';
import { useWallet } from 'ui/utils';
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';
import './style.less';
import { openIndexPage } from 'background/webapi/tab';
import { browser } from 'webextension-polyfill-ts';

const AccountEmail = (props) => {
  const { redirect } = props;
  const { t } = useTranslation();
  const history = useHistory();
  const [emailAdd, setEmailAdd] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [isCode, setIsCode] = useState(true);
  const wallet = useWallet();
  const mailReg =
    /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
  const ClickToCloseMessage = useStyledMessage();

  const onSubmit = async () => {
    browser.storage.local.set({ email: emailAdd });
    const isBooted = await wallet.isBooted();
    // const isBooted = true;
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
    openIndexPage(`/${redirect}`);
  };

  const handleGetCode = () => {
    setIsCode(true);
    console.log('getcode');
  };

  const disabled = useMemo(() => {
    const str =
      !emailAdd.trim() || !emailCode.trim() || !mailReg.test(emailAdd.trim());
    return Boolean(str);
  }, [emailAdd, emailCode]);

  return (
    <>
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
              setIsCode(true);
              return;
            } else {
              setIsCode(false);
            }
          }}
        />
        <div className="verified-wrap">
          <CustomButton
            type="primary"
            disabled={isCode}
            cls="code-btn"
            onClick={handleGetCode}
          >
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
          onClick={onSubmit}
          disabled={disabled}
        >
          Continue
        </CustomButton>
      </div>
    </>
  );
};

export default AccountEmail;
