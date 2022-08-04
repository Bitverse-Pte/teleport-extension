import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { SET_CUSTOM_DATA, SET_CUSTOM_TYPE } from 'ui/reducer/gas.reducer';
import './customFee.less';
import { Form, Button } from 'antd';
import { hexWEIToDecGWEI } from '../../../utils/conversion';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';

function CustomFee(props) {
  const { isDarkMode } = useDarkmode();
  const {
    onSubmit,
    selectFee: { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas },
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas,
  } = props;
  const [gl, setGl] = useState(gasLimit);
  const [mf, setMf] = useState(suggestedMaxFeePerGas);
  const [mp, setMp] = useState(suggestedMaxPriorityFeePerGas);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const onFinish = () => {
    dispatch({ type: SET_CUSTOM_TYPE, value: true });
    dispatch({
      type: SET_CUSTOM_DATA,
      value: {
        gasLimit: gl,
        suggestedMaxPriorityFeePerGas: mp,
        suggestedMaxFeePerGas: mf,
      },
    });
    onSubmit();
  };
  useEffect(() => {
    setGl(gasLimit);
    if (maxFeePerGas) {
      setMf(hexWEIToDecGWEI(maxFeePerGas));
    } else {
      setMf(suggestedMaxFeePerGas);
    }
    if (maxPriorityFeePerGas) {
      setMp(hexWEIToDecGWEI(maxPriorityFeePerGas));
    } else {
      setMp(suggestedMaxPriorityFeePerGas);
    }
  }, [gasLimit, suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas]);
  return (
    <div className={clsx('custom-fee', { dark: isDarkMode })}>
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
        >
          <div className="numeric-input">
            <input
              type="number"
              min="0"
              value={gl}
              onChange={(e) => {
                setGl(e.target.value);
              }}
            ></input>
          </div>
        </Form.Item>
        <Form.Item
          required
          label="Max priority fee (GWEI)"
          name="maxPriorityFee"
          className="gas-form"
          tooltip="Max priority fee must be greater than 0 GWEI"
        >
          <div className="numeric-input">
            <input
              type="number"
              min="0"
              step="1e-18"
              value={mp}
              onChange={(e) => {
                setMp(e.target.value);
              }}
            ></input>
          </div>
        </Form.Item>
        <Form.Item
          required
          label="Max fee (GWEI)"
          name="maxFee"
          className="gas-form"
          tooltip="Max fee cannot be lower than max priority fee"
        >
          <div className="numeric-input">
            <input
              type="number"
              min="0"
              step="1e-18"
              value={mf}
              onChange={(e) => {
                setMf(e.target.value);
              }}
            ></input>
            {/* <span className="addon">$1.1</span> */}
          </div>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="save-gas-btn">
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default CustomFee;
