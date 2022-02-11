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
// import teleportLogo from 'assets/teleport.svg';
import { TipButton, TokenIcon, WalletName } from 'ui/components/Widgets';
import { TransactionsList } from 'ui/components/TransactionList';
import './style.less';
import clsx from 'clsx';
import { TipButtonEnum } from 'constants/wallet';

const SingleToken = () => {
  const wallet = useWallet();
  const { t } = useTranslation();
  const history = useHistory();

  const { tokenId } = useParams<{
    tokenId: string;
  }>();

  const [account, setAccount] = useState<BaseAccount>();
  const [token, setToken] = useState<Token>();
  const [prices, setPrices] = useState();

  const getTokenBalanceAsync = async () => {
    const balance = await wallet.getTokenBalanceAsync(tokenId).catch((e) => {
      console.error(e);
    });
    console.log('async balance', balance);
    if (balance) setToken(balance);
  };

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
    console.log('account', account);
  };
  useAsyncEffect(updateAccount, []);
  useAsyncEffect(getTokenBalanceAsync, []);
  useAsyncEffect(getTokenBalanceSync, []);
  const queryTokenPrices = async () => {
    const prices = await wallet.queryTokenPrices().catch((e) => {
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
        return clonedToken;
      }
    } else {
      return token;
    }
  }, [token, prices]);

  const title = (
    <div className="title-container flex">
      <WalletName cls="wallet-name" width={50}>
        {account?.hdWalletName}
      </WalletName>
      <span className="account">
        （{transferAddress2Display(account?.address || '')}）
      </span>
    </div>
  );
  return (
    <div className="single-token flexCol">
      <Header title={title} />
      <div className="summary flexCol content-wrap-padding">
        <div
          className="top"
          style={
            updatedToken?.themeColor
              ? { background: updatedToken?.themeColor }
              : {}
          }
        >
          <TokenIcon token={updatedToken} />
          {/* <img src={teleportLogo} className="logo" /> */}
        </div>
        <div className="bottom flexCol">
          <div className="balance-container flex">
            <span className="balance">
              {denom2SymbolRatio(
                updatedToken?.amount || 0,
                updatedToken?.decimal || 0
              )}
            </span>
            <span className="symbol">{updatedToken?.symbol}</span>
          </div>
          <span className="estimate">
            ≈{' '}
            {getTotalPricesByAmountAndPrice(
              updatedToken?.amount || 0,
              updatedToken?.decimal || 0,
              updatedToken?.price || 1
            )}{' '}
            USD
          </span>
        </div>
      </div>
      <div className="send-container content-wrap-padding flex">
        <TipButton
          title="Send"
          type={TipButtonEnum.SEND}
          handleClick={() => {
            history.push('/send');
          }}
        />
        <TipButton
          title="Receive"
          type={TipButtonEnum.RECEIVE}
          handleClick={() => {
            history.push('/receive');
          }}
        />
      </div>

      <div className="token-tx-list">
        <h2 className="title">{t('Activity')}</h2>
        <TransactionsList
          listContiannerHeight={300}
          tokenAddress={token?.contractAddress}
          // hideTokenTransactions is true = show native token transfer
          hideTokenTransactions={token?.isNative}
        />
      </div>
    </div>
  );
};

export default SingleToken;
