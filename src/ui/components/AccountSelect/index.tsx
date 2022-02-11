import './style.less';
import React, { useMemo, useState } from 'react';
import { useAsyncEffect, useWallet, transferAddress2Display } from 'ui/utils';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  AccountCreateType,
  BaseAccount,
  DisplayWalletManage,
  HdAccountStruct,
} from 'types/extend';
import { Object } from 'ts-toolbelt';
import { WALLET_THEME_COLOR } from 'constants/wallet';
import Jazzicon from 'react-jazzicon';
import { Drawer } from 'antd';
import * as _ from 'lodash';

interface AccountSelectProps {
  onClose: (selected?: BaseAccount) => void;
  visible?: boolean;
  currentSelect?: BaseAccount;
}

const AccountSelect: React.FC<AccountSelectProps> = (
  props: AccountSelectProps
) => {
  const wallet = useWallet();
  const [accountCreateType, setAccountCreateType] = useState(
    AccountCreateType.MNEMONIC
  );
  const [displayAccounts, setDisplayAccount] = useState<any>({});
  const { t } = useTranslation();

  useAsyncEffect(async () => {
    const accounts: DisplayWalletManage = await wallet.getAccountList(true);
    const account: BaseAccount | undefined = await wallet.getCurrentAccount();
    if (accounts && account) {
      for (const k in accounts) {
        if (k === 'hdAccount') {
          accounts[k].forEach(
            (a: Object.Merge<HdAccountStruct, { selected?: boolean }>) => {
              a.selected = false;
              a.accounts.forEach(
                (
                  subAccount: Object.Merge<BaseAccount, { selected?: boolean }>
                ) => {
                  if (subAccount.address === account.address) {
                    subAccount.selected = true;
                    a.selected = true;
                    setDisplayAccount(AccountCreateType.MNEMONIC);
                  } else {
                    subAccount.selected = false;
                  }
                }
              );
            }
          );
        } else {
          accounts[k].forEach(
            (a: Object.Merge<BaseAccount, { selected?: boolean }>) => {
              a.selected = a.address === account.address;
              if (a.selected)
                setAccountCreateType(AccountCreateType.PRIVATE_KEY);
            }
          );
        }
      }
      setDisplayAccount(accounts);
    }
  }, [props.visible]);

  const accountList = useMemo(() => {
    if (accountCreateType === AccountCreateType.PRIVATE_KEY) {
      return displayAccounts?.simpleAccount;
    } else {
      return (
        displayAccounts?.hdAccount?.find(
          (a: Object.Merge<HdAccountStruct, { selected?: boolean }>) =>
            a.selected
        )?.accounts || []
      );
    }
  }, [displayAccounts, accountCreateType]);

  const handleTabClick = (type: AccountCreateType) => {
    setAccountCreateType(type);
    if (type === AccountCreateType.MNEMONIC) {
      if (displayAccounts?.hdAccount.every((ha) => !ha.selected)) {
        displayAccounts.hdAccount[0].selected = true;
        setDisplayAccount(displayAccounts);
      }
    }
  };

  const handleKeyringClick = (
    a: Object.Merge<HdAccountStruct, { selected?: boolean }>
  ) => {
    const tempDisplayAccounts = _.cloneDeep(displayAccounts);
    tempDisplayAccounts.hdAccount.forEach(
      (ha) => (ha.selected = ha.hdWalletId === a.hdWalletId)
    );
    setDisplayAccount(tempDisplayAccounts);
  };

  const walletNameColor = useMemo(() => {
    const i = displayAccounts?.hdAccount?.findIndex(
      (ha: Object.Merge<HdAccountStruct, { selected?: boolean }>) => ha.selected
    );
    if (i > -1) {
      return WALLET_THEME_COLOR[i % 5];
    }
    return '#0F83FF';
  }, [displayAccounts]);

  return (
    <Drawer
      title={t('Select Account')}
      placement="bottom"
      visible={props.visible}
      maskClosable
      closable={false}
      // use not select any address
      onClose={() => props.onClose(undefined)}
    >
      <div className="account-select flexCol">
        <div className="header">
          <div className="tab flex">
            <span
              className={clsx('tab-item', {
                'tab-item-active':
                  accountCreateType === AccountCreateType.MNEMONIC,
              })}
              onClick={() => handleTabClick(AccountCreateType.MNEMONIC)}
            >
              ID Wallet
            </span>
            <span
              className={clsx('tab-item', {
                'tab-item-active':
                  accountCreateType === AccountCreateType.PRIVATE_KEY,
              })}
              onClick={() => handleTabClick(AccountCreateType.PRIVATE_KEY)}
            >
              Normal
            </span>
          </div>
          <div className="active-container flex">
            <span
              className={clsx(
                'active',
                accountCreateType === AccountCreateType.MNEMONIC
                  ? 'id'
                  : 'normal'
              )}
            />
          </div>
        </div>
        <div className="content flex">
          <div
            className="side-bar flexCol"
            style={{
              display:
                accountCreateType === AccountCreateType.PRIVATE_KEY
                  ? 'none'
                  : 'flex',
            }}
          >
            {displayAccounts?.hdAccount?.map(
              (a: Object.Merge<HdAccountStruct, { selected?: boolean }>, i) => {
                return (
                  <span
                    className={clsx('flex id-item', {
                      'active-item': a.selected,
                    })}
                    style={{ background: WALLET_THEME_COLOR[i % 5] }}
                    onClick={() => handleKeyringClick(a)}
                    key={i}
                  >
                    {a.hdWalletName.substr(0, 1)}
                  </span>
                );
              }
            )}
          </div>
          <div className="account-container flexCol">
            <span
              className="wallet-name"
              style={{
                display:
                  accountCreateType === AccountCreateType.PRIVATE_KEY
                    ? 'none'
                    : 'block',
                color: walletNameColor,
              }}
            >
              {
                displayAccounts?.hdAccount?.find(
                  (a: Object.Merge<HdAccountStruct, { selected?: boolean }>) =>
                    a.selected
                )?.hdWalletName
              }
            </span>
            <div className="accounts flexCol">
              {accountList?.map(
                (a: Object.Merge<BaseAccount, { selected?: boolean }>) => {
                  return (
                    <div
                      className="account-item flex"
                      onClick={() => {
                        //selectAccount
                        props.onClose && props.onClose(a);
                      }}
                      key={a.address}
                    >
                      <div className="account-left flex">
                        <Jazzicon
                          diameter={30}
                          seed={Number(a?.address?.substr(0, 8) || 0)}
                        />
                        <div className="account-info flexCol">
                          <span className="account-name">
                            {a.accountName || a.hdWalletName}
                          </span>
                          <span className="account-address">
                            {transferAddress2Display(a.address)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default AccountSelect;
