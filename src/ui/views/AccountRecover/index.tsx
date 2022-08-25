import React, { useMemo, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Checkbox, Input } from 'antd';
import { usePolicyAgreed, useWallet, useWalletRequest } from 'ui/utils';
import './style.less';
import { CreateAccountOpts, ImportAccountOpts } from 'types/extend';
import { Provider } from 'types/network';
import {
  CustomButton,
  CustomInput,
  CustomPasswordInput,
  CustomTab,
  PasswordCheckPassed,
} from 'ui/components/Widgets';
import { ErrorCode } from 'constants/code';
import { IconComponent } from 'ui/components/IconComponents';
import { MnemonicCount, MnemonicCountList, Tabs } from 'constants/wallet';
import skynet from 'utils/skynet';
import EcosystemSelect from 'ui/components/EcosystemSelect';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';
import * as bip39 from 'bip39';
import { cloneDeep } from 'lodash';

const { sensors } = skynet;
const { TextArea } = Input;

export interface AccountHeaderProps {
  title: string;
  hideClose?: boolean;
  isScroll?: boolean;
  handleCloseIconClick?: () => void;
}

export const AccountHeader = (props: AccountHeaderProps) => {
  const { isDarkMode } = useDarkmode();
  const handleBackClick = () => {
    sensors.track('teleport_account_manage_closed', {
      page: location.pathname,
      title: props.title,
    });
    if (props.handleCloseIconClick) {
      props.handleCloseIconClick();
      return;
    }
    history.go(-1);
  };

  return (
    <div
      className={clsx('account-header-container flexR', {
        dark: isDarkMode,
        isScroll: props.isScroll,
      })}
    >
      <span className="account-header-title">{props.title}</span>
      <IconComponent
        name="close"
        style={props.hideClose ? { display: 'none' } : {}}
        onClick={handleBackClick}
        cls="account-header-close-icon icon-close"
      />
    </div>
  );
};

