import React, { useMemo } from 'react';
import { TransactionGroup, TransactionStatuses } from 'constants/transaction';
import { utils, BigNumber } from 'ethers';
import { useTransactionDisplayData } from 'ui/hooks/wallet/useTxDisplayData';
import { useSelector } from 'react-redux';
import { purifyTxParamsGasFields } from 'utils/transaction.utils';

interface Params {
  transaction: TransactionGroup;
}

export function TransactionFee({ transaction: txGroup }: Params) {
  const { displayedStatusKey } = useTransactionDisplayData(txGroup);

  const isTxSigned = useMemo(() => {
    return (
      displayedStatusKey.toLowerCase() !=
      TransactionStatuses.UNAPPROVED.toLowerCase()
    );
  }, []);

  const currentProviderSymbol = useSelector(
    (s) => s.network.provider.ticker || 'ETH'
  );

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
      val = utils.formatEther(
        BigNumber.from(
          // use gasPrice (legacy) or maxFeePerGas(1559 network)
          primaryTransaction.txParams.maxFeePerGas ||
            primaryTransaction.txParams.gasPrice
        ).mul(primaryTransaction.txParams.gas!)
      );
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
        {formattedTxFee()} {currentProviderSymbol}
      </div>
    </div>
  );
}
