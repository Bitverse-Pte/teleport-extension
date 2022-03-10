import React, {
  useState,
  createContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Input, InputNumber, Form, Select, Button, Card, Space } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { addHexPrefix } from 'ethereumjs-util';

import {
  EthDenomination,
  getWeiHexFromDecimalValue,
} from 'ui/utils/conversion';
import Header from 'ui/components/Header';
import { useWallet, useAsyncEffect, denom2SymbolRatio } from 'ui/utils';
import { transferAddress2Display } from 'ui/utils';
import { IDisplayAccountInfo } from 'ui/components/AccountSwitch';
import AccountSelect from 'ui/components/AccountSelect';
import {
  ETH,
  Transaction,
  TransactionEnvelopeTypes,
} from 'constants/transaction';
import { BaseAccount } from 'types/extend';
import { Token } from 'types/token';
import { generateTokenTransferData } from 'ui/context/send.utils';
import { CustomButton, TokenIcon, WalletName } from 'ui/components/Widgets';
import GeneralHeader from 'ui/components/Header/GeneralHeader';
import './style.less';
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentChainId } from 'ui/selectors/selectors';
import { initializeSendState, resetSendState } from 'ui/reducer/send.reducer';

export const AccountSelectContext = createContext<{
  selected?: IDisplayAccountInfo;
  setSelected?: (select: IDisplayAccountInfo) => void;
} | null>(null);

const { Option } = Select;

