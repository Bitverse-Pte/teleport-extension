import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { message } from 'antd';
import {
  useWallet,
  useWalletRequest,
  useAsyncEffect,
  transferAddress2Display,
  denom2SymbolRatio,
} from 'ui/utils';
import { Tabs } from 'constants/wallet';
import { IconComponent } from 'ui/components/IconComponents';
import { Token } from 'types/token';
import { Provider } from 'types/network';
import {
  CustomButton,
  CustomInput,
  CustomTab,
  SearchInput,
  TokenIcon,
} from 'ui/components/Widgets';
import { ErrorCode } from 'constants/code';
import ChainSelect from 'ui/components/ChainSelect';
import Header from 'ui/components/Header';

import './style.less';
import { NoContent } from 'ui/components/universal/NoContent';
import tokenHide from '../../../assets/tokenHide.svg';
import tokenShow from '../../../assets/tokenShow.svg';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import { isValidAddress } from 'ethereumjs-util';
import skynet from 'utils/skynet';
import { getProvider } from 'ui/selectors/selectors';
import { useSelector } from 'react-redux';
const { sensors } = skynet;
import clsx from 'clsx';
import { useDarkmode } from 'ui/hooks/useDarkMode';

const TokenManage = () => {
  const history = useHistory();
  const location = useLocation();
  const [tokenManageTab, setTokenManageTab] = useState(Tabs.FIRST);
  const [filterCondition, setFilterCondition] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [contractAddress, setContractAddress] = useState('');
  const wallet = useWallet();
  const currentChain: Provider = useSelector(getProvider);
  const { isDarkMode } = useDarkmode();

  const getTokenBalancesAsync = async () => {
    const balances = await wallet.getTokenBalancesAsync().catch((e) => {
      console.error(e);
    });
    if (balances && balances.length) setTokens(balances);
  };

  const getTokenBalancesSync = async () => {
    const balances = await wallet.getTokenBalancesSync().catch((e) => {
      console.error(e);
    });
    if (balances && balances.length) setTokens(balances);
  };

  useAsyncEffect(getTokenBalancesAsync, []);
  useAsyncEffect(getTokenBalancesSync, []);

  const tokenList = useMemo(() => {
    if (!filterCondition) return tokens;
    return tokens.filter((t: Token) =>
      t.symbol.toUpperCase().startsWith(filterCondition.toUpperCase())
    );
  }, [tokens, filterCondition]);

  const handleInputChange = (e) => {
    setFilterCondition(e.target.value);
    sensors.track('teleport_token_manage_search', { page: location.pathname });
  };

  const handleTokenClick = async (token: Token) => {
    sensors.track('teleport_token_manage_token_click', {
      page: location.pathname,
      token: token.name,
    });
    const updated = await wallet
      .setTokenDisplay(token.tokenId, !token.display)
      .catch((e) => {
        console.error(e);
      });
    if (updated) {
      getTokenBalancesSync();
    }
  };
  const [queryToken, loading] = useWalletRequest(wallet.queryToken, {
    onSuccess(token) {
      sensors.track('teleport_token_manage_next', {
        page: location.pathname,
        token: token.name,
      });
      console.log(token);
      if (token) {
        history.push({
          pathname: '/token-add',
          state: {
            symbol: token.symbol,
            decimal: token.decimals,
            balance: token.balanceOf,
            name: token.name,
            contractAddress,
            chain: currentChain?.nickname,
            chainCustomId: currentChain?.id,
          },
        });
      }
    },
    onError(err) {
      console.error(err);
      if (err?.code === ErrorCode.INVALID_CONTRACT_ADDRESS) {
        ClickToCloseMessage.error({
          content: 'Invalid contract address',
          key: 'Invalid contract address',
        });
      } else {
        ClickToCloseMessage.error({
          content: 'Token not found',
          key: 'Token not found',
        });
      }
    },
  });

  const handleNextBtnClick = async () => {
    /* if (!isValidAddress(contractAddress)) {
      ClickToCloseMessage.error({
        content: 'Invalid contract address',
        key: 'Invalid contract address',
      });
      return;
    } */
    if (!contractAddress) return;
    queryToken(currentChain?.id, contractAddress);
  };

  return (
    <div className={clsx('token-manage flexCol', { dark: isDarkMode })}>
      <Header title="Add Asset" />
      <div className="tab-container content-wrap-padding">
        <CustomTab
          tab1="Search"
          tab2="Customize"
          currentTab={tokenManageTab}
          handleTabClick={(tab: Tabs) => {
            sensors.track('teleport_token_manage_' + tab.toString(), {
              page: location.pathname,
            });
            setTokenManageTab(tab);
          }}
        />
      </div>
      <div
        className="token-list flexCol"
        style={{
          display: tokenManageTab === Tabs.FIRST ? 'flex' : 'none',
        }}
      >
        <div className="input-container content-wrap-padding">
          <IconComponent name="search" cls="search" />
          <SearchInput
            className="input"
            onChange={handleInputChange}
            placeholder="Search"
          />
        </div>
        <div className="tokens flexCol">
          {tokenList?.length > 0 ? (
            tokenList?.map((t: Token) => (
              <div
                className="token-item flexR cursor"
                key={t.tokenId}
                onClick={() => handleTokenClick(t)}
              >
                <div className="left flexR">
                  <TokenIcon token={t} />
                  <div className="token-info flexCol">
                    <span className="balance">
                      {denom2SymbolRatio(t.amount || 0, t.decimal)} {t.symbol}
                    </span>
                    <span className="address">
                      {transferAddress2Display(t.contractAddress)}
                    </span>
                  </div>
                </div>
                <img
                  src={t.display ? tokenShow : tokenHide}
                  className="token-manage-show-icon"
                />
              </div>
            ))
          ) : (
            <NoContent title="Assets" />
          )}
        </div>
      </div>
      <div
        className="token-custom flexCol content-wrap-padding"
        style={{
          display: tokenManageTab === Tabs.SECOND ? 'flex' : 'none',
        }}
      >
        <div className="token-custom-top">
          {/* <p className="token-custom-title">Networks</p>
          <ChainSelect
            handleChainSelect={(chain: Provider) => {
              sensors.track('teleport_token_manage_network_select', {
                page: location.pathname,
                chainId: chain.id,
                chainName: chain.chainName,
              });
              setCurrentChain(chain);
            }}
          /> */}
          <p className="token-custom-title token-custom-address">
            Token Contract Address
          </p>
          <CustomInput
            placeholder="Enter your address"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </div>
        <CustomButton
          type="primary"
          cls="token-manage-button theme"
          onClick={handleNextBtnClick}
          block
          disabled={!contractAddress}
          loading={loading}
        >
          Next
        </CustomButton>
      </div>
    </div>
  );
};

export default TokenManage;
