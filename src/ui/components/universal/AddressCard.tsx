import React, { HTMLAttributes, useCallback } from 'react';
import './style.less';
import { useSelector } from 'react-redux';
import CopyOrOpenInScan from './copyOrOpenInScan';
import clsx from 'clsx';
import { Tooltip } from 'antd';

interface AddressCardParameters extends HTMLAttributes<HTMLDivElement> {
  title: string;
  address: string;
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
  const {
    provider: { rpcPrefs },
  } = useSelector((state) => state.network);
  const handleExplorerClick = useCallback(
    (type: 'address' | 'tx', hash: string) => {
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
      <CopyOrOpenInScan
        handleExplorerClick={() => handleExplorerClick('address', address)}
        textToBeCopy={address}
        className="ml-auto"
      />
      <Tooltip placement="top" title={address}>
        <p className="address">{shortenedStr(address, 4)}</p>
      </Tooltip>
    </div>
  );
}
