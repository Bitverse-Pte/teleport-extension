import React, { useState, useMemo, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CustomButton, CustomInput } from 'ui/components/Widgets';
import { useWallet } from 'ui/utils';
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';
import './style.less';
import { openIndexPage } from 'background/webapi/tab';
import { browser } from 'webextension-polyfill-ts';
import httpClient from 'bitverse-http-client';

const AccountEmail = (props) => {
  const { redirect } = props;
  const { t } = useTranslation();
  const history = useHistory();
  const [emailAdd, setEmailAdd] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [isCode, setIsCode] = useState(true);
  const [countDownSecond, setCountDownSecond] = useState(0);

  const wallet = useWallet();
  const bitverseServerbaseURL = 'http://api2.bitverse-dev-1.bitverse.zone';
  const mailReg =
    /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
  const ClickToCloseMessage = useStyledMessage();

  // 邮箱验证码校验
  const onSubmit = async () => {
    try {
      const result = await httpClient.post(
        `${bitverseServerbaseURL}/bitverse/wallet/v1/public/user/signin`,
        {
          email: emailAdd,
          verifyCode: emailCode,
        }
      );
      if (result.retCode === 0 || result.retCode === '0') {
        console.log('[response ok]:', result);
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
        return;
      }
      ClickToCloseMessage('error')({
        content: result.retMsg,
        key: result.retMsg,
      });
    } catch (error) {
      console.log('[response error]: ', error);
    }
  };

  const handleCountDown = () => {
    let timeo = 60;
    const timeStop = setInterval(() => {
      timeo--;
      if (timeo > 0) {
        setCountDownSecond(timeo);
      } else {
        setCountDownSecond(timeo);
        setIsCode(false);
        clearInterval(timeStop); //清除定时器
      }
    }, 1000);
  };

  // 获取验证码
  const handleGetCode = async () => {
    setIsCode(true);
    try {
      const result = await httpClient.post(
        `${bitverseServerbaseURL}/bitverse/wallet/v1/public/user/verifycode/send`,
        {
          email: emailAdd,
          bizType: 'SIGNIN',
        }
      );
      handleCountDown();
      console.log('[response ok]:', result);
    } catch (error) {
      console.log('[response error]: ', error);
    }
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
            GetCode{countDownSecond > 0 && `(${countDownSecond})`}
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
