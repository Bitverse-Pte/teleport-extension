import React from 'react';
import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Spin, SpinProps as AntdSpinProps } from 'antd';
import { useWallet, getUiType, useApproval } from 'ui/utils';

const SortHat = () => {
  const [to, setTo] = useState('');
  const wallet = useWallet();
  // eslint-disable-next-line prefer-const
  let [getApproval, , rejectApproval] = useApproval();

  const loadView = async () => {
    const UIType = getUiType();
    const isInNotification = UIType.isNotification;
    const approval = await getApproval();

    if (isInNotification && !approval) {
      window.close();
      return;
    }

    if (!(await wallet.isBooted())) {
      setTo('/welcome');
      return;
    }

    if (await wallet.getManualLocked()) {
      setTo('/unlock');
      return;
    }

    if (!(await wallet.isUnlocked()) && isInNotification) {
      setTo('/unlock');
      return;
    }

    // here route to approval page
    if (approval) {
      setTo('/confirm-transaction');
    } else {
      setTo('/home');
    }
  };

  useEffect(() => {
    loadView();
  }, []);

  return <Spin spinning={!to}>{to && <Redirect to={to} />}</Spin>;
};

export default SortHat;
