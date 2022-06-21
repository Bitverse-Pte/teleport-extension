import React, { useState, useMemo, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { intToHex, isHexPrefixed, addHexPrefix } from 'ethereumjs-util';
import { Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  useWallet,
  useApproval,
  useAsyncEffect,
  getTotalPricesByAmountAndPrice,
} from 'ui/utils';
import {
  NetworkDisplay,
  SenderToRecipient,
  UserPreferencedCurrencyDisplay,
} from 'ui/components';
import {
  getValueFromWeiHex,
  addHexes,
  multipyHexes,
  decGWEIToHexWEI,
  addCurrencies,
  conversionUtil,
  hexWeiToDecGWEI,
} from 'ui/utils/conversion';
import { ETH, TransactionEnvelopeTypes } from 'constants/transaction';
import { Token } from 'types/token';
import { CustomButton, CustomTab } from 'ui/components/Widgets';
import { useDispatch, useSelector } from 'react-redux';
import {
  showLoadingIndicator,
  hideLoadingIndicator,
} from 'ui/reducer/appState.reducer';
import { BaseAccount } from 'types/extend';
import { IconComponent } from 'ui/components/IconComponents';
import FeeSelector from 'ui/components/FeeSelector';

import { useMethodData } from 'ui/hooks/wallet/useMethodData';
import { HeaderWithFlex } from 'ui/components/Header';
import { GAS_ESTIMATE_TYPES } from 'constants/gas';
import {
  getGasPriceInHexWei,
  getRoundedGasPrice,
} from 'ui/reducer/gas.reducer';
import { MIN_GAS_LIMIT_HEX } from 'ui/context/send.constants';
import skynet from 'utils/skynet';
import { Tabs } from 'constants/wallet';
const { sensors } = skynet;

const TxSummaryComponent = ({ action, value, token, origin }) => {
  return (
    <div className="tx-summary">
      <div className="tx-summary-origin">
        {origin === 'https://teleport.network' ? null : <div>{origin}</div>}
      </div>
      <div className="tx-summary-currency">
        <UserPreferencedCurrencyDisplay value={value} token={token} />
      </div>
    </div>
  );
};

const ConfirmTx = () => {
  const wallet = useWallet();
  const history = useHistory();
  // amount, recipient: toAddress, memo
  // const { state, pathname } = useLocation<{
  //   amount: string;
  //   recipient: string;
  //   memo: string;
  // }>();

  // console.log(state, pathname);
  // const { amount, recipient, memo } = state;

  // const next = async () => {
  //   console.log('next');
  //   // const amount = 0.001;
  //   // chainInfo.currencies[0];
  //   const currency = {
  //     coinDenom: 'OSMO',
  //     coinMinimalDenom: 'uosmo',
  //     coinDecimals: 6,
  //     coinGeckoId: 'osmosis',
  //   };
  //   // const recipient = 'osmo17lds9mrleuqq3g88wwkxt4x97q6mcg80e35d5l';
  //   // const memo = 'hello123';
  //   const stdFee = {
  //     amount: [
  //       {
  //         denom: 'uosmo',
  //         amount: '2500',
  //       },
  //     ],
  //     gas: '200000',
  //   };
  //   const signOptions = {
  //     preferNoSetFee: true,
  //     preferNoSetMemo: true,
  //   };
  //   const onTxEvents = {
  //     onBroadcasted: (txHash) => {
  //       console.log('--------------onBroadcasted--------------', txHash);
  //     },
  //     onFulfil: (tx) => {
  //       console.log('--------------onBroadcasted--------------', tx);
  //     },
  //   };
  //   wallet.sendCosmosToken(
  //     amount,
  //     currency,
  //     recipient,
  //     memo,
  //     stdFee,
  //     signOptions,
  //     onTxEvents
  //   );
  //   history.push('/home');
  // };
  const dispatch = useDispatch();
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));
  const [tokens, setTokens] = useState<Token[]>([]);

  const handleCancel = () => {
    sensors.track('teleport_sign_tx_declined', {
      page: location.pathname,
    });
    dispatch(showLoadingIndicator());
    rejectApproval('User rejected the request.')
      .then(() => delay(1000))
      .then(() => dispatch(hideLoadingIndicator()));
  };

  const fetchNativePrice = async () => {
    dispatch(showLoadingIndicator());
    const tokens = await wallet.getTokenBalancesAsync(true);
    console.log('tokens:', tokens);
    // const prices = await wallet.queryTokenPrices();
    // if (prices) setPrices(prices);
    if (tokens) setTokens(tokens);
    dispatch(hideLoadingIndicator());
  };

  const nativeToken = useMemo(() => {
    const nativeToken = tokens.find((t: Token) => t.isNative);
    return nativeToken;
  }, [tokens]);

  const txToken = useMemo(() => {
    const symbol = '';
    const txToken = symbol
      ? tokens.find((t: Token) => t.symbol === symbol)
      : nativeToken;
    return txToken;
  }, [tokens]);

  useAsyncEffect(fetchNativePrice, []);

  const from_address = 'cosmos17lds9mrleuqq3g88wwkxt4x97q6mcg80328azd';
  const to_address = 'cosmos17lds9mrleuqq3g88wwkxt4x97q6mcg80328azd';
  const origin = 'https://teleport.network';

  return (
    <div className="approval-tx flexCol">
      <div className="top-part-container flexCol flex-wrap items-center">
        <HeaderWithFlex
          title={<NetworkDisplay />}
          handleBackClick={handleCancel}
        />
        <SenderToRecipient
          senderAddress={from_address}
          senderName={''}
          recipientName={''}
          recipientAddress={to_address}
        />

        <TxSummaryComponent
          action={'Send'}
          value={0.001}
          token={txToken}
          origin={origin}
        />
      </div>
    </div>
  );
};

export default ConfirmTx;
