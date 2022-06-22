import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  NetworkDisplay,
  SenderToRecipient,
  UserPreferencedCurrencyDisplay,
} from 'ui/components';
import { HeaderWithFlex } from 'ui/components/Header';
import { CustomButton, TokenIcon } from 'ui/components/Widgets';
import {
  getTotalPricesByAmountAndPrice,
  useApproval,
  useAsyncEffect,
  useWallet,
} from 'ui/utils';
import {
  SignDoc,
  TxBody,
  AuthInfo,
} from '@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx';
import { JSONUint8Array } from 'utils/cosmos/json-uint8-array';
import { ProtoSignDocDecoder } from '@keplr-wallet/cosmos';
import {
  hideLoadingIndicator,
  showLoadingIndicator,
} from 'ui/reducer/appState.reducer';
import { Token } from 'types/token';
import { addEllipsisToEachWordsInTheEnd } from 'ui/helpers/utils/currency-display.util';
import BigNumber from 'bignumber.js';
import { IconComponent } from 'ui/components/IconComponents';
import { Divider } from 'antd';

interface SignCosmosTxProps {
  data: [string, string, SignCosmosTxMsg];
  method: boolean;
  session: {
    origin: string;
    icon: string;
    name: string;
  };
}

interface SignCosmosTxMsg {
  accountNumber: string;
  authInfoBytes: Uint8Array;
  bodyBytes: Uint8Array;
  chainId: string;
}

