import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  SET_GAS_TYPE,
  SET_CUSTOM_TYPE,
  SET_COSMOS_CUSTOM_GAS,
} from 'ui/reducer/gas.reducer';
import { Button, Drawer, Collapse, Form } from 'antd';
import { Token } from 'types/token';
// import FeeItem from './feeItem';
// import CustomFee from 'ui/components/CustomFee';
import { useWallet } from 'ui/utils';
import './feeSelector.less';
import './feeItem.less';
import './cosmos.less';
import { IconComponent } from 'ui/components/IconComponents';
import { useLocation } from 'react-router-dom';
import skynet from 'utils/skynet';
import clsx from 'clsx';
import { useDarkmode } from 'ui/hooks/useDarkMode';
const { sensors } = skynet;
interface Fee {
  type: string;
  gas: string;
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
const type2title = {
  high: 'FAST',
  medium: 'MEDIUM',
  low: 'LOW',
  suggest: 'SITE SUGGESTS',
  custom: 'CUSTOM',
};
function FeeItem({ gas, selected, onSelect, type }) {
  return (
    <li
      className={`fee-selector-item ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(type)}
    >
      <div className="fee-selector-item-tail"></div>
      <div className="fee-selector-item-head"></div>
      <div className={`fee-selector-item-content fee-${type}`}>
        <div className="fee-selector-item-content-left">
          <div className="fee-selector-item-content-left-title">
            {type2title[type]}
          </div>
        </div>
        <div className="fee-selector-item-content-right">
          <div className="fee-selector-item-content-right-title">
            {gas ? gas : '-'}
          </div>
          <div className="fee-selector-item-content-right-subtitle">-</div>
        </div>
      </div>
    </li>
  );
}

function FeeSelector(props) {
  const { isDarkMode } = useDarkmode();
  const location = useLocation();
  const gasState: any = useSelector((state) => state.gas);
  const dispatch = useDispatch();
  const {
    visible,
    onClose,
    currency,
    customGas: customStdGas,
    chainId,
  } = props;
  const wallet = useWallet();
  const [selectFee, setSelectFee] = useState('medium');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [prices, setPrices] = useState();
  const [customVisible, setCustomVisible] = useState(false);
  const [customGas, setCustomGas] = useState('0');
  // const [baseFee, setBaseFee] = useState(0);
  const [feeList, setFeeList] = useState<Fee[]>([]);
  const onSelect = (type) => {
    dispatch({ type: SET_CUSTOM_TYPE, value: true });
    setSelectFee(type);
  };
  const fetchStdFee = async () => {
    let gas = '0';
    if (customStdGas) {
      gas = customStdGas.gas || customStdGas.gasLimit;
    } else {
      const stdFee = await wallet.getCosmosStdFee('low', currency);
      gas = stdFee.gas;
    }
    setCustomGas(gas);
  };
  const fetchSelectFee = async () => {
    if (customStdGas) {
      const c = customStdGas.gas || customStdGas.gasLimit;
      const amount = customStdGas?.amount[0]?.amount;
      const l = await wallet.getCosmosFeeTypePrimitive(
        'low',
        currency,
        c,
        chainId
      );
      const a = await wallet.getCosmosFeeTypePrimitive(
        'average',
        currency,
        c,
        chainId
      );
      const h = await wallet.getCosmosFeeTypePrimitive(
        'high',
        currency,
        c,
        chainId
      );
      switch (amount) {
        case l.amount:
          setSelectFee('low');
          break;
        case a.amount:
          setSelectFee('medium');
          break;
        case h.amount:
          setSelectFee('high');
          break;
      }
    }
  };
  useEffect(() => {
    fetchStdFee();
    fetchSelectFee();
  }, []);
  const fetchGasFeeEstimates = async () => {
    const cGas = Number(customGas);
    let lowFee = '0';
    let aveFee = '0';
    let highFee = '0';
    if (cGas > 0) {
      lowFee = await wallet.getCosmosFeeTypePretty(
        'low',
        currency,
        cGas,
        chainId
      );
      aveFee = await wallet.getCosmosFeeTypePretty(
        'average',
        currency,
        cGas,
        chainId
      );
      highFee = await wallet.getCosmosFeeTypePretty(
        'high',
        currency,
        cGas,
        chainId
      );
    } else {
      lowFee = await wallet.getCosmosFeeTypePretty(
        'low',
        currency,
        undefined,
        chainId
      );
      aveFee = await wallet.getCosmosFeeTypePretty(
        'average',
        currency,
        undefined,
        chainId
      );
      highFee = await wallet.getCosmosFeeTypePretty(
        'high',
        currency,
        undefined,
        chainId
      );
    }
    setFeeList([
      { type: 'high', gas: highFee },
      { type: 'medium', gas: aveFee },
      { type: 'low', gas: lowFee },
    ]);
  };
  useEffect(() => {
    fetchGasFeeEstimates();
  }, [customGas]);
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
  // const getCustomGasPrice = (maxPriorityFee, maxFee): number => {
  //   maxPriorityFee = Number(maxPriorityFee);
  //   maxFee = Number(maxFee);
  //   return Math.min(maxPriorityFee + baseFee, maxFee);
  // };
  const onSaveCustom = (e) => {
    const value = e.target.value;
    setCustomGas(value);
    sensors.track('teleport_gas_edit_save_custom', { page: location.pathname });
  };
  const onConfirm = () => {
    const cGas = Number(customGas);
    if (cGas > 0) {
      dispatch({ type: SET_CUSTOM_TYPE, value: true });
      dispatch({ type: SET_COSMOS_CUSTOM_GAS, value: cGas });
    } else {
      dispatch({ type: SET_CUSTOM_TYPE, value: false });
    }
    dispatch({ type: SET_GAS_TYPE, value: selectFee });
    setCustomVisible(false);
    onClose();
    sensors.track('teleport_gas_edit_confirmed', { page: location.pathname });
  };
  useEffect(() => {
    fetchNativePrice();
  }, []);
  // useEffect(() => {
  //   if (gasState.customType) {
  //     } else {
  //     }
  //   }
  // }, [gasState.cosmosCustomGas]);
  return (
    <Drawer
      className={clsx('fee', {
        dark: isDarkMode,
      })}
      placement="bottom"
      height="500px"
      size="large"
      visible={visible}
      closable={false}
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
              gas={item.gas}
              type={item.type}
              selected={item?.type === selectFee}
              onSelect={onSelect}
            />
          ))}
        </ul>
        {!props.disableCustomGasFee && (
          <div className="tel-collapse-box">
            <Collapse className="tel-collapse">
              <Collapse.Panel
                header="Customize Gas Fee"
                key={1}
                className="tel-collapse-panel"
              >
                <div className="cosmos-custom-fee">
                  <Form
                    layout="vertical"
                    onFinish={() => {
                      console.log('onFinish');
                    }}
                    requiredMark="optional"
                  >
                    <Form.Item
                      required
                      label="Gas"
                      name="gas"
                      className="gas-form"
                    >
                      <div className="numeric-input">
                        <input
                          type="number"
                          min="0"
                          step="1e-18"
                          defaultValue={customGas}
                          onChange={(e) => {
                            onSaveCustom(e);
                          }}
                        ></input>
                      </div>
                    </Form.Item>
                  </Form>
                </div>
              </Collapse.Panel>
            </Collapse>
          </div>
        )}
      </div>
      <div className="gas-fee-bottom">
        <Button
          type="primary"
          block
          className="gas-fee-btn"
          onClick={onConfirm}
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
        className="fee"
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
        {/* <CustomFee
          selectFee={feeList.filter((e) => e.type === selectFee)[0]}
          gasLimit={gasLimit}
          onSubmit={onSaveCustom}
          maxFeePerGas={maxFeePerGas}
          maxPriorityFeePerGas={maxPriorityFeePerGas}
        /> */}
      </Drawer>
    </Drawer>
  );
}

export default FeeSelector;
