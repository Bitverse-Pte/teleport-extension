import './style.less';
import React, { useState } from 'react';
import { useAsyncEffect, useWallet, transferAddress2Display } from 'ui/utils';
import { AccountCreateType, BaseAccount } from 'types/extend';
import { Object } from 'ts-toolbelt';
import Jazzicon from 'react-jazzicon';
import { WalletName } from '../Widgets';
import { useHistory, useLocation } from 'react-router-dom';
import { Tabs } from 'constants/wallet';
import keyDefaultIcon from 'assets/keyDefault.svg';
import keyActiveIcon from 'assets/keyActive.svg';
import siteDefaultIcon from 'assets/siteDefault.svg';
import siteActiveIcon from 'assets/siteActive.svg';
import classnames from 'classnames';
import skynet from 'utils/skynet';
import { getUnit10ByAddress } from 'background/utils';
import { Divider } from 'antd';

const { sensors } = skynet;

interface AccountSwitchProps {
  handleAccountClick?: (account: BaseAccount) => void;
  handleSiteClick?: (account: BaseAccount) => void;
  handleSiteClickCosm?: () => void;
  visible?: boolean;
  isEvm?: boolean;
}

const CurrentWalletAccountSwitch: React.FC<AccountSwitchProps> = (
  props: AccountSwitchProps
) => {
  const wallet = useWallet();
  const history = useHistory();
  const location = useLocation();
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
      {!props.isEvm && (
        <div className="connected-sites flexR">
          <div className="connected-sites-left flexR">Connected Sites</div>
          <div className="connected-sites-right flexR">
            <div
              className="connected-sites-action cursor flexR"
              onClick={(e) => {
                e.stopPropagation();
                if (props.handleSiteClickCosm) {
                  sensors.track('teleport_account_switch_connected_sites', {
                    page: location.pathname,
                  });
                  props.handleSiteClickCosm();
                }
              }}
            >
              <img
                src={siteDefaultIcon}
                className="connected-sites-action-icon key-default-icon"
              />
            </div>
          </div>
        </div>
      )}
      {!props.isEvm && <Divider style={{ margin: '16px 20px' }} />}
      <div className="accounts flexCol">
        {accountList?.map(
          (a: Object.Merge<BaseAccount, { selected?: boolean }>) => {
            return (
              <div
                className={classnames('account-item flexR', {
                  'account-list-active': a?.selected,
                })}
                onClick={() => {
                  if (props.handleAccountClick) {
                    sensors.track('teleport_account_switch_export', {
                      page: location.pathname,
                    });
                    props.handleAccountClick(a);
                  }
                }}
                key={a.address}
              >
                <div className="account-left flexR">
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
                <div className="account-right flexR">
                  <div
                    className="account-item-action cursor flexR"
                    onClick={(e) => {
                      e.stopPropagation();
                      history.push({
                        pathname: '/mnemonic-check',
                        state: {
                          hdWalletId: a.hdWalletId,
                          accountType: Tabs.SECOND,
                          address: a.address,
                        },
                      });
                    }}
                  >
                    <img
                      src={keyDefaultIcon}
                      className="account-item-action-icon key-default-icon"
                    />
                    <img
                      src={keyActiveIcon}
                      className="account-item-action-icon key-active-icon"
                    />
                  </div>
                  {props.isEvm && (
                    <div
                      className="account-item-action cursor flexR"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (props.handleSiteClick) {
                          sensors.track(
                            'teleport_account_switch_connected_sites',
                            {
                              page: location.pathname,
                            }
                          );
                          props.handleSiteClick(a);
                        }
                      }}
                    >
                      <img
                        src={siteDefaultIcon}
                        className="account-item-action-icon key-default-icon"
                      />
                      <img
                        src={siteActiveIcon}
                        className="account-item-action-icon key-active-icon"
                      />
                    </div>
                  )}
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
