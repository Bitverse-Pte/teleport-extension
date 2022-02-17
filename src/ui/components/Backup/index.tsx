import './style.less';
import React, { useMemo, useState } from 'react';
import { message, Drawer } from 'antd';
import { useWallet } from 'ui/utils';
import * as _ from 'lodash';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { AccountCreateType } from 'types/extend';
import { CustomButton, CustomPasswordInput } from '../Widgets';
import { IconComponent } from '../IconComponents';
import { ClickToCloseMessage } from '../universal/ClickToCloseMessage';

export interface IBackupProps {
  visible: boolean;
  accountType: AccountCreateType;
  hdWalletId: string;
  setVisible?: (visible: boolean) => void;
}

const Backup: React.FC<IBackupProps> = (props: IBackupProps) => {
  const [unlocked, setUnlocked] = useState(false);
  const [psd, setPsd] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const wallet = useWallet();

  const handleNextBtnClick = () => {
    checksumPsd();
  };

  const resetState = () => {
    setUnlocked(false);
    setPsd('');
    setMnemonic('');
    setPrivateKey('');
  };

  useMemo(() => {
    if (!props.visible) {
      resetState();
    }
  }, [props.visible]);

  const getMnemonic = async () => {
    const mnemonic = await wallet.getMnemonicByHdWalletId(props.hdWalletId);
    if (mnemonic) {
      setMnemonic(mnemonic);
    }
  };

  const getPrivateKey = async () => {
    const privateKey = await wallet.getPrivateKeyByHdWalletId(props.hdWalletId);
    if (privateKey) setPrivateKey(privateKey);
  };

  const checksumPsd = async () => {
    const checksumPassed = await wallet.verifyPassword(psd).catch((e) => {
      ClickToCloseMessage.error('wrong password');
      console.error(e.code);
    });
    if (checksumPassed) {
      setUnlocked(true);
      switch (props.accountType) {
        case AccountCreateType.MNEMONIC:
          getMnemonic();
          break;
        case AccountCreateType.PRIVATE_KEY:
          getPrivateKey();
          break;
      }
    }
  };
  const arr = mnemonic?.split(' ');
  const style = {
    display:
      unlocked && props.accountType === AccountCreateType.MNEMONIC
        ? 'flex'
        : 'none',
  };
  if (arr?.length === 12) {
    (style as any).justifyContent = 'center';
  }

  return (
    <Drawer
      placement="bottom"
      closable={false}
      height="95vh"
      bodyStyle={{
        padding: '20px 24px',
      }}
      contentWrapperStyle={{
        borderRadius: '16px 16px 0 0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      visible={props.visible}
      key="top"
    >
      <div className="backup-popup-container flexCol">
        <div className="header flexR">
          <span className="title">
            Backup{' '}
            {props.accountType === AccountCreateType.MNEMONIC
              ? 'Mnemonic'
              : 'Private Key'}
          </span>
          <IconComponent
            name="close"
            style={{
              display: unlocked ? 'none' : 'block',
            }}
            cls="icon base-text-color"
            onClick={() => {
              if (props.setVisible) {
                props.setVisible(false);
              }
            }}
          />
        </div>
        <div className="content">
          <p className="sub-notice">
            If you switch browsers or computers, you will need to use the
            mnemonic phrase to restore your account.
          </p>
          <ul className="notice">
            <span className="notice-badge">NOTICE</span>
            <li className="item">
              Please keep it in a safe and confidential place.
            </li>
            <li className="item">
              Do not share the mnemonic phrase with anyone!
            </li>
            <li
              className="item"
              style={{ listStyleType: 'none', fontWeight: 'normal' }}
            >
              Because others can use mnemonic words to open wallets and steal
              assets
            </li>
          </ul>

          <div
            className="password-container flexCol"
            style={{
              display: unlocked ? 'none' : 'flex',
            }}
          >
            <span className="title">Password</span>
            <CustomPasswordInput
              cls="password-input"
              value={psd}
              placeholder="Password"
              onChange={(e) => {
                setPsd(e.target.value);
              }}
            />
          </div>
          <div className="phrase-container flexCol" style={style}>
            <div className="mnemonic-wrap">
              {arr.map((m: string, i) => (
                <span className="phrase" key={i}>
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div
            className="private-key-container flexCol"
            style={{
              display:
                unlocked && props.accountType === AccountCreateType.PRIVATE_KEY
                  ? 'flex'
                  : 'none',
            }}
          >
            <span className="title">Private Key</span>
            <span className="private-key">{privateKey}</span>
          </div>
        </div>
        <div className="bottom flexCol">
          <CustomButton
            type="primary"
            cls="theme"
            onClick={handleNextBtnClick}
            block
            disabled={_.isEmpty(psd)}
            style={{
              display: unlocked ? 'none' : 'block',
            }}
          >
            Next
          </CustomButton>
          <CopyToClipboard
            text={
              props.accountType === AccountCreateType.MNEMONIC
                ? mnemonic
                : privateKey
            }
            onCopy={() => ClickToCloseMessage.success('Copied')}
          >
            <CustomButton
              type="primary"
              cls="theme"
              block
              style={{
                display: unlocked ? 'block' : 'none',
                marginBottom: '14px',
              }}
            >
              Copy
            </CustomButton>
          </CopyToClipboard>
          <CustomButton
            type="default"
            cls="custom-button-default"
            onClick={() => {
              if (props.setVisible) {
                props.setVisible(false);
              }
            }}
            block
            style={{
              display: unlocked ? 'block' : 'none',
            }}
          >
            Close
          </CustomButton>
        </div>
      </div>
    </Drawer>
  );
};

export default Backup;
