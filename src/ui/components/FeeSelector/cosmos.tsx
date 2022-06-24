import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SET_GAS_TYPE, SET_CUSTOM_TYPE } from 'ui/reducer/gas.reducer';
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
  const location = useLocation();
  const gasState: any = useSelector((state) => state.gas);
  const dispatch = useDispatch();
  const { visible, onClose, currency } = props;
  const wallet = useWallet();
  const [selectFee, setSelectFee] = useState('medium');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [prices, setPrices] = useState();
  const [customVisible, setCustomVisible] = useState(false);
  // const [baseFee, setBaseFee] = useState(0);
  const [feeList, setFeeList] = useState<Fee[]>([]);
  const onSelect = (type) => {
    dispatch({ type: SET_CUSTOM_TYPE, value: true });
    setSelectFee(type);
  };
  const fetchGasFeeEstimates = async () => {
    const lowFee = await wallet.getCosmosFeeTypePretty('low', currency);
    const averageFee = await wallet.getCosmosFeeTypePretty('average', currency);
    const highFee = await wallet.getCosmosFeeTypePretty('high', currency);
    setFeeList([
      {
        type: 'high',
        gas: highFee,
      },
      {
        type: 'medium',
        gas: averageFee,
      },
      {
        type: 'low',
        gas: lowFee,
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
  // const getCustomGasPrice = (maxPriorityFee, maxFee): number => {
  //   maxPriorityFee = Number(maxPriorityFee);
  //   maxFee = Number(maxFee);
  //   return Math.min(maxPriorityFee + baseFee, maxFee);
  // };
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
  // useEffect(() => {
  //   if (gasState.customType) {
  //     const {
  //       customData: {
  //         gasLimit,
  //         suggestedMaxPriorityFeePerGas: maxPriorityFee,
  //         suggestedMaxFeePerGas: maxFee,
  //       },
  //     } = gasState;
  //     const gasPrice = getCustomGasPrice(maxPriorityFee, maxFee);
  //     let customItem: any = null;
  //     for (const item of feeList) {
  //       if (item.type === 'custom') {
  //         customItem = item;
  //       }
  //     }
  //     if (customItem === null) {
  //       setFeeList([
  //         ...feeList.filter((f) => f.type !== 'custom'),
  //         {
  //           type: 'custom',
  //           time: 30,
  //           gasPrice,
  //           gasLimit: Number(gasLimit),
  //           suggestedMaxPriorityFeePerGas: maxPriorityFee,
  //           suggestedMaxFeePerGas: maxFee,
  //         },
  //       ]);
  //     } else {
  //       customItem.gasPrice = gasPrice;
  //       customItem.gasLimit = Number(gasLimit);
  //       setFeeList(feeList);
  //     }
  //   }
  // }, [gasState.customData]);
  return (
    <Drawer
      placement="bottom"
      height="500px"
      size="large"
      visible={visible}
      closable={false}
      className="fee"
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
      <div className="fee-box">
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
          // <div
          //   className="custom-box"
          //   onClick={() => {
          //     setCustomVisible(true);
          //     sensors.track('teleport_gas_edit_customize', {
          //       page: location.pathname,
          //     });
          //   }}
          // >
          //   <span>Custom Gas Fee</span>
          //   <IconComponent name="chevron-right" cls="base-text-color" />
          // </div>
          <div className="tel-collapse-box">
            <Collapse className="tel-collapse">
              <Collapse.Panel
                header="Custom Gas Fee"
                key={1}
                className="tel-collapse-panel"
              >
                <div className="custom-fee">
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
                        <input type="number"></input>
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
          title="Custom Gas Fee"
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
