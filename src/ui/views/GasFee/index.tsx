import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'antd';
import FeeSelector from 'ui/components/FeeSelector';
// import './style.less';

function Fee() {
  const gasState: any = useSelector((state) => state.gas);
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <Button type="primary" block onClick={() => setVisible(true)}>
        show
      </Button>
      {/* <FeeSelector visible={visible} onClose={() => setVisible(false)} /> */}
      <div>{gasState.gasType}</div>
    </div>
  );
}

export default Fee;
