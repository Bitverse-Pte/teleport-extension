import './style.less';
import React, { useMemo, useState } from 'react';
import { useAsyncEffect, useWallet, transferAddress2Display } from 'ui/utils';
import clsx from 'clsx';
import { AccountCreateType, BaseAccount } from 'types/extend';
import { Object } from 'ts-toolbelt';
import Jazzicon from 'react-jazzicon';
import cloneDeep from 'lodash/cloneDeep';
import { IconComponent } from '../IconComponents';
import { WalletName } from '../Widgets';

interface AccountSwitchProps {
  handleAccountClick?: (account: BaseAccount) => void;
  visible?: boolean;
}

const CurrentWalletAccountSwitch: React.FC<AccountSwitchProps> = (
  props: AccountSwitchProps
) => {
  const wallet = useWallet();
  const [accountList, setAccountList] =
    useState<Object.Merge<BaseAccount, { selected?: boolean }>[]>();
  const [walletName, setWalletName] = useState('');

  useAsyncEffect(async () => {
    const accounts: Object.Merge<BaseAccount, { selected?: boolean }>[] =
      await wallet.getCurrentChainAccounts();
    const currentAccount: BaseAccount | undefined =
      await wallet.getCurrentAccount();
    if (currentAccount?.accountCreateType === AccountCreateType.MNEMONIC) {
      setWalletName(currentAccount.hdWalletName);
    }
    if (accounts && accounts.length > 0 && currentAccount) {
      accounts.forEach(
        (a: Object.Merge<BaseAccount, { selected?: boolean }>) => {
          if (a.address === currentAccount.address) a.selected = true;
        }
      );
      setAccountList(accounts);
    }
  }, [props.visible]);

  return (
    <div className="current-wallet-account-switch flexCol">
      <p
        className=" content-wrap-padding"
        style={walletName ? {} : { display: 'none' }}
      ></p>
      <WalletName
        cls={`account-switch-wallet-name account-name content-wrap-padding ${
          walletName ? '' : 'hide'
        }`}
        width={250}
      >
        {walletName}
      </WalletName>
      <div className="accounts flexCol">
        {accountList?.map(
          (a: Object.Merge<BaseAccount, { selected?: boolean }>) => {
            return (
              <div
                className="account-item flexR"
                onClick={() => {
                  if (props.handleAccountClick) {
                    props.handleAccountClick(a);
                  }
                }}
                key={a.address}
              >
                <div className="account-left flexR">
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
                  ) : null}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default CurrentWalletAccountSwitch;
