import { TransactionGroup } from 'constants/transaction';

export interface ActivitiesListParams {
  listContiannerHeight: string | number;
  hideTokenTransactions?: boolean;
  tokenAddress?: string;
  dateFilter?: {
    from: Date;
    to: Date;
  };
  txData?: string;
}

export interface TransactionItemParams {
  transactionGroup: TransactionGroup;
  idx: number;
  style?: React.CSSProperties;
  isEarliestNonce?: boolean;
}
