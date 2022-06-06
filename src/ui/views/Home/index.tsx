import React, { useMemo, useState, useEffect } from 'react';
import { cloneDeep } from 'lodash';
import { useHistory } from 'react-router-dom';
import Jazzicon from 'react-jazzicon';
import { Drawer } from 'antd';
import {
  useWallet,
  useAsyncEffect,
  transferAddress2Display,
  denom2SymbolRatio,
  getTotalPricesByAmountAndPrice,
} from 'ui/utils';
import Setting from 'ui/views/Setting';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { HomeHeader } from 'ui/components/Home/Header';
import { AccountCreateType, BaseAccount } from 'types/extend';
import { IconComponent } from 'ui/components/IconComponents';
import { Token } from 'types/token';
import {
  CustomButton,
  CustomTab,
  SearchInput,
  TipButton,
  TokenIcon,
  WalletName,
} from 'ui/components/Widgets';
import { TransactionsList } from 'ui/components/TransactionList';
import './style.less';
import { Tabs, TipButtonEnum } from 'constants/wallet';
import { NoContent } from 'ui/components/universal/NoContent';
import AddTokenImg from '../../../assets/addToken.svg';
import ArrowRight from '../../../assets/arrowRight.svg';
import skynet from 'utils/skynet';
const { sensors } = skynet;

import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import CurrentWalletAccountSwitch from 'ui/components/CurrentWalletAccountSwitch';
import { addEllipsisToEachWordsInTheEnd } from 'ui/helpers/utils/currency-display.util';
import ConnectedSites from '../ConnectedSites';
import { Ecosystem, Provider } from 'types/network';
import { getProvider } from 'ui/selectors/selectors';
import { useSelector } from 'react-redux';

