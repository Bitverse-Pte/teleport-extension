export const ETH = 'ETH';
export const GWEI = 'GWEI';
export const WEI = 'WEI';

export enum TransactionStatuses {
  UNAPPROVED = 'unapproved',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SIGNED = 'signed',
  SUBMITTED = 'submitted',
  FAILED = 'failed',
  DROPPED = 'dropped',
  CONFIRMED = 'confirmed',
  ON_CHAIN_FALIURE = '0x0',
}

/**
 * Transaction Group Status is a MetaMask construct to track the status of groups
 * of transactions.
 */
export enum TransactionGroupStatuses {
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

/**
 * Transaction Group Category is a MetaMask construct to categorize the intent
 * of a group of transactions for purposes of displaying in the UI
 * @property {'send'} SEND - Transaction group representing ether being sent from
 *  the user.
 * @property {'receive'} RECEIVE - Transaction group representing a deposit/incoming
 *  transaction. This category maps 1:1 with TRANSACTION_CATEGORIES.INCOMING.
 * @property {'interaction'} INTERACTION - Transaction group representing
 *  an interaction with a smart contract's methods.
 * @property {'approval'} APPROVAL - Transaction group representing a request for an
 *  allowance of a token to spend on the user's behalf.
 * @property {'signature-request'} SIGNATURE_REQUEST - Transaction group representing
 *  a signature request This currently only shows up in the UI when its pending user
 *  approval in the UI. Once the user approves or rejects it will no longer show in
 *  activity.
 * @property {'swap'} SWAP - Transaction group representing a token swap through
 *  MetaMask Swaps. This transaction group's primary currency changes depending
 *  on context. If the user is viewing an asset page for a token received from a swap,
 *  the primary currency will be the received token. Otherwise the token exchanged
 *  will be shown.
 */
export enum TransactionGroupCategories {
  SEND = 'send',
  RECEIVE = 'receive',
  INTERACTION = 'interaction',
  APPROVAL = 'approval',
  UNAPPROVED = 'unapproved',
  SIGNATURE_REQUEST = 'signature-request',
  SWAP = 'swap',
}

// just for annotation
export type HexString = string;

/**
 * In EIP-2718 typed transaction envelopes were specified, with the very first
 * typed envelope being 'legacy' and describing the shape of the base
 * transaction params that were hitherto the only transaction type sent on
 * Ethereum.
 * @property LEGACY - A legacy transaction, the very first type.
 * @property ACCESS_LIST - EIP-2930 defined the access list transaction
 *  type that allowed for specifying the state that a transaction would act
 *  upon in advance and theoretically save on gas fees.
 * @property FEE_MARKET - The type introduced comes from EIP-1559,
 *  Fee Market describes the addition of a baseFee to blocks that will be
 *  burned instead of distributed to miners. Transactions of this type have
 *  both a maxFeePerGas (maximum total amount in gwei per gas to spend on the
 *  transaction) which is inclusive of the maxPriorityFeePerGas (maximum amount
 *  of gwei per gas from the transaction fee to distribute to miner).
 */
export enum TransactionEnvelopeTypes {
  LEGACY = '0x0',
  ACCESS_LIST = '0x1',
  FEE_MARKET = '0x2',
}

/**
 * Transaction Type is a MetaMask construct used internally
 * @property {'transfer'} TOKEN_METHOD_TRANSFER - A token transaction where the user
 *  is sending tokens that they own to another address
 * @property {'transferfrom'} TOKEN_METHOD_TRANSFER_FROM - A token transaction
 *  transferring tokens from an account that the sender has an allowance of.
 *  For more information on allowances, see the approve type.
 * @property {'approve'} TOKEN_METHOD_APPROVE - A token transaction requesting an
 *  allowance of the token to spend on behalf of the user
 * @property {'incoming'} INCOMING - An incoming (deposit) transaction
 * @property {'simpleSend'} SIMPLE_SEND - A transaction sending a network's native asset to a recipient
 * @property {'contractInteraction'} CONTRACT_INTERACTION - A transaction that is
 *  interacting with a smart contract's methods that we have not treated as a special
 *  case, such as approve, transfer, and transferfrom
 * @property {'contractDeployment'} DEPLOY_CONTRACT - A transaction that deployed
 *  a smart contract
 * @property {'swap'} SWAP - A transaction swapping one token for another through
 *  MetaMask Swaps
 * @property {'swapApproval'} SWAP_APPROVAL - Similar to the approve type, a swap
 *  approval is a special case of ERC20 approve method that requests an allowance of
 *  the token to spend on behalf of the user for the MetaMask Swaps contract. The first
 *  swap for any token will have an accompanying swapApproval transaction.
 * @property {'cancel'} CANCEL - A transaction submitted with the same nonce as a
 *  previous transaction, a higher gas price and a zeroed out send amount. Useful
 *  for users who accidentally send to erroneous addresses or if they send too much.
 * @property {'retry'} RETRY - When a transaction is failed it can be retried by
 *  resubmitting the same transaction with a higher gas fee. This type is also used
 *  to speed up pending transactions. This is accomplished by creating a new tx with
 *  the same nonce and higher gas fees.
 */
export enum TransactionTypes {
  TOKEN_METHOD_TRANSFER = 'transfer',
  TOKEN_METHOD_TRANSFER_FROM = 'transferfrom',
  TOKEN_METHOD_APPROVE = 'approve',
  INCOMING = 'incoming',
  SIMPLE_SEND = 'simpleSend',
  CONTRACT_INTERACTION = 'contractInteraction',
  DEPLOY_CONTRACT = 'contractDeployment',
  SWAP = 'swap',
  SWAP_APPROVAL = 'swapApproval',
  CANCEL = 'cancel',
  RETRY = 'retry',
  SIGN = 'eth_sign',
  SIGN_TYPED_DATA = 'eth_signTypedData',
  PERSONAL_SIGN = 'personal_sign',
  ETH_DECRYPT = 'eth_decrypt',
  ETH_GET_ENCRYPTION_PUBLIC_KEY = 'eth_getEncryptionPublicKey',
}
export interface Log {
  address: HexString;
  blockHash: HexString;
  blockNumber: HexString;
  data: HexString;
  logIndex: HexString;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: HexString | number;
}

export interface TxParams {
  // EIP-1559
  maxFeePerGas?: HexString;
  maxPriorityFeePerGas?: HexString;
  type?: TransactionEnvelopeTypes;

