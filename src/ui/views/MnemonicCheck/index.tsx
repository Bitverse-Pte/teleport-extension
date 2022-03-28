import './style.less';
import React, { useMemo, useState } from 'react';
import { message, Drawer } from 'antd';
import { useWallet, useWalletRequest } from 'ui/utils';
import { useHistory, useLocation } from 'react-router-dom';
import * as _ from 'lodash';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CustomButton, CustomPasswordInput } from 'ui/components/Widgets';
import { IconComponent } from 'ui/components/IconComponents';
import { AccountHeader } from '../AccountRecover';
import { Tabs } from 'constants/wallet';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import skynet from 'utils/skynet';
const { sensors } = skynet;

const BackupCheck = () => {
  const { state, pathname } = useLocation<{
    hdWalletId: string;
    accountType: Tabs;
  }>();

  const [unlocked, setUnlocked] = useState(false);
  const [psd, setPsd] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const wallet = useWallet();
  const history = useHistory();

  const [unlock, loading] = useWalletRequest(wallet.unlock, {
    onSuccess() {
      checksumPsd();
      sensors.track('teleport_mnemonic_backup_next', { page: pathname });
    },
    onError(err) {
      ClickToCloseMessage.error('Wrong password');
    },
  });

  const handleNextBtnClick = () => {
    unlock(psd);
  };

  const resetState = () => {
    setUnlocked(false);
    setPsd('');
    setMnemonic('');
    setPrivateKey('');
  };

  const getMnemonic = async () => {
    const mnemonic = await wallet.getMnemonicByHdWalletId(state.hdWalletId);
    if (mnemonic) {
      setMnemonic(mnemonic);
    }
  };

  const getPrivateKey = async () => {
    const pk = await wallet.getPrivateKeyByHdWalletId(state.hdWalletId);
    if (pk) {
      if (pk.startsWith('0x')) {
        setPrivateKey(pk.replace('0x', ''));
      }
    }
  };

  const checksumPsd = async () => {
    const checksumPassed = await wallet.verifyPassword(psd).catch((e) => {
      ClickToCloseMessage.error('Wrong password');
      console.error(e.code);
    });
    if (checksumPassed) {
      setUnlocked(true);
      switch (state.accountType) {
        case Tabs.FIRST:
          getMnemonic();
          break;
        case Tabs.SECOND:
          getPrivateKey();
          break;
      }
    }
  };
  const arr = mnemonic?.split(' ');
  const style = {
    display: unlocked && state.accountType === Tabs.FIRST ? 'flex' : 'none',
  };
  if (arr?.length === 12) {
    (style as any).justifyContent = 'center';
  }

  return (
    <div className="mnemonic-check-container flexCol">
      <AccountHeader
        title={`Backup ${
          state.accountType === Tabs.FIRST ? 'Mnemonic' : 'Private Key'
        }`}
        hideClose={unlocked}
      />
      <div className="mnemonic-check-content content-wrap-padding">
        <p className="sub-notice">
          If you switch browsers or computers, you will need to use the mnemonic
          phrase to restore your account.
        </p>
        <ul className="notice">
          <span className="notice-badge">NOTICE</span>
          <li className="item bold">
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
              <span className="phrase bold" key={i}>
                {m}
              </span>
            ))}
          </div>
        </div>
        <div
          className="private-key-container flexCol"
          style={{
            display:
              unlocked && state.accountType === Tabs.SECOND ? 'flex' : 'none',
          }}
        >
          <span className="title">Private Key</span>
          <span className="private-key">{privateKey}</span>
        </div>
      </div>
      <div className="button-container content-wrap-padding flexCol">
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
          text={state.accountType === Tabs.FIRST ? mnemonic : privateKey}
          onCopy={() => {
            ClickToCloseMessage.success('Copied');
            sensors.track('teleport_mnemonic_backup_copy', { page: pathname });
          }}
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
            history.go(-1);
            sensors.track('teleport_mnemonic_backup_done', { page: pathname });
          }}
          block
          style={{
            display: unlocked ? 'block' : 'none',
          }}
        >
          Done
        </CustomButton>
      </div>
    </div>
  );
};

export default BackupCheck;
