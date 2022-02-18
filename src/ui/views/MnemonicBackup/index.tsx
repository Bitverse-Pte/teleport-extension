import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useWallet } from 'ui/utils';
import Header from 'ui/components/Header';
import { useAsyncEffect } from 'ui/utils';
import { CustomButton } from 'ui/components/Widgets';
import './style.less';
import { AccountHeader } from '../AccountRecover';
import classnames from 'classnames';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';

const MnemonicBackup = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const [mnemonic, setMnemonic] = useState('');
  const [second, setSecond] = useState(10);

  const countDownTimer: any = useRef();
  const { state } = useLocation<{
    mnemonic: string;
  }>();

  useEffect(() => {
    countDownTimer.current = setInterval(() => {
      setSecond((second) => second - 1);
      return clearInterval.bind(this, countDownTimer.current);
    }, 1000);
  }, []);

  useEffect(() => {
    if (second <= 0) clearInterval(countDownTimer.current);
  }, [second]);

  const disabled = useMemo(() => {
    return second > 0;
  }, [second]);

  const checkDisabled = useMemo(() => {
    return second >= 8;
  }, [second]);

  const mnemonicArr = useMemo(() => {
    return mnemonic.split(' ');
  }, [mnemonic]);

  useAsyncEffect(async () => {
    const decryptedMnemonic = decodeURIComponent(
      escape(window.atob(state.mnemonic))
    );
    if (decryptedMnemonic) {
      setMnemonic(decryptedMnemonic);
    }
  }, []);

  const handleSkinClick = () => {
    setSecond(0);
  };
  const handleCopyClick = () => {
    setSecond(0);
  };

  const submit = () => {
    history.push({
      pathname: '/home',
    });
  };

  return (
    <div className="backup flexCol">
      <AccountHeader title="Backup Mnemonic" hideClose />
      <div className="content">
        <ul
          style={{
            display: disabled ? 'none' : 'block',
            marginTop: '12px',
          }}
          className="notice"
        >
          <span className="notice-badge">NOTICE</span>
          <li className="item">
            Copy it on paper, and store it in a safe place that only you know
          </li>
          <li className="item">
            Do not disclose the mnemonic phrase to anyone
          </li>
          <li className="item">
            Do not use screenshots or network transmission to backup and save
          </li>
        </ul>
        <div className="mnemonic-container">
          <div
            className="model"
            style={{ display: disabled ? 'flex' : 'none' }}
          >
            <div className="circle-container flexR">
              <span className="second">{second}</span>
              <span className="sub-second">s</span>
            </div>
            <span
              className={classnames(
                {
                  'mnemonic-check-button-disabled': checkDisabled,
                },
                'mnemonic-check-button cursor'
              )}
              onClick={handleSkinClick}
            >
              Check immediately
            </span>
          </div>
          <div className="phrase-container">
            {mnemonicArr.map((phrase: string, i: number) => {
              return (
                <span className="phrase" key={`${phrase}_${i}`}>
                  {phrase}
                </span>
              );
            })}
          </div>
        </div>
        <div
          className="mnemonic-backup-attention"
          style={{ display: disabled ? 'block' : 'none' }}
        >
          <p className="mnemonic-backup-attention-title">Attention:</p>
          <p className="mnemonic-backup-attention-content">
            The mnemonic phrase helps to reply to the wallet or recharge the
            wallet password.
          </p>
          <p className="mnemonic-backup-attention-content">
            Once the mnemonic phrase is lost, the assets cannot be recovered.
          </p>
        </div>
      </div>
      <div className="button-container">
        <CopyToClipboard
          text={mnemonic}
          onCopy={() => {
            ClickToCloseMessage.success('Copied');
          }}
        >
          <CustomButton
            type="primary"
            style={{
              display: disabled ? 'none' : 'block',
            }}
            onClick={handleCopyClick}
            cls="btn theme"
            data-clipboard-text={mnemonic}
            block
            disabled={disabled}
          >
            Copy
          </CustomButton>
        </CopyToClipboard>
        <CustomButton
          type="default"
          style={{
            display: disabled ? 'none' : 'block',
          }}
          cls="custom-button-default"
          onClick={submit}
          block
          disabled={disabled}
        >
          Continue
        </CustomButton>
      </div>
    </div>
  );
};

export default MnemonicBackup;
