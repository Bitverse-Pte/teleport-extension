import React, {
  useState,
  createContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Input, InputNumber, Select, Spin } from 'antd';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { addHexPrefix, isValidAddress } from 'ethereumjs-util';

import {
  EthDenomination,
  getWeiHexFromDecimalValue,
  multiplyCurrencies,
} from 'ui/utils/conversion';
import Header from 'ui/components/Header';
import {
  useWallet,
  useAsyncEffect,
  denom2SymbolRatio,
  removeCommas,
} from 'ui/utils';
import { transferAddress2Display } from 'ui/utils';
import { IDisplayAccountInfo } from 'ui/components/AccountSwitch';
import AccountSelect from 'ui/components/AccountSelect';
import {
  ETH,
  HexString,
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
import {
  initializeSendState,
  resetSendState,
  updateRecipient,
  updateSendAsset,
  updateSendAmount,
} from 'ui/reducer/send.reducer';
import { shortenAddress } from 'ui/utils/utils';
import { UnlockModal } from 'ui/components/UnlockModal';
import skynet from 'utils/skynet';
const { sensors } = skynet;

export const AccountSelectContext = createContext<{
  selected?: IDisplayAccountInfo;
  setSelected?: (select: IDisplayAccountInfo) => void;
} | null>(null);

const { Option } = Select;

const Send = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const { tokenId } = useParams<{
    tokenId: string | undefined;
  }>();
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
  const [unlockPopupVisible, setUnlockPopupVisible] = useState(false);

  const chainId = useSelector(getCurrentChainId);
  const draftTransaction = useSelector(
    (state) => state.send.draftTransaction.txParams
  );
  const isSupport1559 = useSelector((state) => state.send.eip1559support);
  console.debug('isSupport1559: ', isSupport1559);
  const isGasEstimateLoading = useSelector(
    (state) => state.send.gas.isGasEstimateLoading
  );

  const cleanup = useCallback(() => {
    dispatch(resetSendState());
  }, [dispatch]);

  useEffect(() => {
    if (chainId !== undefined) {
      dispatch(initializeSendState({ assetId: tokenId }));
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
      const selected = tokenId
        ? balances.find((t: Token) => tokenId === t.tokenId)
        : balances.find((t: Token) => t.isNative);
      selected ? setSelectedToken(selected) : setSelectedToken(balances[0]);
    }
  }, []);

  useAsyncEffect(async () => {
    const balances = await wallet.getTokenBalancesSync(true).catch((e) => {
      console.error(e);
    });
    if (balances && balances.length) {
      setTokens(balances);
      const selected = tokenId
        ? balances.find((t: Token) => tokenId === t.tokenId)
        : balances.find((t: Token) => t.isNative);
      selected ? setSelectedToken(selected) : setSelectedToken(balances[0]);
    }
  }, []);

  useAsyncEffect(async () => {
    const list = await wallet.listContact();
    const recentAddress = list.map((item) => {
      return item.address;
    });
    setRecentAddressList(recentAddress);
  }, []);

  const getHexAmount = (amount: string): HexString => {
    const multiplier = Math.pow(10, Number(selectedToken?.decimal || 0));
    const hexAmountValue = addHexPrefix(
      multiplyCurrencies(amount || 0, multiplier, {
        multiplicandBase: 10,
        multiplierBase: 10,
        toNumericBase: 'hex',
      })
    );
    return hexAmountValue;
  };

  const next = async () => {
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    const hexAmountValue = getHexAmount(amount);

    const type = isSupport1559
      ? TransactionEnvelopeTypes.FEE_MARKET
      : TransactionEnvelopeTypes.LEGACY;
    const params: Record<string, any> = {
      from: fromAccount?.address,
      value: TransactionEnvelopeTypes.LEGACY,
      isSend: true,
      type: type,
    };
    if (selectedToken?.isNative) {
      params.to = toAddress;
      params.value = hexAmountValue;
    } else {
      // erc-20 tokens
      params.to = selectedToken?.contractAddress;
      params.data = generateTokenTransferData({
        toAddress: toAddress,
        amount: hexAmountValue,
      });
    }
    params.txParam = {
      from: fromAccount?.address,
      to: toAddress,
      value: hexAmountValue,
      type: type,
      symbol: selectedToken?.symbol,
    };
    params.gas = draftTransaction.gas;
    params.txParam.gas = draftTransaction.gas;
    if (isSupport1559) {
      delete params.gasPrice;
    } else {
      delete params.maxFeePerGas;
      delete params.maxPriorityFeePerGas;
    }
    await wallet.addContactByDefaultName(toAddress);
    wallet.sendRequest({
      method: 'eth_sendTransaction',
      params: [params],
    });
    sensors.track('teleport_send_next', {
      page: location.pathname,
      from: params.txParam.from,
      to: params.txParam.to,
      symbol: params.txParam.symbol,
    });
    history.push('/confirm-transaction');
  };

  const myAccountsSelect = () => {
    setAccountSelectPopupVisible(true);
    sensors.track('teleport_send_tsf_my_account', { page: location.pathname });
  };

  const handleMaxClick = () => {
    const amountDecimal = denom2SymbolRatio(
      selectedToken?.amount || 0,
      selectedToken?.decimal || 0
    );
    /**
     * we do not need commas in the amount input field
     */
    const sanitizedAmount = removeCommas(amountDecimal);
    handleAmountChanged(sanitizedAmount);
  };

  const handleTokenSelect = (val) => {
    const selected = tokens.find((t: Token) => t.symbol === val);
    if (selected) {
      setSelectedToken(selected);
      dispatch(updateSendAsset(selected));
    }
  };

  const handleToAddressChanged = (val) => {
    setToAddress(val);
    if (isValidAddress(val)) {
      dispatch(updateRecipient({ address: val, nickname: '' }));
    }
  };

  const handleAmountChanged = (val) => {
    setAmount(val);
    const hexVal = getHexAmount(val);
    dispatch(updateSendAmount(hexVal));
  };

  const invalidate = () => {
    return (
      !isValidAddress(toAddress || '0x0') ||
      !amount ||
      !selectedToken ||
      isGasEstimateLoading ||
      (selectedToken.amount &&
        new BigNumber(
          utils.formatUnits(selectedToken?.amount, selectedToken?.decimal)
        ).lessThan(amount))
    );
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
            {`${denom2SymbolRatio(t?.amount || 0, t?.decimal || 0)}  `}
          </span>
        </div>
      ),
      selected: (
        <div className="assets-option flexR">
          <div className="assets-option-left flexR">
            <TokenIcon token={t} scale={0.8} />
            <span className="assets-option-symbol">{t.symbol}</span>
          </div>
        </div>
      ),
      value: t.symbol,
    };
  });

  return (
    <div
      className="send flexCol"
      onClick={() => {
        if (showToList) {
          /**
           * Clicks in the whole container will close
           * `to` selection list
           * for other onClick, use `e.stopPropagation()` to avoid this execution
           */
          setShowToList(false);
        }
      }}
    >
      <UnlockModal
        title="Unlock Wallet"
        visible={unlockPopupVisible}
        setVisible={(visible: boolean) => {
          setUnlockPopupVisible(visible);
        }}
        unlocked={() => next()}
      />
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
          stringMode
          onBlur={({ target: { value: v } }) => {
            console.debug(
              'InputNumber::Token?.decimal',
              selectedToken?.decimal
            );
            let parsedNumber = amount;
            try {
              const inputedNumber = new BigNumber(v);
              if (inputedNumber.gte(0)) {
                parsedNumber = inputedNumber.toFixed(
                  Number(selectedToken?.decimal) || 0
                );
              }
              console.debug('inputedNumber', inputedNumber);
            } catch (error) {
              console.error('input::Not a number: ', v);
            }
            handleAmountChanged(parsedNumber);
          }}
        />
        <div className="available-container flexR">
          Available:{' '}
          {denom2SymbolRatio(
            selectedToken?.amount || 0,
            selectedToken?.decimal || 0
          )}{' '}
          {selectedToken?.symbol?.toUpperCase()}{' '}
          <button onClick={handleMaxClick} className="max-icon">
            MAX
          </button>
        </div>
        <p className="send-form-title">{t('To')}</p>
        <Input
          placeholder={t('Enter Address')}
          value={toAddress}
          className="customInputStyle"
          onFocus={() => setShowToList(true)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleToAddressChanged(e.target.value)}
        />
        {showToList ? (
          <div className="recent">
            <div className="recent-title">{t('Recent Address')}</div>
            <div className="recent-body">
              {recentAddressList
                ?.filter((addr) => isValidAddress(addr))
                .map((addr) => (
                  <p
                    onClick={() => {
                      handleToAddressChanged(addr);
                      setShowToList(false);
                    }}
                    className="recent-item"
                    key={addr}
                  >
                    {transferAddress2Display(addr)}
                  </p>
                ))}
            </div>
          </div>
        ) : (
          <span className="tbmy" onClick={myAccountsSelect}>
            {t('Transfer between my accounts')}
          </span>
        )}

        <AccountSelect
          currentToAddress={toAddress}
          visible={accountSelectPopupVisible}
          onClose={(selected?: BaseAccount) => {
            if (selected) {
              setSelected(selected);
              handleToAddressChanged(selected.address);
              setShowToList(false);
            }
            setAccountSelectPopupVisible(false);
          }}
        />
        <div className="button-container send-btn-con">
          <div className="button-inner">
            <div className="gas-limit-container flexR">
              <div className="gas-limit-title">Estimated Gas Limit:</div>
              {isGasEstimateLoading ? (
                <Spin size="small" />
              ) : (
                <div className="gas-limit-value">
                  {Number(draftTransaction.gas)}
                </div>
              )}
            </div>
            <CustomButton
              type="primary"
              disabled={invalidate()}
              onClick={next}
              cls="theme"
              block
            >
              {t('Next')}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Send;
