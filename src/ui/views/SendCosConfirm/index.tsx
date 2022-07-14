import React, { useState, useMemo, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { intToHex, isHexPrefixed, addHexPrefix } from 'ethereumjs-util';
import { Divider } from 'antd';
import { utils } from 'ethers';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { useWallet, useApproval, useAsyncEffect } from 'ui/utils';
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
import './style.less';
const { sensors } = skynet;

const TxSummaryComponent = ({ value, token, origin }) => {
  return (
    <div className="tx-summary">
      <div className="tx-summary-origin">
        {origin === 'https://teleport.network' ? null : <div>{origin}</div>}
      </div>
      <div className="tx-summary-currency">
        <UserPreferencedCurrencyDisplay
          value={value}
          token={token}
          isEVM={false}
        />
      </div>
    </div>
  );
};

const valueToDisplay = (tx) => {
  if ((tx.value === '0x' || tx.value === '0x0') && tx.txParam.value) {
    return tx.txParam.value;
  }
  return tx.value;
};

const defaultStdFee = {
  amount: [
    {
      denom: 'uatom',
      amount: '2500',
    },
  ],
  gas: '200000',
};

const ConfirmTx = () => {
  const history = useHistory();
  // amount, recipient: toAddress, memo
  const { state, pathname } = useLocation<{
    amount: string;
    recipient: string;
    memo: string;
    token: any;
  }>();
  const { amount, recipient, memo, token } = state;
  // const amount = '0.1';
  // const recipient = 'osmo1zcph3rkpnjpdyjdzd98yds2l4wn68spajxxfay';
  // const memo = '';
  // const token = {
  //   symbol: 'HULC',
  //   denom:
  //     'cw20:juno1pshrvuw5ng2q4nwcsuceypjkp48d95gmcgjdxlus2ytm4k5kvz2s7t9ldx:HULCAT',
  //   decimal: 6,
  // };
  const currency = {
    coinDenom: token?.symbol || 'ATOM',
    coinMinimalDenom: token?.denom || 'uatom',
    coinDecimals: token?.decimal || 6,
  };
  const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));
  const location = useLocation();
  const { t } = useTranslation();
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const gasState: any = useSelector((state) => state.gas);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [prices, setPrices] = useState();
  const [visible, setVisible] = useState(false);
  const [sendMsg, setSendMsg] = useState({ from_address: '', to_address: '' });
  const [stdFee, setStdFee] = useState(defaultStdFee);

  const handleAllow = async () => {
    const signOptions = {
      preferNoSetFee: true,
      preferNoSetMemo: true,
    };
    const onTxEvents = {
      onBroadcasted: (txHash) => {
        console.log('--------------onBroadcasted--------------', txHash);
      },
      onFulfil: (tx) => {
        console.log('--------------onBroadcasted--------------', tx);
      },
    };
    dispatch(showLoadingIndicator());
    await wallet.sendCosmosToken(
      amount,
      currency,
      recipient,
      state.token.contractAddress || '',
      memo,
      stdFee,
      signOptions,
      onTxEvents
    );
    dispatch(hideLoadingIndicator());
    history.push('/home');
  };

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
  const fixedFeeType = (feeType) => {
    // export type FeeType = "high" | "average" | "low";
    if (feeType === 'medium') {
      return 'average';
    }
    return feeType;
  };

  const fetchStdFee = async () => {
    dispatch(showLoadingIndicator());
    const feeType = fixedFeeType(gasState.gasType);
    let _stdFee = defaultStdFee;
    if (gasState.customType) {
      _stdFee = await wallet.getCosmosStdFee(
        feeType,
        currency,
        Number(gasState.cosmosCustomsGas)
      );
    } else {
      _stdFee = await wallet.getCosmosStdFee(feeType, currency);
    }
    setStdFee(_stdFee);
    dispatch(hideLoadingIndicator());
  };

  useAsyncEffect(fetchStdFee, [gasState]);

  useAsyncEffect(async () => {
    const from: BaseAccount = await wallet.getAccountByAddress(
      sendMsg?.from_address
    );
    const to: BaseAccount = await wallet.getAccountByAddress(recipient);
    setSenderName(from?.accountName);
    setRecipientName(to?.accountName);
  }, [sendMsg]);

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
    const symbol = token.symbol;
    const txToken = symbol
      ? tokens.find((t: Token) => t.symbol === symbol)
      : nativeToken;
    return txToken;
  }, [tokens, prices]);

  const [tabType, setTabType] = useState<Tabs>(Tabs.FIRST);

  useAsyncEffect(async () => {
    const result = await wallet.generateCosmosMsg({
      amount,
      currency,
      recipient,
      memo,
      stdFee,
      contractAddress: state.token.contractAddress,
    });
    setSendMsg(result);
  }, [txToken]);

  const origin = 'https://teleport.network';

  return (
    <div className="approval">
      <div className="approval-tx flexCol">
        <div className="top-part-container flexCol flex-wrap items-center">
          <HeaderWithFlex
            title={<NetworkDisplay />}
            handleBackClick={handleCancel}
          />
          <SenderToRecipient
            senderAddress={sendMsg?.from_address}
            senderName={senderName}
            recipientName={recipientName}
            recipientAddress={recipient}
            needChecksum={false}
          />

          <TxSummaryComponent value={amount} token={txToken} origin={origin} />
        </div>
        <div className="tx-details-tab-container">
          <CustomTab
            tab1="Details"
            tab2="Data"
            currentTab={tabType}
            handleTabClick={setTabType}
          />
          {tabType === Tabs.FIRST && (
            <TxDetailComponent
              amount={amount}
              txToken={txToken}
              nativeToken={nativeToken}
              setVisible={setVisible}
              currency={nativeToken?.symbol}
              stdFee={stdFee}
            />
          )}
          {tabType === Tabs.SECOND && <TxDataComponent msg={sendMsg} />}
        </div>
        <FeeSelector
          isCosmos={true}
          visible={visible}
          onClose={() => setVisible(false)}
          currency={currency}
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
    </div>
  );
};

