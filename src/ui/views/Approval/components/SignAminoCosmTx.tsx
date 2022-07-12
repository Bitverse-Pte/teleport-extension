import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  NetworkDisplay,
  SenderToRecipient,
  UserPreferencedCurrencyDisplay,
} from 'ui/components';
import { HeaderWithFlex } from 'ui/components/Header';
import { CustomButton, CustomTab, TokenIcon } from 'ui/components/Widgets';
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
import { Divider, Input } from 'antd';
import { Tabs } from 'constants/wallet';
import { useMethodData } from 'ui/hooks/wallet/useMethodData';

interface SignCosmosTxProps {
  data: [string, string, any];
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

const SignAminoCosmTx = ({
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
  const [signDoc, setSignDoc] = useState<any>(params.data[2]);
  const [memo, setMemo] = useState<string>(params.data[2].memo);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [prices, setPrices] = useState();
  const [visible, setVisible] = useState(false);
  const [tabType, setTabType] = useState<Tabs>(Tabs.FIRST);

  const initState = async () => {
    dispatch(showLoadingIndicator());
    const chainId = params.data[0];
    const from = params.data[1];
    const signDoc = params.data[2];
    //setSignDoc(signDoc);
    const tokens = await wallet.getTokenBalancesAsync(chainId, from);
    const prices = await wallet.queryTokenPrices();
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
    return nativeToken;
  }, [tokens]);

  const totalFeeMemo = useMemo(() => {
    const multiplier = new BigNumber(10).pow(Number(nativeToken?.decimal || 0));
    const rate = new BigNumber(1.0).div(multiplier);
    const fee = new BigNumber(signDoc?.fee.amount[0].amount || 0).times(rate);
    return fee;
  }, [signDoc, nativeToken]);

  const handleMemoChange = (val) => {
    setMemo(val);
    signDoc.memo = val;
    setSignDoc(signDoc);
  };

  const renderContent = () => {
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

    return (
      <div className="tx-details-tab-container">
        <CustomTab
          tab1="Details"
          tab2="Data"
          currentTab={tabType}
          handleTabClick={setTabType}
        />
        {tabType === Tabs.FIRST && (
          <div className="transaction-detail">
            <div className="transaction-detail-messages">
              <div className="transaction-detail-messages-title">
                <div className="transaction-detail-title">Messages:</div>
              </div>
              <div className="transaction-detail-messages-value">
                <pre>{JSON.stringify(signDoc?.msgs, null, 2)}</pre>
              </div>
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <div className="transaction-detail-memo">
              <div className="transaction-detail-memo-title">
                <div className="transaction-detail-title">Memo:</div>
              </div>
              <Input
                className="customInputStyle"
                value={signDoc?.memo}
                //defaultValue={memo}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleMemoChange(e.target.value)}
              />
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <div
              className="gas-edit-button flex ml-auto"
              onClick={() => {
                setVisible(true);
              }}
            >
              <IconComponent name="edit" cls="edit-icon" />
              <div>{t('Edit')}</div>
            </div>
            <div className="transaction-detail-item">
              <div className="transaction-detail-item-key">
                <div className="transaction-detail-title">
                  {t('Estimated gas fee')}
                </div>
                <div className="transaction-detail-subtitle"></div>
              </div>
              <div className="transaction-detail-item-values">
                <div className="transaction-detail-detailText">
                  {renderTotalGasFeeAmount()}
                </div>
                <div className="transaction-detail-detailSubText">
                  {renderTotalGasFeeFiat()}
                </div>
                <div className="transaction-detail-detailMax">{`Max fee: ${renderTotalGasFeeAmount()}`}</div>
              </div>
            </div>
          </div>
        )}
        {tabType === Tabs.SECOND && <TxDataComponent signDoc={signDoc} />}
      </div>
    );
  };

  const handleAllow = async () => {
    resolveApproval({ ...signDoc });
  };

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  return (
    <div className="approval-tx-sign-amino flexCol">
      <div className="top-part-container flexCol flex-wrap items-center">
        <HeaderWithFlex
          title={<NetworkDisplay networkName={chainId} />}
          handleBackClick={handleCancel}
        />
        <TxSummaryComponent origin={origin} />
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

const TxSummaryComponent = ({ origin }) => {
  return (
    <div className="tx-summary">
      <div className="tx-summary-origin">
        {origin === 'https://teleport.network' ? null : <div>{origin}</div>}
      </div>
    </div>
  );
};

const TransactionDetailComponent = ({
  signDoc,
  detailTitle = '',
  subTitle,
  detailText,
  detailSubText,
  detailMax,
  handleMemoChange,
}) => {
  const len = 1;
  return (
    <div className="transaction-detail">
      <div className="transaction-detail-messages">
        <div className="transaction-detail-messages-title">
          <div className="transaction-detail-title">Messages:</div>
        </div>
        <div className="transaction-detail-messages-value">
          <pre>{JSON.stringify(signDoc?.msgs, null, 2)}</pre>
        </div>
      </div>
      <Divider style={{ margin: '16px 0' }} />
      <div className="transaction-detail-memo">
        <div className="transaction-detail-memo-title">
          <div className="transaction-detail-title">Memo:</div>
        </div>
        <Input
          className="customInputStyle"
          value={signDoc?.memo}
          //onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleMemoChange(e.target.value)}
        />
      </div>
      <Divider style={{ margin: '16px 0' }} />
      <div className="transaction-detail-item">
        <div className="transaction-detail-item-key">
          <div className="transaction-detail-title">{detailTitle}</div>
          <div className="transaction-detail-subtitle">{subTitle}</div>
        </div>
        <div className="transaction-detail-item-values">
          <div className="transaction-detail-detailText">{detailText}</div>
          <div className="transaction-detail-detailSubText">
            {detailSubText}
          </div>
          <div className="transaction-detail-detailMax">{detailMax}</div>
        </div>
      </div>
    </div>
  );
};

const TxDataComponent = ({ signDoc }) => {
  const { t } = useTranslation();
  return (
    <div className="transaction-data flexCol">
      <div className="transaction-data-params">
        <div>{`${t('parameters')}:`}</div>
        <div>
          <pre>{JSON.stringify(signDoc, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default SignAminoCosmTx;
