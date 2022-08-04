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
import skynet from 'utils/skynet';
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';
const { sensors } = skynet;

const BackupCheck = () => {
  const { state, pathname } = useLocation<{
    hdWalletId: string;
    accountType: Tabs;
    address?: string;
  }>();

  const [unlocked, setUnlocked] = useState(false);
  const [psd, setPsd] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const wallet = useWallet();
  const history = useHistory();
  const ClickToCloseMessage = useStyledMessage();

  const [unlock, loading] = useWalletRequest(wallet.unlock, {
    onSuccess() {
      setUnlocked(true);
      switch (state.accountType) {
        case Tabs.FIRST:
          getMnemonic();
          break;
        case Tabs.SECOND:
          getPrivateKey();
          break;
      }
      sensors.track('teleport_mnemonic_backup_next', { page: pathname });
    },
    onError(err) {
      console.error(err.code);
      ClickToCloseMessage('error')({
        content: 'Wrong password',
        key: 'Wrong password',
      });
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
    const pk = await wallet.getPrivateKeyByHdWalletId(
      state.hdWalletId,
      state.address
    );
    if (pk) {
      if (pk.startsWith('0x')) {
        setPrivateKey(pk.replace('0x', ''));
      } else {
        setPrivateKey(pk);
      }
    }
  };

  /* const checksumPsd = async () => {
    const checksumPassed = await wallet.verifyPassword(psd).catch((e) => {
      ClickToCloseMessage('error')({
        content: 'Wrong password',
        key: 'Wrong password',
      });
      console.error(e.code);
    });
    if (checksumPassed) {
      
    }
  }; */
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
          If you switch browsers or computers, you will need to use the{' '}
          {state.accountType === Tabs.FIRST ? 'mnemonic' : 'private key '}
          phrase to restore your account.
        </p>
        <ul className="notice">
          <span className="notice-badge">NOTICE</span>
          <li className="item bold">
            Please keep it in a safe and confidential place.
          </li>
          <li className="item">
            Do not share the{' '}
            {state.accountType === Tabs.FIRST ? 'mnemonic' : 'private key'}{' '}
            phrase with anyone!
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
      <div className="backup-button-container content-wrap-padding flexCol">
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
            ClickToCloseMessage('success')('Copied');
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
            sensors.track('teleport_mnemonic_backup_done', { page: pathname });
            history.go(-1);
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