const TxDataComponent = ({ msg }) => {
  return (
    <div className="transaction-data flexCol">
      <div className="transaction-data-title">{'Function Type: '}</div>
      <div className="transaction-data-params">
        <div>{msg?.msgs[0]?.type}</div>
      </div>
      <div className="transaction-data-title">Hex Data:</div>
      <div className="transaction-data-value">{JSON.stringify(msg)}</div>
    </div>
  );
};

const TxDetailComponent = ({
  amount,
  txToken,
  nativeToken,
  setVisible,
  currency,
  stdFee,
}: {
  amount: any;
  txToken: Token | undefined;
  nativeToken: Token | undefined;
  setVisible: any;
  currency: any;
  stdFee: any;
}) => {
  const { t } = useTranslation();
  const fee = utils.formatUnits(stdFee?.amount[0].amount, txToken?.decimal);
  const txTokenPrice = Number(txToken?.price || 0);
  const nativeTokenPrice = Number(nativeToken?.price || 0);

  const renderTotalGasFeeAmount = () => {
    return `${fee} ${nativeToken?.symbol || ''}`;
  };
  const renderTotalGasFeeFiat = () => {
    const feePrice = new BigNumber(fee);
    return `$ ${feePrice.times(nativeTokenPrice).toString()}`;
  };
  const renderTotalMaxAmount = () => {
    if (txToken?.isNative) {
      const total = new BigNumber(amount).plus(fee);
      return `${total.toString()} ${nativeToken?.symbol || ''}`;
    }
    return `${amount} ${txToken?.symbol} + ${renderTotalGasFeeAmount()}`;
  };

  const renderTotalMaxFiat = () => {
    let total = '0';
    if (txToken?.isNative) {
      total = new BigNumber(amount)
        .plus(fee)
        .times(nativeTokenPrice)
        .toString();
    } else {
      total = new BigNumber(fee)
        .times(nativeTokenPrice)
        .plus(new BigNumber(amount).times(txTokenPrice))
        .toString();
    }
    return `$ ${total}`;
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
        detailTitle={t('Estimated gas fee')}
        subTitle={undefined}
        detailText={renderTotalGasFeeAmount()}
        detailSubText={renderTotalGasFeeFiat()}
        detailMax={'Max fee: ' + renderTotalGasFeeAmount()}
      />
      <Divider style={{ margin: '16px 0' }} />
      <TransactionDetailItem
        key="total-item"
        detailTitle={t('Sum')}
        subTitle={t('Amount + gas fee')}
        detailText={renderTotalMaxAmount()}
        detailSubText={renderTotalMaxFiat()}
        detailMax={'Max amount: ' + renderTotalMaxAmount()}
      />
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

export default ConfirmTx;