  data?: HexString;
  from: HexString;
  gas?: HexString;
  gasLimit?: HexString;
  gasPrice?: HexString;
  estimateSuggested?: string;
  estimateUsed?: string;
  nonce: HexString;
  // no to then create contract
  to?: HexString | null;
  value: HexString;
}

export interface IncomingTransaction {
  blockNumber: HexString;
  chainId: HexString;
  hash: HexString;
  id: string | number;
  metamaskNetworkId: string;
  status: TransactionStatuses;
  time: number;
  txParams: TxParams;
  type: 'incoming';
}

export interface TxError {
  message: string;
  rpc: any;
  stack?: string;
}

export interface Transaction {
  warning?: {
    error: any;
    message: string;
  };
  retryCount?: number;
  baseFeePerGas?: HexString;
  chainId: HexString;
  previousGas?: Partial<TxParams>;
  dappSuggestedGasFees: {
    gas?: HexString;
    gasPrice?: HexString;
    maxFeePerGas?: HexString;
    maxPriorityFeePerGas?: HexString;
  } | null;
  estimatedBaseFee?: HexString;
  firstRetryBlockNumber?: string;
  hash: HexString;
  history: any[];
  // maybe nanoid?
  id: string;
  loadingDefaults: boolean;
  metamaskNetworkId: string;
  nonceDetails: {
    local: {
      details: {
        highest: number;
        startPoint: number;
      };
      name: string;
      nonce: number;
    };
    network: {
      details: {
        baseCount: number;
        blockNumber: HexString;
      };
      name: string;
      nonce: number;
    };
    params: {
      highestLocallyConfirmed: number;
      highestSuggested: number;
      nextNetworkNonce: number;
    };
  };
  origin: string;
  status: TransactionStatuses;
  submittedTime?: number;
  blockNumber?: HexString;
  time: number;
  txParams: TxParams;
  // only exist if tx was validated by the nodes
  // both success and reverted tx
  txReceipt?: {
    blockHash: HexString;
    // hexstring
    blockNumber: HexString;
    contractAddress: string | null;
    // hexstr
    cumulativeGasUsed: HexString;
    effectiveGasPrice?: HexString;
    from: HexString;
    gasUsed: HexString;
    logs: Log[];
    logsBloom: string;
    status: TransactionStatuses;
    to?: HexString | null;
    transactionHash: HexString;
    transactionIndex: HexString;
    type: TransactionEnvelopeTypes;
  };
  type: string;
  userFeeLevel?: string;
  rawTx: HexString;
  // signature
  v: HexString;
  r: HexString;
  s: HexString;

