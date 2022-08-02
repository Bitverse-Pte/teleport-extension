import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useWallet, useApproval } from 'ui/utils';
import * as ApprovalComponent from './components';
import './style.less';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';

const Approval = () => {
  const { isDarkMode } = useDarkmode();
  const history = useHistory();
  const wallet = useWallet();
  const [getApproval, , rejectApproval] = useApproval();
  const [approval, setApproval] = useState<any>(null);

  const init = async () => {
    const approval = await getApproval();
    console.log('approval ui:', approval);
    if (!approval) {
      history.replace('/home');
      return null;
    }
    if (approval.lock) {
      history.replace('/unlock');
      return null;
    }
    setApproval(approval);
    if (approval.origin || approval.params.origin) {
      document.title = approval.origin || approval.params.origin;
    }
    const account = await wallet.getCurrentAccount();
    if (!account) {
      rejectApproval();
      return;
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (!approval) return <></>;
  const { approvalComponent, params, origin, requestDefer } = approval;
  const CurrentApprovalComponent = ApprovalComponent[approvalComponent];

  return (
    <div className={clsx('approval', { dark: isDarkMode })}>
      {approval && (
        <CurrentApprovalComponent
          params={params}
          origin={origin}
          requestDefer={requestDefer}
        />
      )}
    </div>
  );
};

export default Approval;
