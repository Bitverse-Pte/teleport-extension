import React, { useMemo } from 'react';
import { TransactionGroup, TransactionStatuses } from 'constants/transaction';
import { utils, BigNumber } from 'ethers';
import { useTransactionDisplayData } from 'ui/hooks/wallet/useTxDisplayData';
import { useSelector } from 'react-redux';

interface Params {
  transaction: TransactionGroup;
}

export function TransactionFee({ transaction }: Params) {
  const { displayedStatusKey } = useTransactionDisplayData(transaction);

  const isTxSigned = useMemo(() => {
    return (
      displayedStatusKey.toLowerCase() !=
      TransactionStatuses.UNAPPROVED.toLowerCase()
    );
  }, []);

  const currentProviderSymbol = useSelector(
    (s) => s.network.provider.ticker || 'ETH'
  );

  const isTxFeeDataExist = useMemo(() => {
    const { maxFeePerGas, gasPrice, gas } =
      transaction.primaryTransaction.txParams;
    return Boolean(maxFeePerGas || gasPrice) && Boolean(gas);
  }, [transaction]);

  if (!isTxSigned || !isTxFeeDataExist) {
    return null;
  }

  const formattedTxFee = () => {
    let val = '';
    try {
      val = utils.formatEther(
        BigNumber.from(
          // use gasPrice (legacy) or maxFeePerGas(1559 network)
          transaction.primaryTransaction.txParams.maxFeePerGas ||
            transaction.primaryTransaction.txParams.gasPrice
        ).mul(transaction.primaryTransaction.txParams.gas!)
      );
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
