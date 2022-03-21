import React, { Fragment, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ACCOUNT_IMPORT_TYPE, MIN_PASSWORD_LENGTH } from 'constants/index';
import { Button, Checkbox, Input, message } from 'antd';
import { usePolicyAgreed, useWallet, useWalletRequest } from 'ui/utils';
import './style.less';
import { CreateAccountOpts, ImportAccountOpts } from 'types/extend';
import { CoinType, Provider } from 'types/network';
import ChainSelect from 'ui/components/ChainSelect';
import {
  CustomButton,
  CustomInput,
  CustomPasswordInput,
  CustomTab,
  PasswordCheckPassed,
} from 'ui/components/Widgets';
import { ErrorCode } from 'constants/code';
import { IconComponent } from 'ui/components/IconComponents';
import { Tabs } from 'constants/wallet';
import { useSeedPhraseValidation } from 'ui/hooks/validation/useSeedPhraseValidation';
import { usePrivateKeyValidation } from 'ui/hooks/validation/usePrivateKeyValidation';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';

const { TextArea } = Input;

export interface AccountHeaderProps {
  title: string;
  hideClose?: boolean;
  handleCloseIconClick?: () => void;
}

export const AccountHeader = (props: AccountHeaderProps) => {
  const handleBackClick = () => {
    if (props.handleCloseIconClick) {
      props.handleCloseIconClick();
      return;
    }
    history.go(-1);
  };

  return (
    <div className="account-header-container flexR">
      <span className="account-header-title">{props.title}</span>
      <IconComponent
        name="close"
        style={props.hideClose ? { display: 'none' } : {}}
        onClick={handleBackClick}
        cls="account-header-close-icon"
      />
    </div>
  );
};

