import './style.less';
import React, { useMemo, useState } from 'react';
import { useAsyncEffect, useWallet, transferAddress2Display } from 'ui/utils';
import clsx from 'clsx';
import {
  AccountCreateType,
  BaseAccount,
  DisplayWalletManage,
  HdAccountStruct,
} from 'types/extend';
import { Object } from 'ts-toolbelt';
import { CHAINS } from 'constants/chain';
import { Tabs, WALLET_THEME_COLOR } from 'constants/wallet';
import Jazzicon from 'react-jazzicon';
import cloneDeep from 'lodash/cloneDeep';
import { IconComponent } from '../IconComponents';
import ChainIcons from '../ChainIcons';
import { CustomTab, WalletName } from '../Widgets';
import { NoContent } from '../universal/NoContent';

interface AccountSwitchProps {
  handleAccountClick?: (account: BaseAccount) => void;
  visible?: boolean;
}

export interface IDisplayAccountInfo {
  name: string;
  selected?: boolean;
  type: string;
  address: string;
  chain: CHAINS;
  walletName?: string;
}

const AccountSwitch: React.FC<AccountSwitchProps> = (
  props: AccountSwitchProps
) => {
  const wallet = useWallet();
  const [accountCreateType, setAccountCreateType] = useState(Tabs.FIRST);
  const [displayAccounts, setDisplayAccount] = useState<any>({});

  const isMnemonic = useMemo(() => {
    return accountCreateType === Tabs.FIRST;
  }, [accountCreateType]);

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
                    setDisplayAccount(Tabs.FIRST);
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
              if (a.selected) setAccountCreateType(Tabs.SECOND);
            }
          );
        }
      }
      setDisplayAccount(accounts);
    }
  }, [props.visible]);

  const accountList = useMemo(() => {
    if (!isMnemonic) {
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

  const handleTabClick = (tab: Tabs) => {
    setAccountCreateType(tab);
    if (tab === Tabs.FIRST) {
      if (displayAccounts?.hdAccount.every((ha) => !ha.selected)) {
        if (displayAccounts.hdAccount[0]) {
          displayAccounts.hdAccount[0].selected = true;
        }
        setDisplayAccount(displayAccounts);
      }
    }
  };

  const handleKeyringClick = (
    a: Object.Merge<HdAccountStruct, { selected?: boolean }>
  ) => {
    const tempDisplayAccounts = cloneDeep(displayAccounts);
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
    <div className="account-switch flexCol">
      <div className="header content-wrap-padding">
        <CustomTab
          tab1="ID Wallet"
          tab2="Normal Wallet"
          handleTabClick={handleTabClick}
        />
      </div>
      <div className="content flex">
        <div
          className="side-bar flexCol"
          style={{
            display: !isMnemonic || accountList?.length === 0 ? 'none' : 'flex',
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
        <div
          className="account-container flexCol"
          style={{
            paddingLeft: accountList?.length > 0 ? '24px' : '0',
          }}
        >
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
                  (a: Object.Merge<HdAccountStruct, { selected?: boolean }>) =>
                    a.selected
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
                        if (props.handleAccountClick) {
                          props.handleAccountClick(a);
                        }
                      }}
                      key={a.address}
                    >
                      <div className="account-left flex">
                        <Jazzicon
                          diameter={30}
                          seed={Number(a?.address?.substr(0, 8) || 0)}
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
  );
};

export default AccountSwitch;
