import React, { useMemo, useState } from 'react';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';
import {
  useWallet,
  useAsyncEffect,
  transferAddress2Display,
  denom2SymbolRatio,
  getTotalPricesByAmountAndPrice,
} from 'ui/utils';
import { BaseAccount } from 'types/extend';
import { Token } from 'types/token';
import Header from 'ui/components/Header';
import teleportLogo from 'assets/teleportBg.svg';
import { TipButton, TokenIcon, WalletName } from 'ui/components/Widgets';
import { TransactionListRouter } from 'ui/components/TransactionList';
import './style.less';
import clsx from 'clsx';
import { TipButtonEnum } from 'constants/wallet';
import { Ecosystem, Provider } from 'types/network';
import { getProvider } from 'ui/selectors/selectors';
import { useSelector } from 'react-redux';
import { useDarkmode } from 'ui/hooks/useDarkMode';

const SingleToken = () => {
  const { isDarkMode } = useDarkmode();
  const wallet = useWallet();
  const { t } = useTranslation();
  const history = useHistory();

  const { tokenId } = useParams<{
    tokenId: string;
  }>();

  const [account, setAccount] = useState<BaseAccount>();
  const [token, setToken] = useState<Token>();
  const [prices, setPrices] = useState();
  const currentChain: Provider = useSelector(getProvider);

  /* const getTokenBalanceAsync = async () => {
    const balance = await wallet.getTokenBalanceAsync(tokenId).catch((e) => {
      console.error(e);
    });
    console.log('async balance', balance);
    if (balance) setToken(balance);
  }; */

  const getTokenBalanceSync = async () => {
    const balance = await wallet.getTokenBalanceSync(tokenId).catch((e) => {
      console.error(e);
    });
    console.log('sync balance', balance);
    if (balance) setToken(balance);
  };

  const updateAccount = async () => {
    const account: BaseAccount | undefined = await wallet.getCurrentAccount();
    if (account) setAccount(account);
  };
  useAsyncEffect(updateAccount, []);
  //useAsyncEffect(getTokenBalanceAsync, []);
  useAsyncEffect(getTokenBalanceSync, []);
  const queryTokenPrices = async () => {
    const prices = await wallet.queryTokenPrices(tokenId).catch((e) => {
      console.error(e);
    });
    console.log('prices', prices);
    if (prices) setPrices(prices);
  };

  useAsyncEffect(queryTokenPrices, []);

  const updatedToken = useMemo(() => {
    if (prices && token) {
      const clonedToken = cloneDeep(token);
      if (clonedToken.symbol.toUpperCase() in prices) {
        clonedToken.price = prices[clonedToken.symbol.toUpperCase()];
      }
      return clonedToken;
    } else {
      return token;
    }
  }, [token, prices]);

  const title = (
    <div className="title-container flexR">
      <WalletName cls="wallet-name" width={50}>
        {account?.hdWalletName}
      </WalletName>
      <span className="account">
        （{transferAddress2Display(account?.address || '')}）
      </span>
    </div>
  );

  const ibcChainInfoStr = useMemo(() => {
    let ibcStr;
    if (token?.chainName && (token?.trace?.trace as any).length > 0) {
      const trace = (token as any)?.trace.trace[
        (token as any)?.trace.trace.length - 1
      ];
      if (trace) {
        ibcStr = `(${token?.chainName.toUpperCase()}/${trace.channelId.toUpperCase()})`;
      }
    }
    return ibcStr;
  }, [token]);

  return (
    <div className={clsx('single-token flexCol', { dark: isDarkMode })}>
      <Header title={title} />
      <div
        className="summary flexCol content-wrap-padding"
        style={ibcChainInfoStr ? { height: '190px' } : {}}
      >
        <div className="top">
          <TokenIcon token={updatedToken} radius={42} />
          {/* <img src={teleportLogo} className="logo" /> */}
        </div>
        <div className="bottom flexCol">
          <div className="balance-container flexR">
            <span className="balance">
              {denom2SymbolRatio(
                updatedToken?.amount || 0,
                updatedToken?.decimal || 0
              )}
            </span>
            <span className="single-symbol">{updatedToken?.symbol}</span>
          </div>
          <span
            className="ibc-denomanation ellipsis"
            style={ibcChainInfoStr ? {} : { display: 'none' }}
          >
            {ibcChainInfoStr}
          </span>
          <span className="estimate">
            ≈{' '}
            {getTotalPricesByAmountAndPrice(
              updatedToken?.amount || 0,
              updatedToken?.decimal || 0,
              updatedToken?.price || 0
            )}{' '}
            USD
          </span>
        </div>
      </div>
      <div className="send-container content-wrap-padding flexR">
        <TipButton
          title="Send"
          type={TipButtonEnum.SEND}
          handleClick={() => {
            if (currentChain.ecosystem === Ecosystem.EVM) {
              history.push({ pathname: `/send/${tokenId}` });
            } else {
              history.push({ pathname: `/send-cos/${tokenId}` });
            }
          }}
        />
        <TipButton
          title="Receive"
          type={TipButtonEnum.RECEIVE}
          handleClick={() => {
            history.push(`/receive/${updatedToken?.symbol}`);
          }}
        />
      </div>

      <div className="token-tx-list">
        <h2 className="title">{t('Activity')}</h2>
        <TransactionListRouter
          ecosystem={currentChain.ecosystem}
          listContiannerHeight={200}
          tokenId={token?.tokenId}
        />
      </div>
    </div>
  );
};

export default SingleToken;
