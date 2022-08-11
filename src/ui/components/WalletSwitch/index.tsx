import '../../views/WalletManage/style.less';
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAsyncEffect, useWallet } from 'ui/utils';
import { AccountCreateType, BaseAccount, HdAccountStruct } from 'types/extend';
import { Tabs, WALLET_THEME_COLOR } from 'constants/wallet';
import { CustomTab, WalletName } from 'ui/components/Widgets';
import { IconComponent } from 'ui/components/IconComponents';
import noWallets from 'assets/noAssets.svg';
import noAssetsDark from 'assets/noAssetDark.svg';
import { ecosystemToIconSVG } from 'ui/utils/networkCategoryToIcon';
import skynet from 'utils/skynet';
import BitError from 'error';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
const { sensors } = skynet;

interface Props {
  handleWalletClick: () => void;
  visible: boolean;
}

const WalletSwitch: React.FC<Props> = (props: Props) => {
  const { isDarkMode } = useDarkmode();
  const history = useHistory();
  const location = useLocation();
  const wallet = useWallet();
  const [hdWalletAccounts, setHdWalletAccount] = useState<any>([]);
  const [simpleWalletAccounts, setSimpleWalletAccount] = useState<
    HdAccountStruct[]
  >([]);
  const [accountType, setAccountType] = useState(Tabs.FIRST);
  const [currentAccount, setCurrentAccount] = useState<BaseAccount>();

  const queryWallets = async () => {
    const accounts: HdAccountStruct[] = await wallet.getWalletList();
    const hdWallets: HdAccountStruct[] = [],
      simpleWallets: HdAccountStruct[] = [];
    if (accounts?.length > 0) {
      accounts.forEach((a: HdAccountStruct) => {
        if (a.accounts[0]?.accountCreateType === AccountCreateType.MNEMONIC) {
          hdWallets.push(a);
        } else if (
          a.accounts[0]?.accountCreateType === AccountCreateType.PRIVATE_KEY
        ) {
          simpleWallets.push(a);
        }
      });
      setHdWalletAccount(hdWallets);
      setSimpleWalletAccount(simpleWallets);
    }

    const current: BaseAccount = await wallet.getCurrentAccount();
    if (current) {
      setCurrentAccount(current);
      if (current.accountCreateType === AccountCreateType.MNEMONIC) {
        setAccountType(Tabs.FIRST);
      } else {
        setAccountType(Tabs.SECOND);
      }
    }
  };

  useEffect(() => {
    queryWallets();
  }, [props.visible]);

  const handleWalletClick = async (w: HdAccountStruct) => {
    sensors.track('teleport_wallet_manage_wallet_click', {
      page: location.pathname,
    });
    if (currentAccount?.hdWalletId === w?.accounts[0]?.hdWalletId) {
      return;
    }
    wallet
      .changeAccountByWalletId(
        w.hdWalletId,
        w.accounts[0].ecosystem,
        w.accounts[0].accountCreateType
      )
      .then(() => {
        props.handleWalletClick();
      })
      .catch((e: BitError) => {
        console.error(e);
      });
  };

  return (
    <div
      className={clsx('wallet-manage flexCol wallet-manage-wallet-switch', {
        dark: isDarkMode,
      })}
    >
      <div className="tab-container flexR content-wrap-padding">
        <CustomTab
          tab1="ID Wallet"
          currentTab={accountType}
          tab2="Normal Wallet"
          showToolTips
          tip1="Created/Imported with mnemonic words"
          tip2="Imported with private key"
          handleTabClick={(tab: Tabs) => {
            setAccountType(tab);
          }}
        />
      </div>
      <div className="content flexCol">
        <div className="account-container flexR">
          {(accountType === Tabs.FIRST
            ? hdWalletAccounts
            : simpleWalletAccounts
          ).length > 0 ? (
            <div className="list flexCol">
              {(accountType === Tabs.FIRST
                ? hdWalletAccounts
                : simpleWalletAccounts
              ).map((w: HdAccountStruct, i: number) => (
                <div
                  className={`item wallet-switch-item flexR ${
                    currentAccount?.hdWalletId === w?.hdWalletId
                      ? '_active'
                      : ''
                  }`}
                  key={w.hdWalletId}
                  onClick={() => {
                    handleWalletClick(w);
                  }}
                >
                  <div
                    className="circle flexR"
                    style={{ background: WALLET_THEME_COLOR[i % 5] }}
                  >
                    {w?.hdWalletName?.substr(0, 1)}
                    <div
                      className="circle-wrap flexR"
                      style={{
                        display: accountType === Tabs.SECOND ? 'flex' : 'none',
                      }}
                    >
                      <img
                        src={ecosystemToIconSVG(w?.accounts[0]?.ecosystem)}
                        className="circle-ecosystem-icon"
                      />
                    </div>
                  </div>
                  <div className="right flexR">
                    <WalletName cls="name-account-name" width={100}>
                      {w?.hdWalletName}
                    </WalletName>
                    <IconComponent
                      name="check"
                      cls="base-text-color"
                      style={{
                        display:
                          currentAccount?.hdWalletId === w?.hdWalletId
                            ? 'block'
                            : 'none',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data flexCol">
              <img
                src={isDarkMode ? noAssetsDark : noWallets}
                className="home-no-assets"
              />
              <span className="no-assets-title">No Wallet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletSwitch;
