/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
import FeeSelector from 'ui/components/FeeSelector';
import { ReactComponent as IconEdit } from 'assets/action-icon/edit.svg';

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
import { ethers } from 'ethers';
// import { getSymbolByERC20Contract, parseErc20Data } from 'ui/utils/parseERC20';
const { sensors } = skynet;

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
  if ('maxFeePerGas' in copy) {
    copy.maxFeePerGas = normalizeHex(copy.maxFeePerGas);
  }
  if ('maxPriorityFeePerGas' in copy) {
    copy.maxPriorityFeePerGas = normalizeHex(copy.maxPriorityFeePerGas);
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
  const gasLimitRef = useRef<string>(tx.gas || addHexPrefix(MIN_GAS_LIMIT_HEX));
  // for 1559 tx
  const [maxFeePerGas, setMaxFeePerGas] = useState<string>(tx.maxFeePerGas);
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState<string>(
    tx.maxPriorityFeePerGas
  );
  // for non-1559 tx
  const [gasPrice, setGasPrice] = useState<string>(tx.gasPrice);

  const [totalGasfee, setTotalGasFee] = useState<string>('0x0');

  const functionMethod = useMethodData(tx.data);

  const [currentTx, setCurrentTx] = useState(tx);

  const initState = async () => {
    const gas = await wallet.fetchGasFeeEstimates();
    const { gasFeeEstimates, gasEstimateType } = gas;
    //const MIN_GAS_LIMIT_HEX = '0x5208';
    if (tx.type === TransactionEnvelopeTypes.LEGACY) {
      let gasPrice = '0x1';
      if (tx.gasPrice) {
        gasPrice = tx.gasPrice;
        delete tx.gasPrice;
      } else if (gasState.gasType == 'custom') {
        gasPrice = getRoundedGasPrice(gasState.legacyGas.gasPrice);
        gasLimitRef.current = addHexPrefix(
          conversionUtil(gasState.legacyGas.gasLimit, {
            fromNumericBase: 'dec',
            toNumericBase: 'hex',
          })
        );
      } else if (gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY) {
        gasPrice = getGasPriceInHexWei(gasFeeEstimates.medium);
      } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
        gasPrice = getRoundedGasPrice(gasFeeEstimates.gasPrice);
      } else {
        gasPrice = gasFeeEstimates.gasPrice
          ? getRoundedGasPrice(gasFeeEstimates.gasPrice)
          : '0x0';
      }
      setGasPrice(gasPrice);
      const total = multipyHexes(gasPrice, gasLimitRef.current).toString();
      setTotalGasFee(addHexPrefix(total));
    } else {
      // eslint-disable-next-line prefer-const
      let { suggestedMaxPriorityFeePerGas, suggestedMaxFeePerGas, gasLimit } =
        gasState.gasType === 'custom'
          ? gasState.customData
          : gasFeeEstimates[gasState.gasType];
      if (gasLimit) {
        gasLimitRef.current = addHexPrefix(
          conversionUtil(gasLimit, {
            fromNumericBase: 'dec',
            toNumericBase: 'hex',
          })
        );
      }
      if (tx.maxFeePerGas || tx.maxPriorityFeePerGas) {
        suggestedMaxFeePerGas = hexWeiToDecGWEI(tx.maxFeePerGas);
        suggestedMaxPriorityFeePerGas = hexWeiToDecGWEI(
          tx.maxPriorityFeePerGas
        );
        delete tx.maxFeePerGas;
        delete tx.maxPriorityFeePerGas;
      }
      const _maxFeePerGas = addHexPrefix(
        decGWEIToHexWEI(suggestedMaxFeePerGas).toString()
      );
      setMaxFeePerGas(_maxFeePerGas);
      const _maxPriorityFeePerGas = addHexPrefix(
        decGWEIToHexWEI(suggestedMaxPriorityFeePerGas).toString()
      );
      setMaxPriorityFeePerGas(_maxPriorityFeePerGas);
      const calGasFee = Math.min(
        Number(suggestedMaxPriorityFeePerGas) +
          Number(gasFeeEstimates.estimatedBaseFee),
        Number(suggestedMaxFeePerGas)
      );
      const calGasFeeHex = addHexPrefix(decGWEIToHexWEI(calGasFee).toString());
      // const _a2 = addHexes(_maxFeePerGas, _maxPriorityFeePerGas).toString();
      const total = multipyHexes(calGasFeeHex, gasLimitRef.current).toString();
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
        gas: gasLimitRef.current,
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
      })
        .then(() => delay(1000))
        .then(() => dispatch(hideLoadingIndicator()));
    } else {
      resolveApproval({
        ...tx,
        gas: gasLimitRef.current,
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
    const tokens = await wallet.getTokenBalancesAsync();
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

  const getTxTokenAsync = async () => {
    if (functionMethod?.name === 'transfer') {
      // console.log('getTxToken transfer', tx);
      // 1. 根据 to 获取symbol
      const symbol = await wallet.getSymbolByERC20Contract(tx.to);
      // console.log('symbol ===  tokens', symbol, tokens);

      // 2. 解析 data , 获取转账金额 value   tx.data
      const { params } = await wallet.parseErc20Data(tx.data);
      // 3. 将 value 赋值给 tx.value
      // console.log('parseErc20Data 22 total ', params[1].value);
      // tx.value = ethers.BigNumber.from(params[1].value).toHexString();
      // tx.txParam.symbol = symbol;
      setCurrentTx({
        ...tx,
        value: ethers.BigNumber.from(params[1].value).toHexString(),
        txParam: {
          ...tx.txParam,
          symbol,
        },
      });
    } else {
      // 原生代币
      setCurrentTx({
        ...tx,
      });
    }
  };

  useAsyncEffect(getTxTokenAsync, [tokens]);

  const supportsEIP1559 = tx.type === TransactionEnvelopeTypes.FEE_MARKET;

  const [tabType, setTabType] = useState<Tabs>(Tabs.FIRST);

  const renderContent = () => {
    if (tx.data) {
      return (
        <div className="tx-details-tab-container">
          <CustomTab
            tab1="Details"
            tab2="Data"
            currentTab={tabType}
            handleTabClick={setTabType}
          />
          {tabType === Tabs.FIRST && (
            <TxDetailComponent
              tx={currentTx}
              tokens={tokens}
              symbol={currentTx.txParam.symbol || nativeToken?.symbol}
              nativeToken={nativeToken}
              setVisible={setVisible}
              totalGasfee={totalGasfee}
              currency={nativeToken?.symbol}
            />
          )}
          {tabType === Tabs.SECOND && <TxDataComponent tx={tx} />}
        </div>
      );
    }
    return (
      <div className="tx-details-tab-container flex">
        <TxDetailComponent
          tx={currentTx}
          tokens={tokens}
          symbol={currentTx.txParam.symbol || nativeToken?.symbol}
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
          tx={currentTx}
          senderAddress={currentTx.txParam.from || currentTx.from}
          senderName={senderName}
          recipientName={recipientName}
          recipientAddress={currentTx.txParam.to || currentTx.to}
        />
        <TxSummaryComponent
          action={params.method}
          value={valueToDisplay(currentTx)}
          tokens={tokens}
          symbol={currentTx.txParam.symbol || nativeToken?.symbol}
          origin={origin}
        />
      </div>
      {renderContent()}
      <FeeSelector
        gasLimit={Number(currentTx.gas || addHexPrefix(MIN_GAS_LIMIT_HEX))}
        supportsEIP1559={supportsEIP1559}
        visible={visible}
        onClose={() => setVisible(false)}
        gasPrice={gasPrice}
        maxFeePerGas={maxFeePerGas}
        maxPriorityFeePerGas={maxPriorityFeePerGas}
      />
      <div className="tx-button-container flexCol">
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
  tokens,
  symbol,
  nativeToken,
  setVisible,
  totalGasfee,
  currency,
}: {
  tx: any;
  tokens: Token[];
  symbol: string;
  nativeToken: Token | undefined;
  setVisible: any;
  totalGasfee: any;
  currency: any;
}) => {
  const { t } = useTranslation();
  let token = tokens.find((t: Token) => t.symbol === symbol);
  const isNative = () => currency === symbol;
  // const nativeTokenNew = tokens.find((t: Token) => t.isNative);
  console.log('isNative() === ', isNative());

  const renderTotalMaxAmount = () => {
    if (!token && symbol === 'USDt') {
      token = {
        symbol: 'USDt',
        decimal: 6,
        name: '',
        denom: '',
        isNative: false,
        isCustom: false,
        chainCustomId: '',
      };
    }

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
    const multiplier = Math.pow(10, Number(token?.decimal || 0));
    const transferDec = conversionUtil(addHexPrefix(valueToDisplay(tx)), {
      fromNumericBase: 'hex',
      toNumericBase: 'dec',
      toCurrency: token?.symbol || ETH,
      conversionRate: multiplier,
      invertConversionRate: true,
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

  const renderMaxFeeGasAmount = () => {
    const { gasLimit, maxFeePerGas } = tx.txParam;
    let maxFeeDisplay: any;
    if (gasLimit && maxFeePerGas) {
      const bnGasLimit = ethers.BigNumber.from(gasLimit);
      const bnMaxFeePerGas = ethers.BigNumber.from(maxFeePerGas);
      maxFeeDisplay = bnGasLimit.mul(bnMaxFeePerGas).toString();
      maxFeeDisplay = ethers.utils.formatUnits(maxFeeDisplay, 'ether');
      return `${maxFeeDisplay} ${currency || ''}`;
    } else {
      maxFeeDisplay = getValueFromWeiHex({
        value: totalGasfee,
        numberOfDecimals: 10,
      });
    }
    return `${maxFeeDisplay} ${currency || ''}`;
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
      token?.decimal || 0,
      token?.price || 0
    );
    console.log('renderTotalMaxFiat --- totalTxDec', totalTxDec);
    const totalGasDec = getTotalPricesByAmountAndPrice(
      totalGasfee,
      nativeToken?.decimal || 0,
      nativeToken?.price || 0
    );
    console.log('renderTotalMaxFiat --- totalGasDec', totalGasDec);
    try {
      const totalAmountDec = addCurrencies(totalTxDec, totalGasDec, {
        aBase: 10,
        bBase: 10,
        toNumericBase: 'dec',
      });
      return `$ ${totalAmountDec}`;
    } catch (error) {
      return `${JSON.stringify(error)}`;
    }
  };

  return (
    <div className="transaction-detail">
      <Divider style={{ margin: '16px 0' }} />
      <div
        className="gas-edit-button flex ml-auto"
        onClick={() => {
          setVisible(true);
          sensors.track('teleport_sign_tx_edit_gas', {
            page: location.pathname,
          });
        }}
      >
        <IconEdit width={16} className="edit-icon" />
        <div>{t('Edit')}</div>
      </div>
      <TransactionDetailItem
        key="gas-item"
        detailTitle={t('Estimated gas fee')}
        subTitle={undefined}
        detailText={`${renderTotalGasFeeAmount()}`}
        detailSubText={renderTotalGasFeeFiat()}
        detailMax={`Max fee: ${renderMaxFeeGasAmount()}`}
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

const TxSummaryComponent = ({ action, value, tokens, origin, symbol }) => {
  let token = tokens.find((t: Token) => t.symbol === symbol);
  // const nativeToken = tokens.find((t: Token) => t.isNative);
  if (symbol === 'fUSDT') {
    token = {
      symbol: 'fUSDT',
      decimal: 6,
    };
  } else if (symbol === 'USDt') {
    token = {
      symbol: 'USDt',
      decimal: 6,
    };
  }

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
