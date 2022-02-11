import React from 'react';
import { useDispatch } from 'react-redux';
import { SET_CUSTOM_DATA, SET_CUSTOM_TYPE } from 'ui/reducer/gas.reducer';
import './customFee.less';
import { Form, Button, InputNumber } from 'antd';

function CustomFee(props) {
  // const gasReducer = useSelector((state) => state.gas);
  const { onSubmit } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const onFinish = (data) => {
    console.log(data);
    dispatch({ type: SET_CUSTOM_TYPE, value: true });
    dispatch({ type: SET_CUSTOM_DATA, value: data });
    onSubmit();
  };
  return (
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
          tooltip="Gas limit must be at least 21000"
        >
          <div className="numeric-input">
            <input type="number" min="21000"></input>
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
            <input type="number" min="0"></input>
            <span className="addon">$1.1</span>
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
            <input type="number" min="0"></input>
            <span className="addon">$1.1</span>
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
