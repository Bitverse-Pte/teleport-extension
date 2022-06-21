export type HexString = string;

export type CosmosTransactionEventType = string;
export interface CosmosTransactionEvent {
  type: CosmosTransactionEventType;
  attributes: {
    key: string;
    value: string;
    index: boolean;
  }[];
}

export type CosmosTransactionType = string;

export interface CosmosTransaction {
  txHash: string;
  recipient: string;
  height: HexString | number;
  data?: string;
  memo?: string;

  type: CosmosTransactionType;

  /** Gas related */
  gas_used: HexString;
  gas_wanted: HexString;

  raw_log?: string;

  logs: any[];

  events: CosmosTransactionEvent[];
  timestamp: number;
}
