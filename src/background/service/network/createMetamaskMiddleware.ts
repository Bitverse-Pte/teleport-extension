import { createScaffoldMiddleware, mergeMiddleware } from 'json-rpc-engine';
import { createWalletMiddleware } from 'eth-json-rpc-middleware';
import {
  createPendingNonceMiddleware,
  createPendingTxMiddleware,
} from './middleware/pending';

type WalletMiddlewareOptions = Parameters<typeof createWalletMiddleware>[0];
export interface CreateMetamaskMiddlewareParams
  extends WalletMiddlewareOptions {
  version: string | number;
  getPendingNonce: any;
  getPendingTransactionByHash: any;
}

export default function createMetamaskMiddleware({
  version,
  getAccounts,
  processTransaction,
  processEthSignMessage,
  processTypedMessage,
  processTypedMessageV3,
  processTypedMessageV4,
  processPersonalMessage,
  processDecryptMessage,
  processEncryptionPublicKey,
  getPendingNonce,
  getPendingTransactionByHash,
}: CreateMetamaskMiddlewareParams) {
  const metamaskMiddleware = mergeMiddleware([
    createScaffoldMiddleware({
      eth_syncing: false,
      web3_clientVersion: `MetaMask/v${version}`,
    }),
    createWalletMiddleware({
      getAccounts,
      processTransaction,
      processEthSignMessage,
      processTypedMessage,
      processTypedMessageV3,
      processTypedMessageV4,
      processPersonalMessage,
      processDecryptMessage,
      processEncryptionPublicKey,
    }) as any,
    createPendingNonceMiddleware({ getPendingNonce }),
    createPendingTxMiddleware({ getPendingTransactionByHash }),
  ]);
  return metamaskMiddleware;
}