  err?: TxError;
}

export interface TransactionMeta {
  blockNumber?: string;
  id: number;
  time: number;
  type: TransactionTypes;
  status: TransactionStatuses;
  metamaskNetworkId: string;
  loadingDefaults: boolean;
  txParams: TxParams;
  history: any[];
  origin: string;
  nonceDetails: any;
  rawTx: string;
  hash: string;
  submittedTime?: number;
  err?: TxError;
}

interface TransactionController {
  transactions: Record<string, Transaction>;
}

interface IncomingTransactionsController {
  incomingTransactions: Record<string, IncomingTransaction>;
  incomingTxLastFetchedBlockByChainId: Record<string, number | null>;
}

// Store these two items, one is Outgoing (initiated by the user), and the other is incoming (initiated by others, such as ETH transfer)
export interface TransactionHistoryStore {
  // outgoingTransactions: TransactionController;
  // incomingTransactionsController: IncomingTransactionsController;
  transactions: Record<string, Transaction>;
}

/**
 * Contains transactions and properties associated with those transactions of the same nonce.
 * @property {string} nonce - The nonce that the transactions within this transactionGroup share.
 * @property {Transaction[]} transactions - An array of transaction (txMeta) objects.
 * @property {Transaction} initialTransaction - The transaction (txMeta) with the lowest "time".
 * @property {Transaction} primaryTransaction - Either the latest transaction or the confirmed
 * transaction.
 * @property {boolean} hasRetried - True if a transaction in the group was a retry transaction.
 * @property {boolean} hasCancelled - True if a transaction in the group was a cancel transaction.
 */
export interface TransactionGroup {
  nonce?: string;
  transactions: Transaction[];
  initialTransaction: Transaction;
  primaryTransaction: Transaction;
  hasRetried: boolean;
  hasCancelled: boolean;
}

export const PENDING_STATUS_HASH = {
  [TransactionStatuses.UNAPPROVED]: true,
  [TransactionStatuses.APPROVED]: true,
  [TransactionStatuses.SUBMITTED]: true,
};

export const PRIORITY_STATUS_HASH = {
  ...PENDING_STATUS_HASH,
  [TransactionStatuses.CONFIRMED]: true,
};

export const TOKEN_CATEGORY_HASH = {
  [TransactionTypes.TOKEN_METHOD_APPROVE]: true,
  [TransactionTypes.TOKEN_METHOD_TRANSFER]: true,
  [TransactionTypes.TOKEN_METHOD_TRANSFER_FROM]: true,
};

export const TRANSACTION_ENVELOPE_TYPE_NAMES = {
  FEE_MARKET: 'fee-market',
  LEGACY: 'legacy',
};
