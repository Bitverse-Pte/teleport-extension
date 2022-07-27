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
import { Tabs, WALLET_THEME_COLOR } from 'constants/wallet';
import Jazzicon from 'react-jazzicon';
import { getUnit10ByAddress } from 'background/utils';
import { Drawer } from 'antd';
import * as _ from 'lodash';
import { useSelector } from 'react-redux';
import { CustomTab, WalletName } from '../Widgets';
import { NoContent } from '../universal/NoContent';
import { IconComponent } from '../IconComponents';
import ChainIcons from '../ChainIcons';
import { getProvider } from 'ui/selectors/selectors';
import { Ecosystem, Provider } from 'types/network';
import { useDarkmode } from 'ui/hooks/useDarkMode';

interface AccountSelectProps {
  onClose: (selected?: BaseAccount) => void;
  visible?: boolean;
  currentToAddress?: string;
}

const AccountSelect: React.FC<AccountSelectProps> = (
  props: AccountSelectProps
) => {
  const wallet = useWallet();
  const [accountCreateType, setAccountCreateType] = useState(Tabs.FIRST);
  const currentChain: Provider = useSelector(getProvider);
  const [displayAccounts, setDisplayAccount] = useState<any>({});
  const { t } = useTranslation();
  const isMnemonic = useMemo(() => {
    return accountCreateType === Tabs.FIRST;
  }, [accountCreateType]);
  const { isDarkMode } = useDarkmode();

  useAsyncEffect(async () => {
    const accounts: DisplayWalletManage = await wallet.getAccountList(true);
    if (accounts) {
      for (const k in accounts) {
        if (k === 'hdAccount') {
          accounts[k].forEach(
            (a: Object.Merge<HdAccountStruct, { selected?: boolean }>) => {
              a.selected = false;
              a.accounts.forEach(
                (
                  subAccount: Object.Merge<BaseAccount, { selected?: boolean }>
                ) => {
                  if (subAccount.address === props.currentToAddress) {
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
              a.selected = a.address === props.currentToAddress;
              if (a.selected) setAccountCreateType(Tabs.SECOND);
            }
          );
        }
      }
      //check selected account: make first hdAccount be selected, if not selected in accounts
      if (
        !accounts.hdAccount.find(
          (a: Object.Merge<HdAccountStruct, { selected?: boolean }>) =>
            a.selected
        ) &&
        !accounts.simpleAccount.find(
          (a: Object.Merge<BaseAccount, { selected?: boolean }>) => a.selected
        )
      ) {
        const firstSelect: Object.Merge<
          HdAccountStruct,
          { selected?: boolean }
        > = accounts.hdAccount[0];
        if (firstSelect) firstSelect.selected = true;
      }
      setDisplayAccount(accounts);
    }
  }, [props.visible]);

  const accountList = useMemo(() => {
    let list = [];
    if (accountCreateType === Tabs.SECOND) {
      list = displayAccounts?.simpleAccount;
    } else {
      list =
        displayAccounts?.hdAccount?.find(
          (a: Object.Merge<HdAccountStruct, { selected?: boolean }>) =>
            a.selected
        )?.accounts || [];
    }
    if (currentChain.ecosystem === Ecosystem.EVM) {
      return list.filter((item: any) => {
        return item?.ecosystem === Ecosystem.EVM;
      });
    }
    if (currentChain.ecosystem === Ecosystem.COSMOS) {
      return list.filter((item: any) => {
        return item?.chainCustomId === currentChain.id;
      });
    }
    return list;
  }, [displayAccounts, accountCreateType]);

  const handleTabClick = (type: Tabs) => {
    setAccountCreateType(type);
    if (type === Tabs.FIRST) {
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
      className={clsx('account-select-drawer', {
        dark: isDarkMode,
      })}
      title={t('Choose Account')}
      placement="bottom"
      visible={props.visible}
      maskClosable
      closable={false}
      onClose={() => props.onClose(undefined)}
      bodyStyle={{
        boxSizing: 'border-box',
        padding: '0',
      }}
      contentWrapperStyle={{
        borderRadius: '16px 16px 0 0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        className={clsx('account-select flexCol', {
          dark: isDarkMode,
        })}
      >
        <div className="header content-wrap-padding">
          <CustomTab
            tab1="ID Wallet"
            tab2="Normal Wallet"
            currentTab={accountCreateType}
            handleTabClick={handleTabClick}
          />
        </div>
        <div className="content flex">
          <div
            className="side-bar flexCol"
            style={{
              display:
                !isMnemonic || accountList?.length === 0 ? 'none' : 'flex',
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
                display: !isMnemonic ? 'none' : 'block',
                color: walletNameColor,
              }}
            >
              <WalletName width={100} cls="">
                {
                  displayAccounts?.hdAccount?.find(
                    (
                      a: Object.Merge<HdAccountStruct, { selected?: boolean }>
                    ) => a.selected
                  )?.hdWalletName
                }
              </WalletName>
            </span>
            <div className="accounts flexCol">
              {accountList?.length > 0 ? (
                accountList?.map(
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
                            seed={getUnit10ByAddress(a?.address)}
                          />
                          <div className="account-info flexCol">
                            <WalletName cls="account-name" width={100}>
                              {a.accountName || a.hdWalletName}
                            </WalletName>
                            <span className="account-address">
                              {transferAddress2Display(a.address)}
                            </span>
                          </div>
                        </div>
                        <div className="account-right">
                          {a.selected ? (
                            <IconComponent name="check" cls="base-text-color" />
                          ) : isMnemonic ? null : (
                            <ChainIcons coinType={a.coinType} />
                          )}
                        </div>
                      </div>
                    );
                  }
                )
              ) : (
                <NoContent title="Wallet" />
              )}
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default AccountSelect;
