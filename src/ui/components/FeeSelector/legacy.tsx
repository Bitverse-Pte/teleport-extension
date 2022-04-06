import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { SET_LEGACY_GAS, SET_GAS_TYPE } from 'ui/reducer/gas.reducer';
import './legacy.less';
import { Form, Button, Drawer } from 'antd';

import { Token } from 'types/token';
import { useWallet } from 'ui/utils';
import './feeSelector.less';
import { IconComponent } from 'ui/components/IconComponents';
import { useLocation } from 'react-router-dom';
import skynet from 'utils/skynet';

const { sensors } = skynet;

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

function FeeSelectorLegacy(props) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { visible, onClose, gasLimit = 21000 } = props;
  const wallet = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [prices, setPrices] = useState();
  const [gasPrice, setGasPrice] = useState();

  const [form] = Form.useForm();
  const onFinish = (data) => {
    const _v = {
      gasLimit: data.gasLimit || gasLimit,
      gasPrice: data.gasPrice || gasPrice,
    };
    dispatch({
      type: SET_LEGACY_GAS,
      value: _v,
    });
    dispatch({ type: SET_GAS_TYPE, value: 'custom' });
    onClose();
  };
  const fetchGasFeeEstimates = async () => {
    const res = await wallet.fetchGasFeeEstimates();
    const gasPrice = res.gasFeeEstimates.gasPrice;
    setGasPrice(gasPrice);
  };
  const fetchNativePrice = async () => {
    const tokens = await wallet.getTokenBalancesAsync(true);
    const prices = await wallet.queryTokenPrices();
    if (prices) setPrices(prices);
    if (tokens) setTokens(tokens);
  };
  useEffect(() => {
    fetchGasFeeEstimates();
    fetchNativePrice();
  }, []);
  return (
    <Drawer
      placement="bottom"
      height="350px"
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

      <div className="custom-fee">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
        >
          <Form.Item
            required
            label="Gas Limit"
            name="gasLimit"
            className="gas-form"
            tooltip="Gas limit is the maximum units of gas you are willing to use. Units of gas are a multiplier to “Max priority fee” and “Max fee”."
          >
            <div className="numeric-input">
              <input type="number" min="21000" defaultValue={gasLimit}></input>
            </div>
          </Form.Item>
          <Form.Item
            required
            label="Gas Price"
            name="gasPrice"
            className="gas-form"
            tooltip="This network requires a “Gas price” field when submitting a transaction. Gas price is the amount you will pay pay per unit of gas."
          >
            <div className="numeric-input">
              <input
                type="number"
                defaultValue={gasPrice}
                min="0"
                step="1e-18"
              ></input>
              {/* <span className="addon">$...</span> */}
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="save-gas-btn">
              Confirm
            </Button>
          </Form.Item>
        </Form>
      </div>
      {/* <div className="gas-fee-bottom">
        <Button type="primary" block className="gas-fee-btn">
          Confirm
        </Button>
      </div> */}
    </Drawer>
  );
}

export default FeeSelectorLegacy;
