import React, { useState, createContext } from 'react';
import { Input, InputNumber, Select, Tooltip } from 'antd';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { IconComponent } from 'ui/components/IconComponents';
import { getUnit10ByAddress } from 'background/utils';
import {
  useWallet,
  useAsyncEffect,
  denom2SymbolRatio,
  removeCommas,
  useDebounce,
} from 'ui/utils';
import { transferAddress2Display } from 'ui/utils';
import { IDisplayAccountInfo } from 'ui/components/AccountSwitch';
import AccountSelect from 'ui/components/AccountSelect';
import { BaseAccount } from 'types/extend';
import { Token } from 'types/token';
// import { generateTokenTransferData } from 'ui/context/send.utils';
import { CustomButton, TokenIcon, WalletName } from 'ui/components/Widgets';
import GeneralHeader from 'ui/components/Header/GeneralHeader';
import './style.less';
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentChainId } from 'ui/selectors/selectors';
import { UnlockModal } from 'ui/components/UnlockModal';
import skynet from 'utils/skynet';
import { Bech32Address } from '@keplr-wallet/cosmos';
import { getProvider } from 'ui/selectors/selectors';
import { Provider } from 'types/network';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import { createInstance } from 'dotbit';
import { IDas } from '../Send';
import { PresetNetworkId } from 'constants/defaultNetwork';

const { sensors } = skynet;
const dotbit = createInstance();

export const AccountSelectContext = createContext<{
  selected?: IDisplayAccountInfo;
  setSelected?: (select: IDisplayAccountInfo) => void;
} | null>(null);

const { Option } = Select;

