import type { CosmosTx } from 'background/service/transactions/cosmos/cosmos';
import { TransactionGroup } from 'constants/transaction';

export interface ActivitiesListParams {
  listContiannerHeight: string | number;
  tokenId?: string;
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

export interface CosmosTxItemParams {
  transaction: CosmosTx;
  idx: number;
  style?: React.CSSProperties;
  isEarliestNonce?: boolean;
}