const Send = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const [selected, setSelected] = useState<BaseAccount | undefined>();
  const { t } = useTranslation();
  //const [form] = Form.useForm();
  const [fromAccount, setFromAccount] = useState<BaseAccount>();
  const [amount, setAmount] = useState<string>('0');
  const [toAddress, setToAddress] = useState<string>();
  const [showToList, setShowToList] = useState<boolean>(false);
  const [balance, setBalance] = useState<Token[]>([]);
  const [accountSelectPopupVisible, setAccountSelectPopupVisible] =
    useState<boolean>(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token>();
  const [recentAddressList, setRecentAddressList] = useState<string[]>();

  const chainId = useSelector(getCurrentChainId);
  const draftTransaction = useSelector(
    (state) => state.send.draftTransaction.txParams
  );
  const isSupport1559 = useSelector((state) => state.send.eip1559support);

  const cleanup = useCallback(() => {
    dispatch(resetSendState());
  }, [dispatch]);

  useEffect(() => {
    if (chainId !== undefined) {
      dispatch(initializeSendState());
    }
  }, [chainId, dispatch, cleanup]);

  useEffect(() => {
    return () => {
      dispatch(resetSendState());
    };
  }, [dispatch, cleanup]);

  useAsyncEffect(async () => {
    const current: BaseAccount | undefined = await wallet.getCurrentAccount();
    current && setFromAccount(current);
    const tokenBalances = await wallet.getTokenBalancesAsync();
    tokenBalances && setBalance(tokenBalances);
  }, []);

  useAsyncEffect(async () => {
    const balances = await wallet.getTokenBalancesAsync(true).catch((e) => {
      console.error(e);
    });
    if (balances && balances.length) {
      setTokens(balances);
      const native = balances.find((t: Token) => t.isNative);
      native ? setSelectedToken(native) : setSelectedToken(balances[0]);
    }
  }, []);

  useAsyncEffect(async () => {
    const txHistory: Record<string, Transaction> = await wallet.getTxHistory();
    const recentAddress = Object.values(txHistory)
      .filter((tx) => tx.txParams.to)
      .map((tx) => tx.txParams.to as string)
      .filter((value, index, self) => self.indexOf(value) === index)
      .slice(0, 5);
    setRecentAddressList(recentAddress);
  }, []);

  const nativeToken = useMemo(() => {
    return balance.find((t: Token) => t.isNative);
  }, [balance]);

  const next = async () => {
    const userInputAmount = addHexPrefix(
      getWeiHexFromDecimalValue({
        value: amount,
        fromCurrency: ETH,
        fromDenomination: EthDenomination.ETH,
      }).toString()
    );
    const type = isSupport1559
      ? TransactionEnvelopeTypes.FEE_MARKET
      : TransactionEnvelopeTypes.LEGACY;
    const params: Record<string, any> = {
      from: fromAccount?.address,
      value: '0x0',
      isSend: true,
      type: type,
    };
    if (selectedToken?.isNative) {
      params.to = toAddress;
      params.value = userInputAmount;
    } else {
      // erc-20 tokens
      params.to = selectedToken?.contractAddress;
      params.data = generateTokenTransferData({
        toAddress: toAddress,
        amount: userInputAmount,
      });
    }
    if (isSupport1559) {
      delete params.gasPrice;
      params.maxFeePerGas = draftTransaction.maxFeePerGas;
      params.maxPriorityFeePerGas = draftTransaction.maxPriorityFeePerGas;
    } else {
      delete params.maxFeePerGas;
      delete params.maxPriorityFeePerGas;
      params.gas = draftTransaction.gas;
    }
    params.txParam = {
      from: fromAccount?.address,
      to: toAddress,
      value: userInputAmount,
      type: type,
      symbol: selectedToken?.symbol,
    };
    wallet.sendRequest({
      method: 'eth_sendTransaction',
      params: [params],
    });
    history.push('/confirm-transaction');
  };

  const myAccountsSelect = () => {
    setAccountSelectPopupVisible(true);
  };

  const handleMaxClick = () => {
    const amountDecimal = denom2SymbolRatio(
      selectedToken?.amount || 0,
      selectedToken?.decimal || 0
    );
    setAmount(amountDecimal);
  };

  const handleTokenSelect = (val) => {
    const selected = tokens.find((t: Token) => t.symbol === val);
    setSelectedToken(selected);
  };

  const addonSymbol = (
    <div className="addonSymbol">{selectedToken?.symbol?.toUpperCase()}</div>
  );

  const assetsOptions = tokens.map((t: Token) => {
    return {
      label: (
        <div className="assets-option flexR">
          <div className="assets-option-left flexR">
            <TokenIcon token={t} scale={0.8} />
            <span className="assets-option-symbol">{t.symbol}</span>
          </div>
          <span className="assets-option-right">
            {`${denom2SymbolRatio(t?.amount || 0, t?.decimal || 0)} ${
              t.symbol
            }`}
          </span>
        </div>
      ),
      selected: (
        <div className="assets-option flexR">
          <div className="assets-option-left flexR">
            <TokenIcon token={t} scale={0.8} />
            <span className="assets-option-symbol">{t.symbol}</span>
            <span className="assets-option-symbol-name">{`(${t.name})`}</span>
          </div>
        </div>
      ),
      value: t.symbol,
    };
  });

  return (
    <div className="send flexCol">
      <GeneralHeader title={t('Send')} hideLogo />
      <div className="send-container">
        <div className="from-container flexCol">
          <div className="account-info flexR">
            <Jazzicon
              seed={Number(fromAccount?.address?.substring(0, 8) || 0)}
              diameter={16}
            />
            <WalletName cls="account-name" width={100}>
              {fromAccount?.accountName || fromAccount?.hdWalletName}
            </WalletName>
          </div>
          <span className="account-address">
            {transferAddress2Display(fromAccount?.address)}
          </span>
        </div>
        <p className="send-form-title">{t('Assets')}</p>
        <Select
          dropdownMatchSelectWidth
          style={{ width: '100%' }}
          //dropdownClassName="assets-option assets-option-symbol assets-option-right"
          value={selectedToken?.symbol}
          onChange={handleTokenSelect}
          optionLabelProp="selected"
          options={assetsOptions}
        ></Select>
        <p className="send-form-title">{t('Amount')}</p>
        <InputNumber
          style={{ width: '100%' }}
          size="large"
          controls={false}
          addonAfter={addonSymbol}
          value={amount}
          onChange={(v) => {
            setAmount(v);
          }}
        />
        <div className="available-container flexR">
          Available:{' '}
          {denom2SymbolRatio(
            selectedToken?.amount || 0,
            selectedToken?.decimal || 0
          )}{' '}
          {selectedToken?.symbol?.toUpperCase()}{' '}
          <button className="max-icon">MAX</button>
        </div>
        <p className="send-form-title">{t('To')}</p>
        <Input
          placeholder={t('Enter Address')}
          value={toAddress}
          className="customInputStyle"
          onFocus={() => setShowToList(true)}
          onChange={(e) => setToAddress(e.target.value)}
        />
        {showToList && (
          <Card
            title={
              <span className="card-title" onClick={myAccountsSelect}>
                {t('Transfer between my accounts >')}
              </span>
            }
            extra={
              <svg
                className="icon"
                aria-hidden="true"
                onClick={myAccountsSelect}
              >
                <use xlinkHref="#icon-chevron-right"></use>
              </svg>
            }
            size="small"
          >
            <p className="recent-title">{t('Recent Address')}</p>
            {recentAddressList?.map((a) => (
              <p
                onClick={() => {
                  setToAddress(a);
                  setShowToList(false);
                }}
                className="recent"
              >
                {a}
              </p>
            ))}
          </Card>
        )}
        <AccountSelect
          currentSelect={selected}
          visible={accountSelectPopupVisible}
          onClose={(selected?: BaseAccount) => {
            if (selected) {
              setSelected(selected);
              setToAddress(selected.address);
              setShowToList(false);
            }
            setAccountSelectPopupVisible(false);
          }}
        />
      </div>
      <div className="button-container content-wrap-padding">
        <CustomButton
          type="primary"
          disabled={
            !toAddress ||
            !amount ||
            !selectedToken ||
            (selectedToken.amount &&
              new BigNumber(
                utils.formatUnits(selectedToken?.amount, selectedToken?.decimal)
              ).lessThan(amount))
          }
          onClick={next}
          cls="theme"
          block
        >
          {t('Next')}
        </CustomButton>
      </div>
    </div>
  );
};

export default Send;
