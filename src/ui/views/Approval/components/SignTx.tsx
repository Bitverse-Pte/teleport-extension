/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  intToHex,
  isHexString,
  isHexPrefixed,
  addHexPrefix,
  unpadHexString,
} from 'ethereumjs-util';
import {
  Button,
  Modal,
  Tooltip,
  Checkbox,
  Spin,
  Tabs,
  Divider,
  message,
} from 'antd';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  useWallet,
  useApproval,
  useAsyncEffect,
  getTotalPricesByAmountAndPrice,
} from 'ui/utils';
import {
  NetworkDisplay,
  SenderToRecipient,
  StrayPageWithButton,
  UserPreferencedCurrencyDisplay,
} from 'ui/components';
import {
  getValueFromWeiHex,
  addHexes,
  multipyHexes,
  decGWEIToHexWEI,
} from 'ui/utils/conversion';
import { ETH, TransactionEnvelopeTypes } from 'constants/transaction';
import { current } from '@reduxjs/toolkit';
import { Token } from 'types/token';
import { CustomButton } from 'ui/components/Widgets';
import { t } from 'utils';
import { useDispatch, useSelector } from 'react-redux';
import {
  showLoadingIndicator,
  hideLoadingIndicator,
} from 'ui/reducer/appState.reducer';
import { BaseAccount } from 'types/extend';
import { IconComponent } from 'ui/components/IconComponents';
import FeeSelector from 'ui/components/FeeSelector';
import { useMethodData } from 'ui/hooks/metamask/useMethodData';
import { HeaderWithFlex } from 'ui/components/Header';

const { TabPane } = Tabs;

const normalizeHex = (value: string | number) => {
  if (typeof value === 'number') {
    return intToHex(Math.floor(value));
  }
  if (typeof value === 'string') {
    if (!isHexPrefixed(value)) {
      return addHexPrefix(value);
    }
    return value;
  }
  return value;
};

const normalizeTxParams = (tx) => {
  const copy = tx;
  if ('nonce' in copy) {
    copy.nonce = normalizeHex(copy.nonce);
  }
  if ('gas' in copy) {
    copy.gas = normalizeHex(copy.gas);
  }
  if ('gasLimit' in copy) {
    copy.gas = normalizeHex(copy.gas);
  }
  if ('gasPrice' in copy) {
    copy.gasPrice = normalizeHex(copy.gasPrice);
  }
  if ('value' in copy) {
    copy.value = addHexPrefix(copy.value || '0x0');
  }
  return copy;
};

const valueToDisplay = (tx) => {
  if ((tx.value === '0x' || tx.value === '0x0') && tx.txParam) {
    return tx.txParam.value;
  }
  return tx.value;
};

