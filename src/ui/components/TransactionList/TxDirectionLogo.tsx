import { Grey, Orange, Red } from 'constants/colorPalette';
import { TransactionStatuses } from 'constants/transaction';
import React, { CSSProperties, useMemo } from 'react';
import { ReactComponent as IconSent } from '../../../assets/send.svg';
import { ReactComponent as IconReceive } from '../../../assets/receive.svg';

import './style.less';

interface TxLogoParams {
  status: TransactionStatuses | 'cancelled';
  type: 'send' | 'receive';
  size?: number;
}

export function TxDirectionLogo({ status, type, size = 48 }: TxLogoParams) {
  const backgroundColor = useMemo(() => {
    switch (status) {
      case TransactionStatuses.ON_CHAIN_FALIURE:
      case TransactionStatuses.REJECTED:
      case TransactionStatuses.FAILED: {
        return Red['07'];
      }
      case TransactionStatuses.SUBMITTED: {
        return Orange['02'];
      }
      // success is default
      default: {
        return Grey['07'];
      }
    }
  }, [status]);
  const iconStyle = useMemo(() => {
    const style: CSSProperties = {
      // width: size,
      // padding: `${Math.floor(size * 0.2647)}px`,
      // borderRadius: '100%',
      // height: size,
    };
    switch (status) {
      case TransactionStatuses.ON_CHAIN_FALIURE:
      case TransactionStatuses.REJECTED:
      case TransactionStatuses.FAILED: {
        // style.backgroundColor = Red['07'];
        style.fill = Red['02'];
        break;
      }
      case TransactionStatuses.SUBMITTED: {
        // style.backgroundColor = Orange['02'];
        style.fill = '#FFFFFF';
        break;
      }
      // success is default
      default: {
        // style.backgroundColor = Grey['07'];
        style.fill = Grey['02'];
        break;
      }
    }
    return style;
  }, [status]);
  return (
    <div className="logo-container">
      <div className="tx-stat-logo" style={{ backgroundColor }}>
      {type === 'send' ? (
        <IconSent style={iconStyle} width={12} height={12} />
      ) : (
        <IconReceive style={iconStyle} width={12} height={12} />
      )}
    </div>
    </div>
  );
}