const onCopy = () => {
  sensors.track('teleport_home_copy_account', { page: location.pathname });
  ClickToCloseMessage.success('Copied');
};
const Home = () => {
  const history = useHistory();
  const wallet = useWallet();
  const [account, setAccount] = useState<BaseAccount>();
  const [account2ConnectedSite, setAccount2ConnectedSite] =
    useState<BaseAccount>();
  //const [accountList, setAccountList] = useState<DisplayWalletManage>();
  const [accountPopupVisible, setPopupVisible] = useState(false);
  const [settingPopupVisible, setSettingPopupVisible] = useState(false);
  const [connectedSitePopupVisible, setConnectedSitePopupVisible] =
    useState(false);
  const [tabType, setTabType] = useState(Tabs.FIRST);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filterCondition, setFilterCondition] = useState('');
  const [prices, setPrices] = useState();
  const currentChain: Provider = useSelector(getProvider);

  const getTokenBalancesAsync = async () => {
    const balances = await wallet.getTokenBalancesAsync().catch((e) => {
      console.error(e);
    });
    if (balances && balances.length) setTokens(balances);
  };

  useEffect(() => {
    const timer = setInterval(getTokenBalancesAsync, 15000);
    return () => clearInterval(timer);
  }, []);

  const queryTokenPrices = async () => {
    const prices = await wallet.queryTokenPrices().catch((e) => {
      console.error(e);
    });
    if (prices) setPrices(prices);
  };

  const getTokenBalancesSync = async () => {
    const balances = await wallet.getTokenBalancesSync().catch((e) => {
      console.error(e);
    });

    if (balances && balances.length) {
      setTokens(balances);
    }
  };

  const updateAccount = async () => {
    const account: BaseAccount | undefined = await wallet.getCurrentAccount();
    if (account) setAccount(account);
  };

  useAsyncEffect(updateAccount, []);
  useAsyncEffect(getTokenBalancesAsync, []);
  useAsyncEffect(getTokenBalancesSync, []);
  useAsyncEffect(queryTokenPrices, []);

  const tokenList = useMemo(() => {
    const clonedTokens = cloneDeep(tokens);
    if (prices) {
      clonedTokens.forEach((t: Token) => {
        if (t.symbol.toUpperCase() in prices) {
          t.price = prices[t.symbol.toUpperCase()];
        }
      });
    }
    if (!filterCondition) return clonedTokens;
    return clonedTokens.filter((t: Token) =>
      t.symbol.toUpperCase().startsWith(filterCondition.toUpperCase())
    );
  }, [tokens, filterCondition, prices]);

  const handleSendBtnClick = () => {
    sensors.track('teleport_home_send_click', {
      page: location.pathname,
    });
    history.push({ pathname: `/send/${nativeToken?.tokenId}` });
  };
  const handleAccountClick = async (account: BaseAccount) => {
    await wallet.changeAccount(account);
    setPopupVisible(false);
    updateAccount();
    getTokenBalancesAsync();
    getTokenBalancesSync();
    sensors.track('teleport_home_account_click', {
      page: location.pathname,
    });
  };

  const handleSiteClick = async (account: BaseAccount) => {
    setAccount2ConnectedSite(account);
    setConnectedSitePopupVisible(true);
    console.log(account);
  };

  const handleReceiveBtnClick = () => {
    sensors.track('teleport_home_receive_click', {
      page: location.pathname,
    });
    history.push(`/receive/${nativeToken!.symbol}`);
  };
  const handleAddTokenBtnClick = (e) => {
    e.stopPropagation();
    sensors.track('teleport_home_add_token', {
      page: location.pathname,
    });
    history.push('/token-manage');
  };

  const handleInputChange = (e) => {
    sensors.track('teleport_home_search', {
      page: location.pathname,
    });
    setFilterCondition(e.target.value);
  };

  const handleTokenClick = (t: Token) => {
    sensors.track('teleport_home_token_click', {
      page: location.pathname,
      token: t.name,
    });
    history.push({
      pathname: `/single-token/${t.tokenId}`,
    });
  };

  const nativeToken = useMemo(() => {
    const nativeToken = tokens.find((t: Token) => t.isNative);
    if (prices && nativeToken) {
      if (nativeToken!.symbol.toUpperCase() in prices) {
        nativeToken!.price = prices[nativeToken!.symbol.toUpperCase()];
      }
    }
    return nativeToken;
  }, [tokens, prices]);

  const displayTokenList = useMemo(() => {
    const t = tokenList.filter((t: Token) => t.display);
    if (
      t.some(
        (token: Token) =>
          token.contractAddress === '0x4200000000000000000000000000000000000042'
      ) &&
      t.length > 2
    ) {
      const temp = t[1];
      const opIndex = t.findIndex(
        (token: Token) =>
          token.contractAddress === '0x4200000000000000000000000000000000000042'
      );
      if (opIndex > -1) {
        t[1] = t[opIndex];
        t[opIndex] = temp;
      }
    }
    return t.sort((a: any, b: any) => {
      if (a.isNative) {
        a.sort = 1;
      } else {
        a.sort = 0;
      }

      if (b.isNative) {
        b.sort = 1;
      } else {
        b.sort = 0;
      }
      return b.sort - a.sort;
    });
  }, [tokenList]);

  return (
    <div className="home flexCol">
      <HomeHeader
        menuOnClick={() => {
          sensors.track('teleport_home_menus', { page: location.pathname });
          setSettingPopupVisible(true);
        }}
        networkOnClick={() => {
          sensors.track('teleport_home_networks', { page: location.pathname });
          history.push('/network');
        }}
      />
      <div className="home-bg"></div>
      <div className="home-content">
        <div className="home-content-name-wrap content-wrap-padding flexR">
          <img src={ArrowRight} className="home-content-name-arrow-right" />
          <WalletName width={200} cls="home-wallet-name">
            {account?.accountCreateType === AccountCreateType.PRIVATE_KEY
              ? 'Normal Wallet'
              : `ID Wallet: ${account?.hdWalletName}`}
          </WalletName>
        </div>

        <div className="home-preview-container flexCol content-wrap-padding">
          <div
            className="home-preview-top-container flexR"
            onClick={() => {
              sensors.track('teleport_home_accounts', {
                page: location.pathname,
              });
              setPopupVisible(true);
            }}
          >
            <div className="home-preview-top-left flexR cursor">
              <Jazzicon
                diameter={16}
                seed={Number(account?.address?.substr(0, 8) || 0)}
              />
              <span className="home-preview-top-account-name">
                {account?.accountCreateType === AccountCreateType.MNEMONIC
                  ? account?.accountName
                  : account?.hdWalletName}
              </span>
            </div>
            <IconComponent name="chevron-down" cls="chevron-down" />
          </div>
          <div className="home-preview-address-container flexR">
            <span className="home-preview-address">
              ({transferAddress2Display(account?.address)})
            </span>
            <div className="home-preview-icon-container flexR">
              <CopyToClipboard text={account?.address} onCopy={onCopy}>
                <IconComponent name="copy" cls="copy" />
              </CopyToClipboard>
            </div>
          </div>
          <div className="home-preview-balance flexR">
            <span className="home-preview-balance-amount">
              {denom2SymbolRatio(
                nativeToken?.amount || 0,
                nativeToken?.decimal || 0
              )}
            </span>
            <span className="home-preview-balance-symbol">
              {nativeToken?.symbol?.toUpperCase()}
            </span>
          </div>
          <div className="home-preview-dollar">
            ${' '}
            {getTotalPricesByAmountAndPrice(
              nativeToken?.amount || 0,
              nativeToken?.decimal || 0,
              nativeToken?.price || 0
            )}
          </div>
          <div className="home-preview-button-container flexR">
            <TipButton
              title="Send"
              type={TipButtonEnum.SEND}
              handleClick={handleSendBtnClick}
            />
            <TipButton
              title="Receive"
              type={TipButtonEnum.RECEIVE}
              handleClick={handleReceiveBtnClick}
            />
          </div>
        </div>
      </div>
      <div className="tab-container content-wrap-padding">
        <CustomTab
          tab1="Assets"
          tab2="Activity"
          currentTab={tabType}
          handleTabClick={(tab: Tabs) => {
            sensors.track('teleport_home_' + Tabs[tab], {
              page: location.pathname,
            });
            setTabType(tab);
          }}
        />
      </div>
      <div className="assets-container flexCol">
        {tabType === Tabs.FIRST ? (
          <div className="search-container flexR content-wrap-padding">
            <div className="wrap">
              <SearchInput onChange={handleInputChange} placeholder="Search" />
            </div>
            {currentChain.ecosystem === Ecosystem.EVM ? (
              <img
                onClick={handleAddTokenBtnClick}
                src={AddTokenImg}
                className="home-search-add-icon cursor"
              />
            ) : null}
          </div>
        ) : null}
        {tabType === Tabs.FIRST && (
          <div className="token-list flexCol">
            {displayTokenList.length > 0 ? (
              displayTokenList.map((t: Token, i) => {
                return (
                  <div
                    className="token-item flexR cursor"
                    key={i}
                    onClick={() => handleTokenClick(t)}
                  >
                    <div className="left flexR">
                      <TokenIcon token={t} radius={32} />
                      <div className="balance-container flexCol">
                        <span
                          className="balance"
                          title={denom2SymbolRatio(t.amount || 0, t.decimal)}
                        >
                          {addEllipsisToEachWordsInTheEnd(
                            denom2SymbolRatio(t.amount || 0, t.decimal),
                            16
                          )}{' '}
                          {t.symbol?.toUpperCase()}
                        </span>
                        <span className="estimate">
                          ≈
                          {getTotalPricesByAmountAndPrice(
                            t?.amount || 0,
                            t?.decimal || 0,
                            t?.price || 0
                          )}{' '}
                          USD
                        </span>
                      </div>
                    </div>
                    <IconComponent name="chevron-right" cls="right-icon" />
                  </div>
                );
              })
            ) : (
              <NoContent
                title="Assets"
                ext={
                  <CustomButton
                    cls="add-assets-button"
                    type="primary"
                    style={{
                      width: '200px',
                      marginTop: '16px',
                    }}
                    onClick={handleAddTokenBtnClick}
                  >
                    + Add Assets
                  </CustomButton>
                }
              />
            )}
          </div>
        )}
        {tabType === Tabs.SECOND && (
          <div className="transaction-list">
            <TransactionsList
              listContiannerHeight={206}
              txData={filterCondition}
            />
          </div>
        )}
      </div>
      <Drawer
        placement="top"
        closable={false}
        onClose={() => {
          setPopupVisible(false);
        }}
        height="76vh"
        bodyStyle={{
          padding: 0,
        }}
        contentWrapperStyle={{
          borderRadius: '0 0 23px 23px',
          overflow: 'hidden',
        }}
        visible={accountPopupVisible}
        key="right"
      >
        <div
          style={{ width: '100%', height: '100%' }}
          className="account-switch-drawer flexCol"
        >
          <div className="account-switch-header flexR content-wrap-padding">
            <IconComponent
              name="close"
              cls="icon icon-close"
              onClick={() => {
                setPopupVisible(false);
              }}
            />
          </div>
          <div className="account-switch-accounts flexR content-wrap-padding">
            <span className="account-switch-accounts-title">Accounts</span>
            {account?.accountCreateType === AccountCreateType.MNEMONIC ? (
              <span
                className="account-switch-accounts-manage-wallet-container cursor flexR"
                onClick={() => {
                  sensors.track('teleport_home_account_manage', {
                    page: location.pathname,
                  });
                  history.push({
                    pathname: '/account-manage',
                    state: {
                      hdWalletId: account?.hdWalletId,
                      hdWalletName: account?.hdWalletName,
                      accountCreateType: account?.accountCreateType,
                    },
                  });
                }}
              >
                Manage Account
                <IconComponent name="chevron-right" cls="icon chevron-right" />
              </span>
            ) : null}
          </div>

          <CurrentWalletAccountSwitch
            visible={accountPopupVisible}
            handleAccountClick={handleAccountClick}
            handleSiteClick={handleSiteClick}
          />
        </div>
        <Drawer
          placement="top"
          closable={true}
          closeIcon={<IconComponent name="back" cls="icon back-icon" />}
          onClose={() => {
            setConnectedSitePopupVisible(false);
          }}
          height="76vh"
          bodyStyle={{
            padding: 0,
          }}
          contentWrapperStyle={{
            borderRadius: '0 0 23px 23px',
            overflow: 'hidden',
          }}
          visible={connectedSitePopupVisible}
          key="inside"
        >
          <div style={{ width: '100%', height: '100%' }}>
            <ConnectedSites
              account={account2ConnectedSite}
              visible={connectedSitePopupVisible}
              handleOnClose={() => {
                setConnectedSitePopupVisible(false);
              }}
            />
          </div>
        </Drawer>
      </Drawer>
      <Drawer
        placement="top"
        closable={false}
        onClose={() => {
          setSettingPopupVisible(false);
        }}
        height="540px"
        bodyStyle={{
          padding: 0,
        }}
        contentWrapperStyle={{
          borderRadius: '0 0 16px 16px',
          overflow: 'hidden',
        }}
        visible={settingPopupVisible}
        key="top"
      >
        <div style={{ width: '100%', height: '100%' }}>
          <Setting
            handleCloseClick={() => {
              setSettingPopupVisible(false);
            }}
          />
        </div>
      </Drawer>
    </div>
  );
};

export default Home;