const SignDirectCosmTx = ({
  params,
  origin,
}: {
  params: SignCosmosTxProps;
  origin: string;
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const [signDoc, setSignDoc] = useState<any>();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [prices, setPrices] = useState();
  const [visible, setVisible] = useState(false);

  const initState = async () => {
    dispatch(showLoadingIndicator());
    const chainId = params.data[0];
    const from = params.data[1];
    const msg = JSONUint8Array.unwrap(params.data[2]);
    const protoSignDoc = new ProtoSignDocDecoder(msg);
    const signDoc = protoSignDoc.toJSON();
    setSignDoc(signDoc);
    const tokens = await wallet.getTokenBalancesAsync(chainId, from);
    const prices = await wallet.queryTokenPrices();
    console.log('====[ tokens, prices]====', tokens, prices);
    if (prices) setPrices(prices);
    if (tokens) setTokens(tokens);
    dispatch(hideLoadingIndicator());
  };

  useAsyncEffect(initState, []);

  const chainId = useMemo(() => {
    return params.data[0];
  }, []);

  const from = useMemo(() => {
    return params.data[1];
  }, []);

  const txBodyMemo = useMemo(() => {
    return signDoc?.txBody;
  }, [signDoc]);

  const authInfoMemo = useMemo(() => {
    return signDoc?.authInfo;
  }, [signDoc]);

  const nativeToken = useMemo(() => {
    const nativeToken = tokens.find((t: Token) => t.isNative);
    if (prices && nativeToken) {
      if (nativeToken!.symbol.toUpperCase() in prices) {
        nativeToken!.price = prices[nativeToken!.symbol.toUpperCase()];
      }
    }
    return nativeToken;
  }, [tokens, prices]);

  const txToken = useMemo(() => {
    // const symbol = txBodyMemo?.messages[0].amount[0].denom;
    // const txToken = symbol
    //   ? tokens.find((t: Token) => t.symbol === symbol)
    //   : nativeToken;
    return nativeToken;
  }, [tokens, txBodyMemo]);

  const totalFeeMemo = useMemo(() => {
    const multiplier = new BigNumber(10).pow(Number(nativeToken?.decimal || 0));
    const rate = new BigNumber(1.0).div(multiplier);
    const fee = new BigNumber(authInfoMemo?.fee.amount[0].amount || 0).times(
      rate
    );
    return fee;
  }, [authInfoMemo, nativeToken]);

  const amountMemo = useMemo(() => {
    const multiplier = new BigNumber(10).pow(Number(txToken?.decimal || 0));
    const rate = new BigNumber(1.0).div(multiplier);
    const amount = new BigNumber(
      txBodyMemo?.messages[0].amount[0].amount || 0
    ).times(rate);
    return amount;
  }, [txBodyMemo, txToken]);

  const renderContent = () => {
    const renderTotalMaxAmount = () => {
      const total = amountMemo.add(totalFeeMemo);
      return `${total.toString(10)} ${txToken?.symbol || ''}`;
    };

    const renderTotalGasFeeAmount = () => {
      return `${totalFeeMemo.toString(10)} ${txToken?.symbol || ''}`;
    };

    const renderTotalGasFeeFiat = () => {
      const totalDec = getTotalPricesByAmountAndPrice(
        totalFeeMemo.toNumber(),
        nativeToken?.decimal || 0,
        nativeToken?.price || 0
      );
      return `$ ${totalDec}`;
    };

    const renderTotalMaxFiat = () => {
      const total = amountMemo.add(totalFeeMemo);
      const totalDec = getTotalPricesByAmountAndPrice(
        total.toNumber(),
        nativeToken?.decimal || 0,
        nativeToken?.price || 0
      );
      return `$ ${totalDec}`;
    };

    return (
      <div className="tx-details-tab-container flex">
        <div className="transaction-detail">
          <div
            className="gas-edit-button hidden flex ml-auto"
            onClick={() => {
              setVisible(true);
              // sensors.track('teleport_sign_tx_edit_gas', {
              //   page: location.pathname,
              // });
            }}
          >
            <IconComponent name="edit" cls="edit-icon" />
            <div>{t('Edit')}</div>
          </div>
          <TransactionDetailItem
            key="gas-item"
            detailTitle={t('Estimated gas fee')}
            subTitle={undefined}
            detailText={`${renderTotalGasFeeAmount()}`}
            detailSubText={renderTotalGasFeeFiat()}
            detailMax={`Max fee: ${renderTotalGasFeeAmount()}`}
          />
          <Divider style={{ margin: '16px 0' }} />
          <TransactionDetailItem
            key="total-item"
            detailTitle={t('Sum')}
            subTitle={t('Amount + gas fee')}
            detailText={renderTotalMaxAmount()}
            detailSubText={renderTotalMaxFiat()}
            detailMax={`Max amount: ${renderTotalMaxAmount()}`}
          />
        </div>
      </div>
    );
  };

  const handleAllow = async () => {
    resolveApproval({});
  };

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  return (
    <div className="approval-tx flexCol">
      <div className="top-part-container flexCol flex-wrap items-center">
        <HeaderWithFlex
          title={<NetworkDisplay networkName={chainId} />}
          handleBackClick={handleCancel}
        />
        <SenderToRecipient
          senderAddress={txBodyMemo?.messages[0].fromAddress}
          senderName={''}
          recipientName={''}
          recipientAddress={txBodyMemo?.messages[0].toAddress}
        />
        <TxSummaryComponent
          action={params.method}
          value={txBodyMemo?.messages[0].amount[0].amount}
          token={txToken}
          origin={origin}
        />
      </div>
      {renderContent()}
      <div className="tx-button-container flexCol">
        <CustomButton
          type="primary"
          onClick={handleAllow}
          cls="theme tx-btn-container-top"
          block
        >
          {t('Confirm')}
        </CustomButton>
        <CustomButton
          type="default"
          cls="custom-button-default"
          onClick={handleCancel}
          block
        >
          {t('Decline')}
        </CustomButton>
      </div>
    </div>
  );
};

const TxSummaryComponent = ({ action, value, token, origin }) => {
  const multiplier = new BigNumber(10).pow(token?.decimal || 0);
  const rate = new BigNumber(1.0).div(multiplier);
  const amount = new BigNumber(value || 0).times(rate);
  return (
    <div className="tx-summary">
      <div className="tx-summary-origin">
        {origin === 'https://teleport.network' ? null : <div>{origin}</div>}
      </div>
      <div className="tx-summary-currency">
        {token && (
          <div className="flexR items-end">
            <TokenIcon token={token} radius={30} />
            <span className="dec" title={value}>
              {addEllipsisToEachWordsInTheEnd(amount.toString(10), 8)}{' '}
            </span>
            <span className="symbol">{token?.symbol} </span>
          </div>
        )}
      </div>
    </div>
  );
};

const TransactionDetailItem = ({
  detailTitle = '',
  subTitle,
  detailText,
  detailSubText,
  detailMax,
}) => {
  return (
    <div className="transaction-detail-item">
      <div className="transaction-detail-item-key">
        <div className="transaction-detail-title">{detailTitle}</div>
        <div className="transaction-detail-subtitle">{subTitle}</div>
      </div>
      <div className="transaction-detail-item-values">
        <div className="transaction-detail-detailText">{detailText}</div>
        <div className="transaction-detail-detailSubText">{detailSubText}</div>
        <div className="transaction-detail-detailMax">{detailMax}</div>
      </div>
    </div>
  );
};

export default SignDirectCosmTx;
