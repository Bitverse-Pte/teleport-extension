import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SET_GAS_TYPE, SET_CUSTOM_TYPE } from 'ui/reducer/gas.reducer';
import { Button, Drawer } from 'antd';
import { Token } from 'types/token';
import FeeItem from './feeItem';
import CustomFee from 'ui/components/CustomFee';
import { useWallet } from 'ui/utils';
import './feeSelector.less';
import { IconComponent } from 'ui/components/IconComponents';
import { useLocation } from 'react-router-dom';
import skynet from 'utils/skynet';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
import { addHexPrefix } from 'ethereumjs-util';
import { decGWEIToHexWEI } from 'ui/utils/conversion';
const { sensors } = skynet;
interface Fee {
  type: string;
  time: number;
  gasPrice: number;
  gasLimit?: number;

  suggestedMaxPriorityFeePerGas: string;
  suggestedMaxFeePerGas: string;
}
interface DrawerHeaderProps {
  title: string;
  type?: number;
  handleCloseIconClick: () => void;
}

const DrawerHeader = (props: DrawerHeaderProps) => {
  const { type = 1 } = props;
  return (
    <div className={`drawer-header-container flexR drawer-header-type${type}`}>
      <span className="drawer-header-title">{props.title}</span>
      <IconComponent
        name={type === 1 ? 'close' : 'back'}
        onClick={props.handleCloseIconClick}
        cls="drawer-header-close-icon"
      />
    </div>
  );
};
function FeeSelector(props) {
  const { isDarkMode } = useDarkmode();
  const location = useLocation();
  const gasState: any = useSelector((state) => state.gas);
  const dispatch = useDispatch();
  const {
    visible,
    onClose,
    gasLimit = 21000,
    maxFeePerGas,
    maxPriorityFeePerGas,
  } = props;
  const [customMFPG, setCustomMFPG] = useState(maxFeePerGas);
  const [customMPFPG, setCustomMPFPG] = useState(maxPriorityFeePerGas);
  const wallet = useWallet();
  const [selectFee, setSelectFee] = useState('medium');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [prices, setPrices] = useState();
  const [customVisible, setCustomVisible] = useState(false);
  const [baseFee, setBaseFee] = useState(0);
  const [feeList, setFeeList] = useState<Fee[]>([]);
  const onSelect = (type) => {
    dispatch({ type: SET_CUSTOM_TYPE, value: true });
    setSelectFee(type);
    // update custom fee selector values
    const selectFee = feeList.filter((item) => item.type === type)[0];
    const _mpfg = addHexPrefix(
      decGWEIToHexWEI(selectFee?.suggestedMaxFeePerGas).toString()
    );
    const _mpfpg = addHexPrefix(
      decGWEIToHexWEI(selectFee?.suggestedMaxPriorityFeePerGas).toString()
    );
    setCustomMFPG(_mpfg);
    setCustomMPFPG(_mpfpg);
  };
  const fetchGasFeeEstimates = async () => {
    const res = await wallet.fetchGasFeeEstimates();
    const { estimatedBaseFee, high, low, medium } = res.gasFeeEstimates;
    setBaseFee(Number(estimatedBaseFee || 0));
    setFeeList([
      {
        type: 'high',
        gasPrice: Number(high?.suggestedMaxFeePerGas || 0),
        time: 30,
        ...high,
      },
      {
        type: 'medium',
        gasPrice: Number(medium?.suggestedMaxFeePerGas),
        time: 30,
        ...medium,
      },
      {
        type: 'low',
        gasPrice: Number(low?.suggestedMaxFeePerGas),
        time: 30,
        ...low,
      },
    ]);
  };
  const fetchNativePrice = async () => {
    const tokens = await wallet.getTokenBalancesAsync();
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
  const getCustomGasPrice = (maxPriorityFee, maxFee): number => {
    maxPriorityFee = Number(maxPriorityFee);
    maxFee = Number(maxFee);
    return Math.min(maxPriorityFee + baseFee, maxFee);
  };
  const onSaveCustom = () => {
    setCustomVisible(false);
    setSelectFee('custom');
    sensors.track('teleport_gas_edit_save_custom', { page: location.pathname });
  };
  const setGasType = () => {
    dispatch({ type: SET_GAS_TYPE, value: selectFee });
    setCustomVisible(false);
    onClose();
    sensors.track('teleport_gas_edit_confirmed', { page: location.pathname });
  };
  useEffect(() => {
    fetchGasFeeEstimates();
    fetchNativePrice();
  }, []);
  useEffect(() => {
    if (gasState.customType) {
      const {
        customData: {
          gasLimit,
          suggestedMaxPriorityFeePerGas: maxPriorityFee,
          suggestedMaxFeePerGas: maxFee,
        },
      } = gasState;
      const gasPrice = getCustomGasPrice(maxPriorityFee, maxFee);
      let customItem: any = null;
      for (const item of feeList) {
        if (item.type === 'custom') {
          customItem = item;
        }
      }
      if (customItem === null) {
        setFeeList([
          ...feeList.filter((f) => f.type !== 'custom'),
          {
            type: 'custom',
            time: 30,
            gasPrice,
            gasLimit: Number(gasLimit),
            suggestedMaxPriorityFeePerGas: maxPriorityFee,
            suggestedMaxFeePerGas: maxFee,
          },
        ]);
      } else {
        customItem.gasPrice = gasPrice;
        customItem.gasLimit = Number(gasLimit);
        setFeeList(feeList);
      }
    }
  }, [gasState.customData]);
  return (
    <Drawer
      placement="bottom"
      height="500px"
      size="large"
      visible={visible}
      closable={false}
      className={clsx('fee', {
        dark: isDarkMode,
      })}
      bodyStyle={{
        boxSizing: 'border-box',
        padding: '0',
      }}
      contentWrapperStyle={{
        borderRadius: '16px 16px 0 0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      key="top"
    >
      <DrawerHeader
        title="Edit Gas Fee"
        handleCloseIconClick={() => onClose()}
      />
      <div
        className={clsx('fee-box', {
          dark: isDarkMode,
        })}
      >
        <ul className="fee-selector">
          {feeList.map((item, index) => (
            <FeeItem
              key={index}
              params={{
                gasLimit,
                price: nativeToken?.price || 0,
                symbol: nativeToken?.symbol,
                ...item,
              }}
              selected={item?.type === selectFee}
              onSelect={onSelect}
              maxFeePerGas={item.suggestedMaxFeePerGas}
              maxPriorityFeePerGas={item.suggestedMaxPriorityFeePerGas}
            />
          ))}
        </ul>
        {!props.disableCustomGasFee && (
          <div
            className="custom-box"
            onClick={() => {
              setCustomVisible(true);
              sensors.track('teleport_gas_edit_customize', {
                page: location.pathname,
              });
            }}
          >
            <span>Customize Gas Fee</span>
            <IconComponent
              name="chevron-right"
              cls="base-text-color right-icon"
            />
          </div>
        )}
      </div>
      <div className="gas-fee-bottom">
        <Button
          type="primary"
          block
          className="gas-fee-btn"
          onClick={setGasType}
        >
          Confirm
        </Button>
      </div>
      <Drawer
        placement="bottom"
        height="500px"
        size="large"
        visible={customVisible}
        closable={false}
        className={clsx('custom-fee-box', {
          dark: isDarkMode,
        })}
        bodyStyle={{
          boxSizing: 'border-box',
          padding: '0 20px 20px',
        }}
        contentWrapperStyle={{
          borderRadius: '16px 16px 0 0',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        key="top2"
      >
        <DrawerHeader
          title="Customize Gas Fee"
          type={2}
          handleCloseIconClick={() => setCustomVisible(false)}
        />
        <CustomFee
          selectFee={feeList.filter((e) => e.type === selectFee)[0]}
          gasLimit={gasLimit}
          onSubmit={onSaveCustom}
          maxFeePerGas={customMFPG}
          maxPriorityFeePerGas={customMPFPG}
        />
      </Drawer>
    </Drawer>
  );
}

export default FeeSelector;