const Send = () => {
  const { isDarkMode } = useDarkmode();
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
  const [memo, setMemo] = useState<string>();
  const [showToList, setShowToList] = useState<boolean>(false);
  const [balance, setBalance] = useState<Token[]>([]);
  const [accountSelectPopupVisible, setAccountSelectPopupVisible] =
    useState<boolean>(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token>();
  const [recentAddressList, setRecentAddressList] = useState<string[]>();
  const [unlockPopupVisible, setUnlockPopupVisible] = useState(false);
  const [toConfirmAddress, setConfirmToAddress] = useState<string>('');
  const [dasListShow, setDasListShow] = useState<boolean>(false);
  const [dasTagShow, setDasTagShow] = useState<boolean>(false);
  const [dasErrorShow, setDasErrorShow] = useState<boolean>(false);
  const [dasAccount, setDasAccount] = useState('');
  const [dasAddresses, setDasAddresses] = useState<IDas[]>([]);

  const chainId = useSelector(getCurrentChainId);
  const draftTransaction = useSelector(
    (state) => state.send.draftTransaction.txParams
  );
  const isSupport1559 = useSelector((state) => state.send.eip1559support);
  console.debug('isSupport1559: ', isSupport1559);
  const currentChain: Provider = useSelector(getProvider);

  // const cleanup = useCallback(() => {
  //   dispatch(resetSendState());
  // }, [dispatch]);

  const isValidAddress = (recipient) => {
    const prefix = currentChain.prefix;
    let bech32Prefix = '';
    if (typeof prefix !== 'string') {
      bech32Prefix = prefix.bech32PrefixAccAddr;
    }
    try {
      Bech32Address.validate(recipient, bech32Prefix);
      return true;
    } catch (e) {
      // console.error(e);
      return false;
    }
  };

  // useEffect(() => {
  //   if (chainId !== undefined) {
  //     dispatch(initializeSendState({ assetId: tokenId }));
  //   }
  // }, [chainId, dispatch, cleanup]);

  // useEffect(() => {
  //   return () => {
  //     dispatch(resetSendState());
  //   };
  // }, [dispatch, cleanup]);

  useAsyncEffect(async () => {
    const current: BaseAccount | undefined = await wallet.getCurrentAccount();
    current && setFromAccount(current);
    const tokenBalances = await wallet.getTokenBalancesAsync();
    tokenBalances && setBalance(tokenBalances);
  }, []);

  useAsyncEffect(async () => {
    const balances = await wallet.getTokenBalancesAsync().catch((e) => {
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
    const balances = await wallet.getTokenBalancesSync().catch((e) => {
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
    const list = await wallet.listContactsByChain();
    const recentAddress = list.map((item) => {
      return item.address;
    });
    setRecentAddressList(recentAddress);
  }, []);

  // const getHexAmount = (amount: string): HexString => {
  //   const multiplier = Math.pow(10, Number(selectedToken?.decimal || 0));
  //   const hexAmountValue = addHexPrefix(
  //     multiplyCurrencies(amount || 0, multiplier, {
  //       multiplicandBase: 10,
  //       multiplierBase: 10,
  //       toNumericBase: 'hex',
  //     })
  //   );
  //   return hexAmountValue;
  // };

  const next = async () => {
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    await wallet.addContactByDefaultName(toConfirmAddress);
    history.push({
      pathname: '/confirm-send-cos',
      state: {
        amount,
        recipient: toConfirmAddress,
        memo,
        token: selectedToken,
      },
    });
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
      // dispatch(updateSendAsset(selected));
    }
  };

  const handleToAddressChanged = (val) => {
    if (val) {
      setShowToList(false);
    } else {
      setShowToList(true);
    }
    setToAddress(val);
    if (val.endsWith('.bit')) {
      debounceFunc(val);
      setDasAccount(val);
    } else {
      setConfirmToAddress(val);
      setDasAddresses([]);
      setDasListShow(false);
      setDasTagShow(false);
      setDasErrorShow(false);
    }
    // if (isValidAddress(val)) {
    //   dispatch(updateRecipient({ address: val, nickname: '' }));
    // }
  };

  const debounceFunc = useDebounce(async (val) => {
    let coinType = '-1';
    if (currentChain.id === PresetNetworkId.COSMOS_HUB) {
      coinType = '118';
    }
    const accounts = await dotbit.addrs(val, coinType).catch((e) => {
      console.error(e);
      setDasErrorShow(true);
    });
    if (accounts && accounts.length > 0) {
      const dasList = accounts.filter((d: IDas) => d.type === 'address');
      console.log(dasList);
      if (dasList?.length > 0) {
        setDasAddresses(dasList as any);
        setConfirmToAddress(dasList[0].value);
        setDasListShow(true);
        setDasTagShow(true);
        setDasErrorShow(false);
      } else {
        setDasErrorShow(true);
      }
    } else {
      setDasErrorShow(true);
    }
  }, 1500);

  const handleAmountChanged = (val) => {
    setAmount(val);
    // const hexVal = getHexAmount(val);
    // dispatch(updateSendAmount(hexVal));
  };

  const invalidate = () => {
    return (
      !isValidAddress(toConfirmAddress) ||
      !amount ||
      Number(amount) <= 0 ||
      !selectedToken ||
      (selectedToken.amount &&
        new BigNumber(
          utils.formatUnits(selectedToken?.amount, selectedToken?.decimal)
        ).lessThan(amount))
    );
  };

  const dasConfirmAddress = () => {
    return dasTagShow ? (
      <div className="das-input-suffix flexR">
        {toConfirmAddress && (
          <span className="das-input-suffix-address">
            {`${(toConfirmAddress as any).substr(0, 4)}...${(
              toConfirmAddress as any
            ).substr(-4)}`}
          </span>
        )}
        <span
          className="das-input-suffix-tag cursor"
          onClick={() => {
            setDasListShow((pre) => !pre);
          }}
        >
          DAS
        </span>
      </div>
    ) : (
      <span />
    );
  };

  const handleDasClick = (value) => {
    setConfirmToAddress(value.value);
    setDasListShow(false);
  };

  const addonSymbol = (
    <div className="addonSymbol">{selectedToken?.symbol?.toUpperCase()}</div>
  );

  const assetsOptions = tokens.map((t: Token) => {
    let ibcChainInfoStr = '';
    if (t.chainName && (t.trace?.trace as any).length > 0) {
      const trace = (t as any).trace.trace[(t as any).trace.trace.length - 1];
      if (trace) {
        ibcChainInfoStr = `(${t.chainName.toUpperCase()}/${trace.channelId.toUpperCase()})`;
      }
    }
    return {
      label: (
        <div
          className={clsx('flexR assets-option-cos-wrapper', {
            dark: isDarkMode,
          })}
        >
          <TokenIcon token={t} scale={0.8} />
          <div className="assets-option flexR flex-wrap">
            <div className="assets-option-left flexR">
              <span className="assets-option-symbol">{t.symbol}</span>
              {ibcChainInfoStr ? ibcChainInfoStr : null}
            </div>
            <span className="assets-option-right">
              {`${denom2SymbolRatio(t?.amount || 0, t?.decimal || 0)}  `}
            </span>
          </div>
        </div>
      ),
      selected: (
        <div className="assets-option assets-option-selected flexR">
          <div className="assets-option-left flexR">
            <TokenIcon token={t} scale={0.8} />
            <span className="assets-option-symbol left-10">{t.symbol}</span>
            {ibcChainInfoStr ? ibcChainInfoStr : null}
          </div>
        </div>
      ),
      value: t.symbol,
    };
  });

  return (
    <div
      className={clsx('send-cos flexCol', {
        dark: isDarkMode,
      })}
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
              seed={getUnit10ByAddress(fromAccount?.address)}
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
          dropdownClassName={clsx('send-dropdown', { dark: isDarkMode })}
          value={selectedToken?.symbol}
          onChange={handleTokenSelect}
          optionLabelProp="selected"
          options={assetsOptions}
          suffixIcon={<IconComponent name="chevron-down" cls="chevron-down" />}
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
        <p className="send-form-title">{t('Memo')}(Optional)</p>
        <Input
          placeholder={t('Enter memo')}
          value={memo}
          className="customInputStyle"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setMemo(e.target.value)}
        />
        <p className="send-form-title">{t('To')}</p>
        <Input
          placeholder={t('Enter Address')}
          value={toAddress}
          className="customInputStyle"
          onFocus={(e) => {
            if (!e.target.value) {
              setShowToList(true);
            }
          }}
          suffix={dasConfirmAddress()}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleToAddressChanged(e.target.value)}
        />
        {dasListShow && (
          <div className="das flexCol">
            <span className="das-account">{dasAccount}</span>
            <div className="das-accounts-wrap">
              {dasAddresses.map((das: IDas, i) => {
                return (
                  <div
                    className="das-address-container flexR cursor"
                    key={i}
                    onClick={() => handleDasClick(das)}
                  >
                    <Tooltip placement="top" title={das.value || ''}>
                      <span className="das-address">
                        {`${(das.value as any).substr(0, 6)}...${(
                          das.value as any
                        ).substr(-4)}`}
                      </span>
                    </Tooltip>
                    <span
                      className={`das-tag ellipsis ${!das.label && 'none'}`}
                      style={!das.label ? { display: 'none' } : {}}
                    >
                      {das.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
          !dasErrorShow &&
          dasAddresses.length === 0 && (
            <p className="tbmy" onClick={myAccountsSelect}>
              {t('Transfer between my accounts')}
            </p>
          )
        )}
        {dasErrorShow ? (
          <p className="send-das-error-notice">
            No address has been set for this name
          </p>
        ) : null}
        <AccountSelect
          currentToAddress={toConfirmAddress}
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
