import { BaseAccount } from 'types/extend';
import './style.less';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { transferAddress2Display, useAsyncEffect, useWallet } from 'ui/utils';
import Jazzicon from 'react-jazzicon';
import { getUnit10ByAddress } from 'background/utils';
import { TipButton, WalletName } from 'ui/components/Widgets';
import { TipButtonEnum } from 'constants/wallet';
import Switch from 'react-switch';
import { stat } from 'fs';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';

import { ReactComponent as DisconnectIcon } from 'assets/disconnectDefault.svg';
import { ReactComponent as AccountSwitchIcon } from 'assets/accountSwitch.svg';

import { useTranslation } from 'react-i18next';
import { ConnectedSite } from 'background/service/permission';
import { NoContent } from 'ui/components/universal/NoContent';
import skynet from 'utils/skynet';
import { useStyledModal } from 'ui/hooks/style/useStyledModal';
const { sensors } = skynet;
interface IConnectedSitesProps {
  isEvm?: boolean;
  account?: BaseAccount;
  chainId?: string;
  visible?: boolean;
  handleOnClose?: () => void;
}
const ConnectedSites: React.FC<IConnectedSitesProps> = (
  props: IConnectedSitesProps
) => {
  const { isDarkMode } = useDarkmode();
  const history = useHistory();
  const location = useLocation();
  const wallet = useWallet();
  const { t } = useTranslation();
  const [account, setAccount] = useState<BaseAccount>();
  const [siteList, setSiteList] = useState<ConnectedSite[]>();
  const Modal = useStyledModal();

  const init = async () => {
    if (props.isEvm) {
      setAccount(props.account);
      const connected: ConnectedSite[] =
        await wallet.getConnectedSitesByAccount(props.account?.address);
      setSiteList(connected);
    } else {
      const connected: ConnectedSite[] =
        await wallet.getConnectedSitesByChainId(props.chainId);
      setSiteList(connected);
    }
  };

  useAsyncEffect(init, [props.visible]);

  const handleRemoveSiteClick = async (site: ConnectedSite) => {
    Modal('confirm')({
      title: <div className="delete-confoirm-title">Confirm</div>,
      content: (
        <div className="delete-confoirm-content">
          {`Are you sure to disconnect with ${site.origin}? That may result in
          losing site functionality.`}
        </div>
      ),
      okText: 'Disconnect',
      cancelText: 'Cancel',
      okButtonProps: {
        type: 'primary',
      },
      cancelButtonProps: {
        type: 'default',
      },
      centered: true,
      closable: true,
      icon: undefined,
      style: {
        borderRadius: '16px 16px 16px 16px',
        overflow: 'hidden',
        alignItems: 'center',
      },
      async onOk() {
        sensors.track('teleport_connected_sites_confirm_ok', {
          page: location.pathname,
        });
        if (props.isEvm) {
          await wallet.removeConnectedSite(site.origin, account?.address);
        } else {
          await wallet.removeConnectedSiteByChainId(site.origin, props.chainId);
        }
        init();
      },
      async onCancel() {
        sensors.track('teleport_connected_sites_confirm_cancel', {
          page: location.pathname,
        });
      },
    });
  };

  return (
    <div
      className={clsx('current-connected-sites flexCol', { dark: isDarkMode })}
    >
      <div className="current-connected-sites-top">
        <div className="page-header">Connected Sites</div>
        {props.isEvm && (
          <div className="account-item flexR" key={account?.address}>
            <div className="account-left flexR">
              <Jazzicon
                diameter={30}
                seed={getUnit10ByAddress(account?.address)}
              />
              <div className="account-info flexCol">
                <WalletName cls="account-name" width={100}>
                  {account?.accountName || account?.hdWalletName}
                </WalletName>
                <span className="account-address">
                  {transferAddress2Display(account?.address)}
                </span>
              </div>
            </div>

            <div className="account-right flexR">
              <div
                className="account-item-action cursor flexR"
                onClick={(e) => {
                  e.stopPropagation();
                  if (props.handleOnClose) {
                    sensors.track('teleport_connected_sites_switch', {
                      page: location.pathname,
                    });
                    props.handleOnClose();
                  }
                }}
              >
                <AccountSwitchIcon className="account-item-action-icon account-switch-icon" />
              </div>
            </div>
          </div>
        )}
        {props.isEvm && (
          <div className="content-desc">
            {t(
              `${transferAddress2Display(
                account?.address
              )} is connected to sites below, which can view your account address.`
            )}
          </div>
        )}
      </div>
      <div className="connected-site-list flexCol">
        {siteList && siteList.length > 0 ? (
          siteList.map((a) => (
            <div className="site-item flexR" key={a.name}>
              <div className="site-item-left flexR">
                <img className="site-icon" src={a.icon} />
                <div className="site-origin">{a.origin}</div>
              </div>
              <div
                className="site-item-right cursor flexR"
                onClick={(e) => {
                  e.stopPropagation();
                  sensors.track('teleport_connected_sites_remove', {
                    page: location.pathname,
                    site: a.origin,
                  });
                  handleRemoveSiteClick(a);
                }}
              >
                <DisconnectIcon className="site-item-action-icon disconnect-icon" />
              </div>
            </div>
          ))
        ) : (
          <NoContent title="Sites Connected" />
        )}
      </div>
    </div>
  );
};

export default ConnectedSites;
