import {
  TransactionGroup,
  TransactionGroupCategories,
} from 'constants/transaction';
import { addHexPrefix } from 'ethereumjs-util';
import { BigNumber, utils } from 'ethers';
import React, { Fragment } from 'react';
import { useTransactionBreakDown } from 'ui/hooks/utils/useTransactionBreakdown';
import { TransactionFee } from '../TransactionFee';
import { TransactionItemDetail } from './TransactionItemDetail.component';

interface TransactionGasDetailProps {
  txGroup: TransactionGroup;
  category?: string;
}

export function TransactionGasDetail({
  txGroup,
  category,
}: TransactionGasDetailProps) {
  const { primaryTransaction } = txGroup;
  const { isEIP1559Transaction, baseFee, nativeCurrency } =
    useTransactionBreakDown(
      primaryTransaction,
      category == TransactionGroupCategories.APPROVAL
    );

  return (
    <Fragment>
      <TransactionItemDetail
        name="Gas Limit (Unit)"
        value={BigNumber.from(primaryTransaction.txParams.gas).toString()}
      />
      {primaryTransaction.txReceipt?.gasUsed && (
        <TransactionItemDetail
          name="Gas Used (Unit)"
          value={BigNumber.from(
            addHexPrefix(primaryTransaction.txReceipt?.gasUsed)
          ).toString()}
        />
      )}
      {isEIP1559Transaction && baseFee && (
        <TransactionItemDetail
          name="Base Fee (GWEI)"
          value={utils.formatUnits(baseFee, 'gwei')}
        />
      )}
      {isEIP1559Transaction && (
        <TransactionItemDetail
          name="Priority Fee (GWEI)"
          value={utils.formatUnits(
            primaryTransaction.txParams.maxPriorityFeePerGas as string,
            'gwei'
          )}
        />
      )}
      {!isEIP1559Transaction && (
        <TransactionItemDetail
          name="Gas Price (GWEI)"
          value={utils.formatUnits(
            primaryTransaction.txParams.gasPrice as string,
            'gwei'
          )}
        />
      )}
      <TransactionFee transaction={txGroup} />
      {isEIP1559Transaction && primaryTransaction.txParams.maxFeePerGas && (
        <TransactionItemDetail
          name="Max Fee Per Gas"
          value={`${Number(
            utils.formatUnits(primaryTransaction.txParams.maxFeePerGas, 'ether')
          ).toFixed(8)} ${nativeCurrency}`}
        />
      )}
    </Fragment>
  );
}