const AccountRecover = () => {
  const history = useHistory();
  const location = useLocation();
  const [importType, setImportType] = useState(Tabs.FIRST);
  const [agreed, setAgreed] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [isScroll, setIsScroll] = useState(false);

  // const mnemonicError = useSeedPhraseValidation(mnemonic);
  // const privateKeyError = usePrivateKeyValidation(privateKey);

  const [psd, setPsd] = useState('');
  const [confirmPsd, setConfirmPsd] = useState('');
  const [name, setName] = useState('');
  const wallet = useWallet();
  const [policyShow, updateStoragePolicyAgreed] = usePolicyAgreed();
  const [passwordCheckPassed, setPasswordCheckPassed] = useState(false);
  const [privateKeyChains, setPrivateKeyChains] = useState<Provider[]>([]);
  const { isDarkMode } = useDarkmode();
  const ClickToCloseMessage = useStyledMessage();

  const [shownMnemonicIndex, setShownMnemonicIndex] = useState(-1);

  const [seedType, _setSeedType] = useState(MnemonicCount.WORDS_12);
  const [seedWords, setSeedWords] = useState<string[]>(
    new Array<string>(12).fill('')
  );

  const [errorMnemonicIndexList, setErrorMnemonicIndexList] = useState<
    number[]
  >([]);

  /* const [privateKeyMasterChain, setPrivateKeyMasterChain] = useState<
    PresetNetworkId | string
  >(); */

  //const providerContext = useContext(NetworkProviderContext);
  //const { t } = useTranslation();

  const handleSuccessCallback = async () => {
    updateStoragePolicyAgreed();
    sensors.track('teleport_account_recover_imported', {
      page: location.pathname,
      importType: importType,
    });
    //TODO (Jayce) Cosmos Provider is not support now
    /* if (policyShow && importType === Tabs.SECOND) {
      await providerContext?.useProviderById(privateKeyMasterChain as string).catch(e => {
        console.error(e);
      });
    } */

    history.push({
      pathname: '/home',
    });
  };
  const handleErrorCallback = (e) => {
    console.error(e.code);

    switch (e?.code) {
      case ErrorCode.ADDRESS_REPEAT:
        ClickToCloseMessage('error')({
          content: 'Account already exists',
          key: 'Account already exists',
        });
        break;
      case ErrorCode.INVALID_MNEMONIC:
        ClickToCloseMessage('error')({
          content: 'Invalid mnemonic',
          key: 'Invalid mnemonic',
        });
        break;
      case ErrorCode.INVALID_PRIVATE_KEY:
        ClickToCloseMessage('error')({
          content: 'Invalid private key',
          key: 'Invalid private key',
        });
        break;
      case ErrorCode.WALLET_NAME_REPEAT:
        ClickToCloseMessage('error')({
          content: 'Name already exists',
          key: 'Name already exists',
        });
        break;
      default:
        //It will misled developer if using the same error msg
        ClickToCloseMessage('error')({
          content: 'unexcept error',
          key: 'unexcept error',
        });
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
            (importType === Tabs.FIRST &&
              (seedWords.length < 9 || errorMnemonicIndexList.length > 0)) ||
            (importType === Tabs.SECOND && !privateKey) ||
            !psd ||
            !confirmPsd ||
            !name.trim() ||
            !passwordCheckPassed)) ||
        (!policyShow &&
          ((importType === Tabs.FIRST &&
            (seedWords.length < 9 || errorMnemonicIndexList.length > 0)) ||
            (importType === Tabs.SECOND && !privateKey) ||
            !name.trim()));
      return Boolean(str);
    },
    policyShow
      ? [
          name,
          importType,
          agreed,
          seedWords,
          errorMnemonicIndexList,
          privateKey,
          psd,
          confirmPsd,
          passwordCheckPassed,
        ]
      : [importType, name, seedWords, errorMnemonicIndexList, privateKey]
  );

  const submit = () => {
    if (name.trim().length > 20) {
      ClickToCloseMessage('error')({
        content: 'Name length should be 1-20 characters',
        key: 'Name length should be 1-20 characters',
      });
      return;
    }
    if (policyShow) {
      if (psd.trim() !== confirmPsd.trim()) {
        ClickToCloseMessage('error')({
          content: "Password don't match",
          key: "Password don't match",
        });
        return;
      }
    }

    /**
     * So it seems to detect by `importType`
     * no problem to hide other tabs
     */
    if (importType === Tabs.FIRST) {
      let invalidPhrase = false;
      const errorList = cloneDeep(errorMnemonicIndexList);
      seedWords.forEach((w, i: number) => {
        if (!bip39.wordlists.english.includes(w)) {
          invalidPhrase = true;
          errorList.push(i);
        }
      });
      setErrorMnemonicIndexList(errorList);
      if (invalidPhrase) return;
      console.log(seedWords.join(' ').trim());
      const importAccountOpts: CreateAccountOpts = {
        name: name.trim(),
        mnemonic: seedWords.join(' ').trim(),
      };
      if (policyShow) {
        importAccountOpts.password = psd;
      }
      recover(importAccountOpts);
    } else {
      const importAccountOpts: ImportAccountOpts = {
        name: name.trim(),
        chains: privateKeyChains,
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

  const onBodyScroll = (e) => {
    console.log();
    if (e.target.scrollTop > 0) {
      setIsScroll(true);
    } else {
      setIsScroll(false);
    }
  };

  const handlePaste = (index: number, value: string) => {
    const words = value
      .trim()
      .split(' ')
      .map((word) => word.trim());

    if (
      words.length === 12 ||
      words.length === 15 ||
      words.length === 18 ||
      words.length === 21 ||
      words.length === 24
    ) {
      // 12/24 words are treated specially.
      // Regardless of where it is pasted from, if it is a valid seed, it will be processed directly.
      if (bip39.validateMnemonic(words.join(' '))) {
        switch (words.length) {
          case 12:
            setSeedType(MnemonicCount.WORDS_12);
            break;
          case 15:
            setSeedType(MnemonicCount.WORDS_15);
            break;
          case 18:
            setSeedType(MnemonicCount.WORDS_18);
            break;
          case 21:
            setSeedType(MnemonicCount.WORDS_21);
            break;
          case 24:
            setSeedType(MnemonicCount.WORDS_24);
            break;
        }
        setSeedWords(words);
        return;
      }
    }

    let newSeedWords = seedWords.slice();
    const expectedLength = Math.min(index + words.length, 24);

    if (seedWords.length < expectedLength) {
      newSeedWords = newSeedWords.concat(
        new Array(expectedLength - seedWords.length).fill('')
      );

      if (expectedLength > 21) {
        setSeedType(MnemonicCount.WORDS_24);
      } else if (expectedLength > 18) {
        setSeedType(MnemonicCount.WORDS_21);
      } else if (expectedLength > 15) {
        setSeedType(MnemonicCount.WORDS_18);
      } else if (expectedLength > 12) {
        setSeedType(MnemonicCount.WORDS_15);
      } else {
        setSeedType(MnemonicCount.WORDS_12);
      }
    }

    for (let i = index; i < expectedLength; i++) {
      newSeedWords[i] = words[i - index];
    }

    setSeedWords(newSeedWords);
  };

  const setSeedType = (seedType: MnemonicCount) => {
    _setSeedType(seedType);
    setShownMnemonicIndex(-1);
    setErrorMnemonicIndexList([]);
    const selected = MnemonicCountList.find((m) => m.type === seedType);
    if (selected) {
      setSeedWords((seedWords) => {
        switch (seedType) {
          case MnemonicCount.WORDS_12:
            if (seedWords.length < 12) {
              return seedWords.concat(
                new Array(12 - seedWords.length).fill('')
              );
            } else {
              return seedWords.slice(0, 12);
            }
          case MnemonicCount.WORDS_15:
            if (seedWords.length < 15) {
              return seedWords.concat(
                new Array(15 - seedWords.length).fill('')
              );
            } else {
              return seedWords.slice(0, 15);
            }
          case MnemonicCount.WORDS_18:
            if (seedWords.length < 18) {
              return seedWords.concat(
                new Array(18 - seedWords.length).fill('')
              );
            } else {
              return seedWords.slice(0, 18);
            }
          case MnemonicCount.WORDS_21:
            if (seedWords.length < 21) {
              return seedWords.concat(
                new Array(21 - seedWords.length).fill('')
              );
            } else {
              return seedWords.slice(0, 21);
            }
          case MnemonicCount.WORDS_24:
            if (seedWords.length < 24) {
              return seedWords.concat(
                new Array(24 - seedWords.length).fill('')
              );
            } else {
              return seedWords.slice(0, 24);
            }
        }
      });
    }
  };

  return (
    <div className={clsx('recover flexCol', { dark: isDarkMode })}>
      <AccountHeader title="Import Wallet" isScroll={isScroll} />
      <div
        className="account-recover-content content-wrap-padding"
        onScroll={onBodyScroll}
      >
        <CustomTab
          tab1="Mnemonic"
          tab2="Private Key"
          currentTab={importType}
          handleTabClick={(tab: Tabs) => {
            setImportType(tab);
          }}
        />
        <p className="account-recover-title">Wallet name</p>
        <CustomInput
          placeholder="Enter wallet name"
          onChange={(e) => {
            /**
             * use `.trim()` to avoid space in front or end.
             */
            setName(e.target.value.trim());
          }}
          onBlur={() => {
            if (name.trim().length > 20) {
              ClickToCloseMessage('error')({
                content: 'Name length should be 1-20 characters',
                key: 'Name length should be 1-20 characters',
              });
              return;
            }
          }}
        />
        <p className="account-recover-title mnemonic-title">
          {importType === Tabs.FIRST ? 'Mnemonic' : 'Wallet Private key'}
        </p>
        <div
          className={clsx(
            importType !== Tabs.FIRST && 'hidden',
            'account-recover-mnemonic-count-selector-container flexR'
          )}
        >
          <span className="account-recover-mnemonic-count-selector-text">
            I have
          </span>
          <div className="account-recover-mnemonic-count-selector-item-container flexR">
            {MnemonicCountList.map((m) => (
              <span
                className={clsx(
                  'account-recover-mnemonic-count-selector-item cursor',
                  {
                    'item-active': m.type === seedType,
                  }
                )}
                key={m.type}
                onClick={() => {
                  setSeedType(m.type);
                }}
              >
                {m.count}
              </span>
            ))}
          </div>
          <span className="account-recover-mnemonic-count-selector-text">
            seed phrase
          </span>
        </div>
        <div
          className={clsx(
            importType !== Tabs.FIRST && 'hidden',
            'account-recover-mnemonic-container'
          )}
        >
          {seedWords.map((word, index) => {
            return (
              <div key={index} className="mnemonic-item-container flexR">
                <div className="mnemonic-index">{index + 1}.</div>
                <Input
                  type={shownMnemonicIndex === index ? 'text' : 'password'}
                  className={clsx('mnemonic-item-input', {
                    'error-mnemonic-input':
                      errorMnemonicIndexList.includes(index),
                  })}
                  onPaste={(e) => {
                    e.preventDefault();
                    handlePaste(index, e.clipboardData.getData('text'));
                  }}
                  onChange={(e) => {
                    e.preventDefault();
                    const errorList = cloneDeep(errorMnemonicIndexList);
                    if (errorList.includes(index)) {
                      errorList.splice(
                        errorList.findIndex((p) => p === index),
                        1
                      );
                      setErrorMnemonicIndexList(errorList);
                    }
                    if (
                      shownMnemonicIndex >= 0 &&
                      shownMnemonicIndex !== index
                    ) {
                      setShownMnemonicIndex(-1);
                    }

                    const newSeedWords = seedWords.slice();
                    newSeedWords[index] = e.target.value.trim();
                    setSeedWords(newSeedWords);
                  }}
                  value={word}
                  suffix={
                    <div
                      style={{
                        position: 'absolute',
                        right: '8px',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        zIndex: 1000,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setShownMnemonicIndex((prev) => {
                          if (prev === index) {
                            return -1;
                          }
                          return index;
                        });
                      }}
                    >
                      {shownMnemonicIndex === index ? (
                        <IconComponent name="eye" cls="base-text-color" />
                      ) : (
                        <IconComponent name="eye-off" cls="base-text-color" />
                      )}
                    </div>
                  }
                />
              </div>
            );
          })}
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
            cls="private-key-input custom-password-input"
          />
        </div>
        {importType === Tabs.SECOND ? (
          <p className="account-recover-title">Chain Type</p>
        ) : null}
        <EcosystemSelect
          style={importType === Tabs.FIRST ? { display: 'none' } : {}}
          handleEcosystemSelect={(chains: Provider[], originChainId) => {
            setPrivateKeyChains(chains);
            //setPrivateKeyMasterChain(originChainId);
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
          <p className="account-recover-title">Confirm password</p>
          <CustomPasswordInput
            cls="custom-password-input"
            onChange={(e) => {
              setConfirmPsd(e.target.value);
            }}
            onBlur={(e) => {
              if (
                psd.trim() &&
                e.target.value?.trim() &&
                psd.trim() !== e.target.value?.trim()
              ) {
                ClickToCloseMessage('error')({
                  content: "Password don't match",
                  key: "Password don't match",
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
        <span
          className="invalid-phrase"
          style={{
            display:
              importType === Tabs.FIRST && errorMnemonicIndexList.length > 0
                ? 'block'
                : 'none',
          }}
        >
          Invalid word
        </span>
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
