import React, { useMemo, useState } from 'react';
import { cloneDeep } from 'lodash';
import { useHistory } from 'react-router-dom';
import Jazzicon from 'react-jazzicon';
import { message, Drawer } from 'antd';
import {
  useWallet,
  useAsyncEffect,
  transferAddress2Display,
  denom2SymbolRatio,
  getTotalPricesByAmountAndPrice,
} from 'ui/utils';
import AccountSwitch from 'ui/components/AccountSwitch';
import Setting from 'ui/views/Setting';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { HomeHeader } from 'ui/components/Home/Header';
import {
  AccountCreateType,
  BaseAccount,
  DisplayWalletManage,
  HdAccountStruct,
} from 'types/extend';
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
import { Provider } from 'types/network';
import { TransactionsList } from 'ui/components/TransactionList';
import './style.less';
import { Tabs, TipButtonEnum } from 'constants/wallet';
import { NoContent } from 'ui/components/universal/NoContent';
import AddTokenImg from '../../../assets/addToken.svg';
import WalletManageNewIcon from '../../../assets/walletManageNew.svg';
import skynet from 'utils/skynet';

const { sensors } = skynet;

import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import CurrentWalletAccountSwitch from 'ui/components/CurrentWalletAccountSwitch';

const onCopy = () => {
  ClickToCloseMessage.success('Copied');
};
const Home = () => {
  const history = useHistory();
  const wallet = useWallet();
  const [account, setAccount] = useState<BaseAccount>();
  const [accountList, setAccountList] = useState<DisplayWalletManage>();
  const [accountPopupVisible, setPopupVisible] = useState(false);
  const [settingPopupVisible, setSettingPopupVisible] = useState(false);
  const [tabType, setTabType] = useState(Tabs.FIRST);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filterCondition, setFilterCondition] = useState('');
  const [prices, setPrices] = useState();

  const getTokenBalancesAsync = async () => {
    const balances = await wallet.getTokenBalancesAsync().catch((e) => {
      console.error(e);
    });
    if (balances && balances.length) setTokens(balances);
  };

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
    if (balances && balances.length) setTokens(balances);
  };

  const updateAccount = async () => {
    const account: BaseAccount | undefined = await wallet.getCurrentAccount();
    if (account) setAccount(account);
  };

  const getAccountList = async () => {
    const accounts: DisplayWalletManage = await wallet.getAccountList();
    setAccountList(accounts);
  };

  const walletIndex = useMemo(() => {
    if (accountList && accountList.hdAccount && account) {
      const index = accountList.hdAccount.findIndex((hd: HdAccountStruct) =>
        hd.accounts.some((a: BaseAccount) => a.address === account.address)
      );
      return index > -1 ? index : 0;
    }
    return 0;
  }, [account, accountList]);

  useAsyncEffect(getAccountList, []);
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
    history.push('/send');
    sensors.track('teleport_send_click', {
      page: 'home',
    });
  };
  const handleAccountClick = async (account: BaseAccount) => {
    await wallet.changeAccount(account);
    setPopupVisible(false);
    updateAccount();
    getTokenBalancesAsync();
    getTokenBalancesSync();
  };

  const handleReceiveBtnClick = () => {
    history.push('/receive');
  };
  const handleAddTokenBtnClick = (e) => {
    e.stopPropagation();
    history.push('/token-manage');
  };

  const handleInputChange = (e) => {
    setFilterCondition(e.target.value);
  };

  const handleTokenClick = (t: Token) => {
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
    return tokenList.filter((t: Token) => t.display);
  }, [tokenList]);

  return (
    <div className="home flexCol">
      <HomeHeader
        menuOnClick={() => setSettingPopupVisible(true)}
        networkOnClick={() => history.push('/network')}
      />
      <div className="home-bg"></div>
      <div className="home-content">
        <WalletName width={200} cls="home-wallet-name">
          {account?.accountCreateType === AccountCreateType.PRIVATE_KEY
            ? ' '
            : account?.hdWalletName}
        </WalletName>
        <div className="home-preview-container flexCol content-wrap-padding">
          <div
            className="home-preview-top-container flexR"
            onClick={() => {
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
            setTabType(tab);
          }}
        />
      </div>
      <div className="assets-container flexCol">
        {tabType === Tabs.FIRST && displayTokenList.length > 0 ? (
          <div className="search-container flexR content-wrap-padding">
            <div className="wrap">
              <SearchInput onChange={handleInputChange} placeholder="Search" />
            </div>
            <img
              onClick={handleAddTokenBtnClick}
              src={AddTokenImg}
              className="home-search-add-icon cursor"
            />
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
                      <TokenIcon token={t} useThemeBg />
                      <div className="balance-container flexCol">
                        <span className="balance">
                          {denom2SymbolRatio(t.amount || 0, t.decimal)}{' '}
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
              listContiannerHeight={250}
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
            <img
              onClick={() => {
                history.push({
                  pathname: '/account-manage',
                  state: {
                    hdWalletId: account?.hdWalletId,
                    hdWalletName: account?.hdWalletName,
                  },
                });
              }}
              src={WalletManageNewIcon}
              className="account-switch-accounts-manage-wallet-container cursor"
            />
          </div>

          <CurrentWalletAccountSwitch
            visible={accountPopupVisible}
            handleAccountClick={handleAccountClick}
          />
          {/* <AccountSwitch
            visible={accountPopupVisible}
            handleAccountClick={handleAccountClick}
          /> */}
        </div>
      </Drawer>
      <Drawer
        placement="top"
        closable={false}
        onClose={() => {
          setSettingPopupVisible(false);
        }}
        height="516px"
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
