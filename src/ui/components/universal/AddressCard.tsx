import React, { HTMLAttributes, useCallback } from 'react';
import './style.less';
import { useSelector } from 'react-redux';
import CopyOrOpenInScan from './copyOrOpenInScan';
import clsx from 'clsx';
import { Tooltip } from 'antd';
import skynet from 'utils/skynet';
import { useTranslation } from 'react-i18next';
import { Ecosystem } from 'types/network';
const { sensors } = skynet;
interface AddressCardParameters extends HTMLAttributes<HTMLDivElement> {
  title: string;
  address: string | null | undefined;
}
const shortenedStr = (str: string, digits = 6, isHex = true) =>
  `${str.slice(0, isHex ? digits + 2 : digits)}...${str.slice(-digits)}`;

/**
 * a univeral card component that:
 * * display a address
 * * have button for view in scan or copy
 */
export function AddressCard({
  title,
  address,
  className,
  ...others
}: AddressCardParameters) {
  const { t } = useTranslation();
  const {
    provider: { rpcPrefs, ecosystem },
  } = useSelector((state) => state.network);
  const whichAddress = ecosystem === Ecosystem.COSMOS ? 'account' : 'address';
  const handleExplorerClick = useCallback(
    (type: 'address' | 'account', hash: string) => {
      sensors.track('teleport_activity_open_' + type, {
        page: location.pathname,
      });
      window.open(`${rpcPrefs.blockExplorerUrl}/${type}/${hash}`);
    },
    [rpcPrefs]
  );

  return (
    <div
      className={clsx(className, 'flex items-center address-card flex-wrap')}
      {...others}
    >
      <h4 className="title">{title}</h4>
      {address && (
        <CopyOrOpenInScan
          handleExplorerClick={() => {
            handleExplorerClick(whichAddress, address);
          }}
          textToBeCopy={address}
          className="ml-auto"
        />
      )}
      <Tooltip placement="top" title={address}>
        <p className="address">
          {address ? shortenedStr(address, 4) : t('newContract')}
        </p>
      </Tooltip>
    </div>
  );
}
