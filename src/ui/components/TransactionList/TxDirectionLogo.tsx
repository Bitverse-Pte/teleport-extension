import { TransactionStatuses } from 'constants/transaction';
import React, { useMemo } from 'react';
import { ReactComponent as IconSent } from '../../../assets/sendOuter.svg';
import { ReactComponent as IconReceive } from '../../../assets/receiveOuter.svg';
import { ReactComponent as IconSign } from '../../../assets/action-icon/signOuter.svg';
import './style.less';
import { CosmosTxStatus } from 'types/cosmos/transaction';
import clsx from 'clsx';
interface TxLogoParams {
  status: TransactionStatuses | CosmosTxStatus | 'cancelled';
  type: 'send' | 'receive' | 'sign';
}

export function TxDirectionLogo({ status, type }: TxLogoParams) {
  const getIconClassname = useMemo(() => {
    switch (status) {
      case TransactionStatuses.ON_CHAIN_FALIURE:
      case TransactionStatuses.REJECTED:
      case CosmosTxStatus.FAILED:
      case TransactionStatuses.FAILED: {
        return 'fail';
      }
      case CosmosTxStatus.CREATED:
      case CosmosTxStatus.SIGNED:
      case TransactionStatuses.SUBMITTED: {
        return 'pending';
      }
      // success is default
      default: {
        return 'success';
      }
    }
  }, [status]);
  const theIcon = useMemo(() => {
    switch (type) {
      case 'send':
        return <IconSent width={12} height={12} />;
      case 'sign':
        return <IconSign width={12} height={12} />;
      default:
        return <IconReceive width={12} height={12} />;
    }
  }, [type]);
  return (
    <div className="logo-container">
      <div className={clsx('tx-stat-logo', getIconClassname)}>{theIcon}</div>
    </div>
  );
}
