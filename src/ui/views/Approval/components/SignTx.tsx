/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { intToHex, isHexPrefixed, addHexPrefix } from 'ethereumjs-util';
import { Tabs, Divider } from 'antd';
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
} from 'ui/utils/conversion';
import { TransactionEnvelopeTypes } from 'constants/transaction';
import { Token } from 'types/token';
import { CustomButton } from 'ui/components/Widgets';
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
const { sensors } = skynet;

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
  if ((tx.value === '0x' || tx.value === '0x0') && tx.txParam.value) {
    return tx.txParam.value;
  }
  return tx.value;
};

const SignTx = ({ params, origin }) => {
  const location = useLocation();
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
  // for 1559 tx
  const [maxFeePerGas, setMaxFeePerGas] = useState<string>(tx.maxFeePerGas);
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState<string>(
    tx.maxPriorityFeePerGas
  );
  // for non-1559 tx
  const [gasPrice, setGasPrice] = useState<string>(tx.gasPrice);

  const [totalGasfee, setTotalGasFee] = useState<string>('0x0');

  const initState = async () => {
    const gas = await wallet.fetchGasFeeEstimates();
    const { gasFeeEstimates, gasEstimateType } = gas;
    //const MIN_GAS_LIMIT_HEX = '0x5208';
    if (tx.type === TransactionEnvelopeTypes.LEGACY) {
      let gasPrice = '0x1';
      if (gasState.gasType == 'custom') {
        gasPrice = getRoundedGasPrice(gasState.legacyGas.gasPrice);
      } else if (gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY) {
        gasPrice = getGasPriceInHexWei(gasFeeEstimates.medium);
      } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
        gasPrice = getRoundedGasPrice(gasFeeEstimates.gasPrice);
      } else {
        gasPrice = gasFeeEstimates.gasPrice
          ? getRoundedGasPrice(gasFeeEstimates.gasPrice)
          : '0x0';
      }
      setGasPrice(tx.gasPrice || gasPrice);
      const total = multipyHexes(
        gasPrice,
        tx.gas || MIN_GAS_LIMIT_HEX
      ).toString();
      setTotalGasFee(addHexPrefix(total));
    } else {
      const { suggestedMaxPriorityFeePerGas, suggestedMaxFeePerGas } =
        gasState.gasType === 'custom'
          ? gasState.customData
          : gasFeeEstimates[gasState.gasType];
      setMaxFeePerGas(
        addHexPrefix(decGWEIToHexWEI(suggestedMaxFeePerGas).toString())
      );
      setMaxPriorityFeePerGas(
        addHexPrefix(decGWEIToHexWEI(suggestedMaxPriorityFeePerGas).toString())
      );
      const a = addHexes(maxFeePerGas, maxPriorityFeePerGas).toString();
      const total = multipyHexes(a, tx.gas || MIN_GAS_LIMIT_HEX).toString();
      setTotalGasFee(addHexPrefix(total));
    }
  };

  useAsyncEffect(initState, [gasState.gasType, gasState.legacyGas]);

  const handleAllow = async () => {
    sensors.track('teleport_sign_tx_confirmed', {
      page: location.pathname,
      from: tx.from,
      to: tx.to,
    });
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
        gasPrice: gasPrice,
      })
        .then(() => delay(1000))
        .then(() => dispatch(hideLoadingIndicator()));
    }
  };
  const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

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
    const prices = await wallet.queryTokenPrices();
    if (prices) setPrices(prices);
    if (tokens) setTokens(tokens);
    dispatch(hideLoadingIndicator());
  };

  useAsyncEffect(fetchNativePrice, []);

  useAsyncEffect(async () => {
    const session = params.session;
    const site = await wallet.getConnectedSite(session.origin);
    const from: BaseAccount = await wallet.getAccountByAddress(tx.txParam.from);
    const to: BaseAccount = await wallet.getAccountByAddress(tx.txParam.to);
    setSenderName(from?.accountName);
    setRecipientName(to?.accountName);
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
    const txToken = tx.txParam.symbol
      ? tokens.find((t: Token) => t.symbol === tx.txParam.symbol)
      : nativeToken;
    return txToken;
  }, [tokens, prices]);

  const supportsEIP1559 = tx.type === TransactionEnvelopeTypes.FEE_MARKET;

  const renderContent = () => {
    if (tx.data) {
      return (
        <div className="tx-details-tab-container flex content-wrap-padding">
          <Tabs defaultActiveKey="1" style={{ width: '100% ' }}>
            <TabPane tab={t('DETAILS')} key="1">
              <TxDetailComponent
                tx={tx}
                txToken={txToken}
                nativeToken={nativeToken}
                setVisible={setVisible}
                totalGasfee={totalGasfee}
                currency={nativeToken?.symbol}
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
          txToken={txToken}
          nativeToken={nativeToken}
          setVisible={setVisible}
          totalGasfee={totalGasfee}
          currency={nativeToken?.symbol}
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
        <Divider style={{ marginTop: 16, marginBottom: 0 }} />
      </div>
      {renderContent()}
      <FeeSelector
        gasLimit={Number(tx.gas || MIN_GAS_LIMIT_HEX)}
        supportsEIP1559={supportsEIP1559}
        visible={visible}
        onClose={() => setVisible(false)}
      />
      <div className="tx-button-container flexCol content-wrap-padding">
        <CustomButton
          type="primary"
          onClick={handleAllow}
          cls="theme tx-btn-container-top"
          block
        >
          {t('Send')}
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

const TxDetailComponent = ({
  tx,
  txToken,
  nativeToken,
  setVisible,
  totalGasfee,
  currency,
}: {
  tx: any;
  txToken: Token | undefined;
  nativeToken: Token | undefined;
  setVisible: any;
  totalGasfee: any;
  currency: any;
}) => {
  const { t } = useTranslation();
  const isNative = () => currency === txToken?.symbol;

  const renderTotalMaxAmount = () => {
    if (isNative()) {
      const totalHex = addHexPrefix(
        addHexes(valueToDisplay(tx), totalGasfee).toString()
      );
      const total = getValueFromWeiHex({
        value: totalHex,
        numberOfDecimals: 10,
      });
      return `${total} ${currency || ''}`;
    }
    const transferDec = getValueFromWeiHex({
      value: valueToDisplay(tx),
      numberOfDecimals: 10,
    });
    const gasDec = getValueFromWeiHex({
      value: totalGasfee,
      numberOfDecimals: 10,
    });
    return `${transferDec} ${tx.txParam.symbol} + ${gasDec} ${currency}`;
  };

  const renderTotalGasFeeAmount = () => {
    const totalDec = getValueFromWeiHex({
      value: totalGasfee,
      numberOfDecimals: 10,
    });
    return `${totalDec} ${currency || ''}`;
  };

  const renderTotalGasFeeFiat = () => {
    const totalDec = getTotalPricesByAmountAndPrice(
      totalGasfee,
      nativeToken?.decimal || 0,
      nativeToken?.price || 0
    );
    return `$ ${totalDec}`;
  };

  const renderTotalMaxFiat = () => {
    if (isNative()) {
      const totalHex = addHexPrefix(
        addHexes(valueToDisplay(tx), totalGasfee).toString()
      );
      const totalDec = getTotalPricesByAmountAndPrice(
        totalHex,
        nativeToken?.decimal || 0,
        nativeToken?.price || 0
      );
      return `$ ${totalDec}`;
    }
    const totalTxDec = getTotalPricesByAmountAndPrice(
      valueToDisplay(tx),
      txToken?.decimal || 0,
      txToken?.price || 0
    );
    const totalGasDec = getTotalPricesByAmountAndPrice(
      totalGasfee,
      nativeToken?.decimal || 0,
      nativeToken?.price || 0
    );
    const totalAmountDec = addCurrencies(totalTxDec, totalGasDec, {
      aBase: 10,
      bBase: 10,
      toNumericBase: 'dec',
    });
    return `$ ${totalAmountDec}`;
  };

  return (
    <div className="transaction-detail">
      <div
        className="gas-edit-button flex ml-auto"
        onClick={() => {
          setVisible(true);
          sensors.track('teleport_sign_tx_edit_gas', {
            page: location.pathname,
          });
        }}
      >
        <IconComponent name="edit" cls="edit-icon" />
        <div>{t('Edit')}</div>
      </div>
      <TransactionDetailItem
        key="gas-item"
        detailTitle={t('Referral gas fee')}
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