const SignTx = ({ params, origin }) => {
  const { t } = useTranslation();
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [prices, setPrices] = useState();
  const gasState: any = useSelector((state) => state.gas);
  const [visible, setVisible] = useState(false);
  const tx = normalizeTxParams(params.data[0]);

  const [maxFeePerGas, setMaxFeePerGas] = useState<string>(tx.maxFeePerGas);
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState<string>(
    tx.maxPriorityFeePerGas
  );
  const [totalGasfee, setTotalGasFee] = useState<string>('0x0');
  const [currency, setCurrency] = useState('ETH');

  useAsyncEffect(async () => {
    const gas = await wallet.fetchGasFeeEstimates();
    const { gasFeeEstimates, gasEstimateType } = gas;
    const { suggestedMaxPriorityFeePerGas, suggestedMaxFeePerGas } =
      gasFeeEstimates[gasState.gasType];
    setMaxFeePerGas(
      addHexPrefix(decGWEIToHexWEI(suggestedMaxFeePerGas).toString())
    );
    setMaxPriorityFeePerGas(
      addHexPrefix(decGWEIToHexWEI(suggestedMaxPriorityFeePerGas).toString())
    );
  }, [gasState]);

  useAsyncEffect(async () => {
    const currency = await wallet.getCurrentCurrency();
    setCurrency(currency);
  });

  useEffect(() => {
    const a = addHexes(maxFeePerGas, maxPriorityFeePerGas).toString();
    const MIN_GAS_LIMIT_DEC = '21000';
    const total = multipyHexes(a, MIN_GAS_LIMIT_DEC).toString();
    setTotalGasFee(addHexPrefix(total));
  }, [maxFeePerGas, maxPriorityFeePerGas]);

  const handleAllow = async () => {
    dispatch(showLoadingIndicator());
    if (tx.type === TransactionEnvelopeTypes.FEE_MARKET) {
      resolveApproval({
        ...tx,
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
      })
        .then(() => delay(1000))
        .then(() => dispatch(hideLoadingIndicator()));
    } else {
      resolveApproval({
        ...tx,
        gasPrice: '0xd31db1',
      })
        .then(() => delay(1000))
        .then(() => dispatch(hideLoadingIndicator()));
    }
  };
  const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

  const handleCancel = () => {
    dispatch(showLoadingIndicator());
    rejectApproval('User rejected the request.')
      .then(() => delay(1000))
      .then(() => dispatch(hideLoadingIndicator()));
  };

  const fetchNativePrice = async () => {
    const tokens = await wallet.getTokenBalancesAsync(true);
    const prices = await wallet.queryTokenPrices();
    if (prices) setPrices(prices);
    if (tokens) setTokens(tokens);
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

  const txToken = useMemo(() => {
    const txToken = tokens.find((t: Token) => t.symbol === tx.txParam.symbol);
    return txToken;
  }, [tokens, prices]);

  useAsyncEffect(fetchNativePrice, []);

  useAsyncEffect(async () => {
    const session = params.session;
    const site = await wallet.getConnectedSite(session.origin);
    const from: BaseAccount = await wallet.getAccountByAddress(tx.txParam.from);
    const to: BaseAccount = await wallet.getAccountByAddress(tx.txParam.to);
    setSenderName(from?.accountName);
    setRecipientName(to?.accountName);
  }, []);

  const renderContent = () => {
    if (tx.data) {
      return (
        <div className="tx-details-tab-container flex content-wrap-padding">
          <Tabs defaultActiveKey="1">
            <TabPane tab={t('DETAILS')} key="1">
              <TxDetailComponent
                tx={tx}
                nativeToken={nativeToken}
                setVisible={setVisible}
                totalGasfee={totalGasfee}
                currency={currency}
              />
            </TabPane>
            <TabPane tab={t('DATA')} key="2">
              <TxDataComponent tx={tx} />
            </TabPane>
          </Tabs>
        </div>
      );
    }
    return (
      <div className="tx-details-tab-container flex content-wrap-padding">
        <TxDetailComponent
          tx={tx}
          nativeToken={nativeToken}
          setVisible={setVisible}
          totalGasfee={totalGasfee}
          currency={currency}
        />
      </div>
    );
  };

  return (
    <div className="approval-tx flexCol">
      <div className="top-part-container flexCol flex-wrap items-center">
        <HeaderWithFlex
          title={<NetworkDisplay />}
          handleBackClick={handleCancel}
        />
        <SenderToRecipient
          senderAddress={tx.txParam.from || tx.from}
          senderName={senderName}
          recipientName={recipientName}
          recipientAddress={tx.txParam.to || tx.to}
        />
        <TxSummaryComponent
          action={params.method}
          value={valueToDisplay(tx)}
          token={txToken}
          origin={origin}
        />
      </div>
      {renderContent()}
      <FeeSelector visible={visible} onClose={() => setVisible(false)} />
      <div className="tx-button-container flexCol content-wrap-padding">
        <CustomButton
          type="primary"
          onClick={handleAllow}
          cls="theme tx-btn-container-top"
          block
        >
          {t('Send')}
        </CustomButton>
      </div>
    </div>
  );
};

const TxDetailComponent = ({
  tx,
  nativeToken,
  setVisible,
  totalGasfee,
  currency,
}) => {
  const { t } = useTranslation();

  const renderTotalMaxAmount = () => {
    const totalHex = addHexPrefix(
      addHexes(valueToDisplay(tx), totalGasfee).toString()
    );
    const total = getValueFromWeiHex({ value: totalHex, numberOfDecimals: 10 });
    return `${total} ${currency}`;
  };

  const renderTotalGasFeeAmount = () => {
    const totalDec = getValueFromWeiHex({
      value: totalGasfee,
      numberOfDecimals: 10,
    });
    return `${totalDec} ${currency}`;
  };

  const renderTotalGasFeeFiat = () => {
    const res = getTotalPricesByAmountAndPrice(
      totalGasfee,
      nativeToken?.decimal || 0,
      nativeToken?.price || 0
    );
    return res;
  };

  const renderTotalMaxFiat = () => {
    const totalHex = addHexPrefix(
      addHexes(valueToDisplay(tx), totalGasfee).toString()
    );
    return getTotalPricesByAmountAndPrice(
      totalHex,
      nativeToken?.decimal || 0,
      nativeToken?.price || 0
    );
  };

  return (
    <div className="transaction-detail">
      <Divider style={{ marginTop: 0, marginBottom: 16 }} />
      <div
        className="gas-edit-button flex ml-auto"
        onClick={() => setVisible(true)}
      >
        <IconComponent name="edit" cls="edit-icon" />
        <div>{t('Edit')}</div>
      </div>
      <TransactionDetailItem
        key="gas-item"
        detailTitle={t('Referral gas fee')}
        subTitle={undefined}
        detailText={`${renderTotalGasFeeAmount()}`}
        detailSubText={`$ ${renderTotalGasFeeFiat()}`}
        detailMax={`Max fee: ${renderTotalGasFeeAmount()}`}
      />
      <Divider style={{ margin: '16px 0' }} />
      <TransactionDetailItem
        key="total-item"
        detailTitle={t('Sum')}
        subTitle={t('Amount + gas fee')}
        detailText={renderTotalMaxAmount()}
        detailSubText={`$ ${renderTotalMaxFiat()}`}
        detailMax={`Max amount: ${renderTotalMaxAmount()}`}
      />
    </div>
  );
};

const TxDataComponent = ({ tx }) => {
  const { t } = useTranslation();
  const functionMethod = useMethodData(tx.data);
  return (
    <div className="transaction-data flexCol">
      <div className="transaction-data-title">
        {`Function Type: ${functionMethod?.name}`}
      </div>
      <div className="transaction-data-params">
        <div>{`${t('parameters')}:`}</div>
        <div>
          <pre>{JSON.stringify(functionMethod?.params, null, 2)}</pre>
        </div>
      </div>
      <div className="transaction-data-title">Hex Data:</div>
      <div className="transaction-data-value">{tx.data}</div>
    </div>
  );
};

const TxSummaryComponent = ({ action, value, token, origin }) => {
  return (
    <div className="tx-summary">
      <div className="tx-summary-origin">
        {origin === 'https://teleport.network' ? null : <div>{origin}</div>}
      </div>
      {/* <div className="tx-summary-action">
        {action === 'eth_sendTransaction' ? 'Transfer' : action}
      </div> */}
      <div className="tx-summary-currency">
        <UserPreferencedCurrencyDisplay value={value} token={token} />
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

export default SignTx;
