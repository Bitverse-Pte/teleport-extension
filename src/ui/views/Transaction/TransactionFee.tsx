import React, { Fragment, useMemo } from 'react';
import {
  TransactionGroup,
  TransactionGroupCategories,
  TransactionStatuses,
} from 'constants/transaction';
import { utils, BigNumber } from 'ethers';
import { useTransactionDisplayData } from 'ui/hooks/wallet/useTxDisplayData';
// import { useSelector } from 'react-redux';
import { purifyTxParamsGasFields } from 'utils/transaction.utils';
import { useTransactionBreakDown } from 'ui/hooks/utils/useTransactionBreakdown';
import { useTranslation } from 'react-i18next';

interface Params {
  transaction: TransactionGroup;
}

export function TransactionFee({ transaction: txGroup }: Params) {
  const { t } = useTranslation();
  const { displayedStatusKey, category } = useTransactionDisplayData(txGroup);
  const { hexGasTotal, nativeCurrency } = useTransactionBreakDown(
    txGroup.primaryTransaction,
    category == TransactionGroupCategories.APPROVAL
  );

  const isTxSigned = useMemo(() => {
    return (
      displayedStatusKey.toLowerCase() !=
      TransactionStatuses.UNAPPROVED.toLowerCase()
    );
  }, []);

  const primaryTransaction = purifyTxParamsGasFields(
    txGroup.primaryTransaction
  );

  const isTxFeeDataExist = useMemo(() => {
    const { maxFeePerGas, gasPrice, gas } = primaryTransaction.txParams;
    return Boolean(maxFeePerGas || gasPrice) && Boolean(gas);
  }, [primaryTransaction]);

  if (!isTxSigned || !isTxFeeDataExist) {
    return null;
  }

  const formattedTxFee = () => {
    let val = '';
    try {
      val = utils.formatEther(hexGasTotal);
      if (val.length > 11) {
        /**
         * parsed as number then rounding it
         */
        val = Number(val).toFixed(8);
      }
    } catch (error) {
      console.error('TransactionFee::formattedTxFee::error: ', error);
      val = '0.00';
    }
    return val;
  };

  return (
    <div className="row">
      <div className="field-name">Transaction Fee</div>
      <div className="field-value">
        {formattedTxFee()} {nativeCurrency}
      </div>
    </div>
  );
}