const AccountRecover = () => {
  const history = useHistory();
  const [importType, setImportType] = useState(Tabs.FIRST);
  const [agreed, setAgreed] = useState(false);
  const [textareaActive, setTextareaActive] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  // const mnemonicError = useSeedPhraseValidation(mnemonic);
  // const privateKeyError = usePrivateKeyValidation(privateKey);

  const [psd, setPsd] = useState('');
  const [confirmPsd, setConfirmPsd] = useState('');
  const [name, setName] = useState('');
  const wallet = useWallet();
  const [policyShow, updateStoragePolicyAgreed] = usePolicyAgreed();
  const [passwordCheckPassed, setPasswordCheckPassed] = useState(false);
  const [coinType, setCoinType] = useState(CoinType.ETH);
  const { t } = useTranslation();

  const handleSuccessCallback = () => {
    updateStoragePolicyAgreed();
    history.push({
      pathname: '/home',
    });
  };
  const handleErrorCallback = (e) => {
    console.error(e.code);

    switch (e?.code) {
      case ErrorCode.ADDRESS_REPEAT:
        ClickToCloseMessage.error('Account already exists');
        break;
      case ErrorCode.INVALID_MNEMONIC:
        ClickToCloseMessage.error('Invalid mnemonic');
        break;
      case ErrorCode.INVALID_PRIVATE_KEY:
        ClickToCloseMessage.error('Invalid private key');
        break;
      default:
        if (importType === Tabs.FIRST) {
          ClickToCloseMessage.error('Invalid mnemonic');
        } else {
          ClickToCloseMessage.error('Invalid private key');
        }
    }
  };

  const [recover, recoverLoading] = useWalletRequest(
    wallet.importHdWalletByMnemonic,
    {
      onSuccess: handleSuccessCallback,
      onError: handleErrorCallback,
    }
  );
  const [importKeystore, importLoading] = useWalletRequest(
    wallet.importKeyringByPrivateKey,
    {
      onSuccess: handleSuccessCallback,
      onError: handleErrorCallback,
    }
  );

  const disabled = useMemo(
    () => {
      const str =
        (policyShow &&
          (!agreed ||
            (importType === Tabs.FIRST && !mnemonic) ||
            (importType === Tabs.SECOND && !privateKey) ||
            !psd ||
            !confirmPsd ||
            !name.trim() ||
            !passwordCheckPassed)) ||
        (!policyShow &&
          ((importType === Tabs.FIRST && !mnemonic) ||
            (importType === Tabs.SECOND && !privateKey) ||
            !name.trim()));
      return Boolean(str);
    },
    policyShow
      ? [
          name,
          agreed,
          mnemonic,
          privateKey,
          psd,
          confirmPsd,
          passwordCheckPassed,
        ]
      : [name, mnemonic, privateKey]
  );

  const submit = () => {
    if (name.trim().length > 20) {
      ClickToCloseMessage.error('Name length should be 1-20 chars');
      return;
    }
    if (policyShow) {
      if (psd.trim() !== confirmPsd.trim()) {
        ClickToCloseMessage.error("Password don't match");
        return;
      }
    }

    /**
     * So it seems to detect by `importType`
     * no problem to hide other tabs
     */
    if (importType === Tabs.FIRST) {
      const importAccountOpts: CreateAccountOpts = {
        name: name.trim(),
        mnemonic: mnemonic.trim(),
      };
      if (policyShow) {
        importAccountOpts.password = psd;
      }
      recover(importAccountOpts);
    } else {
      const importAccountOpts: ImportAccountOpts = {
        name: name.trim(),
        coinType,
        privateKey: privateKey.startsWith('0x')
          ? privateKey.trim()
          : `0x${privateKey.trim()}`,
      };
      if (policyShow) {
        importAccountOpts.password = psd;
      }
      importKeystore(importAccountOpts);
    }
  };

  return (
    <div className="recover flexCol">
      <AccountHeader title="Import Wallet" />
      <div className="account-recover-content content-wrap-padding">
        <CustomTab
          tab1="Mnemonic"
          tab2="Private Key"
          currentTab={importType}
          handleTabClick={(tab: Tabs) => {
            setImportType(tab);
          }}
        />
        <p className="account-recover-title">
          {importType === Tabs.FIRST ? 'Mnemonic' : 'Wallet Private key'}
        </p>
        <div className={clsx(importType !== Tabs.FIRST && 'hidden')}>
          <TextArea
            className={clsx('recover-textarea', {
              'textarea-active': textareaActive,
            })}
            onFocus={() => setTextareaActive(true)}
            /**
             * DK suggested that we should use `onBlur` instead of `onChange`
             * so we only fire setField when losing focus
             */
            onBlur={(e) => {
              setMnemonic(e.target.value);
              setTextareaActive(false);
            }}
            placeholder="Click on the space to change words"
            rows={4}
          />
          {/* {mnemonicError && (
            <p className="secret-error-detail">{t(mnemonicError)}</p>
          )} */}
        </div>
        <div className={clsx(importType !== Tabs.SECOND && 'hidden')}>
          <CustomPasswordInput
            onBlur={(e) => {
              /**
               * use `.trim()` to avoid space in front or end.
               */
              setPrivateKey(e.target.value.trim());
            }}
            placeholder="Enter private key"
            cls="private-key-input"
          />
          {/* {privateKeyError && (
            <p className="secret-error-detail">{t(privateKeyError)}</p>
          )} */}
        </div>

        {/* @todo: enable below when cosmos supported */}
        {/* <p
          className="account-recover-title"
          style={{
            display: importType === Tabs.SECOND ? 'block' : 'none',
          }}
        >
          Belonging Chain
        </p>
        <ChainSelect
          style={{
            display: importType === Tabs.SECOND ? 'flex' : 'none',
          }}
          handleChainSelect={(chain: Provider) => {
            setCoinType(chain.coinType);
          }}
        /> */}

        <p className="account-recover-title">Wallet name</p>
        <CustomInput
          placeholder="Enter wallet name"
          onChange={(e) => {
            /**
             * use `.trim()` to avoid space in front or end.
             */
            setName(e.target.value.trim());
          }}
        />
        <div
          className="password-container"
          style={{ display: policyShow ? 'block' : 'none' }}
        >
          <p className="account-recover-title">Password</p>
          <p className="account-create-notice">
            Will be used to encrypt your data and unlock your wallet.
          </p>
          <CustomPasswordInput
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
          <p className="account-recover-title">Confirm password</p>
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
                ClickToCloseMessage.error("Password don't match");
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
          loading={importType === Tabs.FIRST ? recoverLoading : importLoading}
          disabled={disabled}
        >
          Import
        </CustomButton>
      </div>
    </div>
  );
};

export default AccountRecover;
