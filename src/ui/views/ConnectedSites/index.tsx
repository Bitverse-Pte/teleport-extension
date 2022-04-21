import { BaseAccount } from 'types/extend';
import './style.less';
import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { IconComponent } from 'ui/components/IconComponents';
import { useAsyncEffect, useWallet } from 'ui/utils';
import { TipButton } from 'ui/components/Widgets';
import { TipButtonEnum } from 'constants/wallet';
import Switch from 'react-switch';
import { stat } from 'fs';
import { BetaIcon } from 'ui/components/Widgets';

interface IConnectedSitesProps {
  account?: BaseAccount;
}
const ConnectedSites: React.FC<IConnectedSitesProps> = (
  props: IConnectedSitesProps
) => {
  const history = useHistory();
  const location = useLocation();
  const wallet = useWallet();

  const init = async () => {
    console.log('----');
  };

  useAsyncEffect(init, [props.account]);

  return (
    <div className="current-connected-sites flexCol">
      <div className="header">Connected Sites</div>
    </div>
  );
};

export default ConnectedSites;
