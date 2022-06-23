import { MAINNET_CHAIN_ID } from 'constants/network';
import TransactionController from './transactions/index';
import cosmosTxFn from './transactions/cosmos';
import NetworkController, { NETWORK_EVENTS } from './network/index';
import keyringController from './keyring';
import { GasFeeController, ControllerMessenger } from '@metamask/controllers';
import { TransactionStatuses as TRANSACTION_STATUSES } from 'constants/transaction';

import notificationService from './notification';
import keyringService from './keyring';
import permissionService from './permission';
import preferenceService from './preference';
import networkPreferenceService from './network';
import sessionService from './session';
import i18n from './i18n';
import TokenService from './token/TokenService';
import platform from './extension';
import knownMethodService from './knownMethod';
import { LatestBlockDataHubService } from './network/latestBlockDataHub';
import contactBookService from './contactBook';

const controllerMessenger = new ControllerMessenger();

export const GAS_API_BASE_URL = 'https://gas-api.metaswap.codefi.network';
export const GAS_DEV_API_BASE_URL =
  'https://gas-api.metaswap-dev.codefi.network';
const infuraProjectId = process.env.INFURA_PROJECT_ID;

const gasApiBaseUrl = process.env.SWAPS_USE_DEV_APIS
  ? GAS_DEV_API_BASE_URL
  : GAS_API_BASE_URL;
const gasFeeMessenger = controllerMessenger.getRestricted({
  name: 'GasFeeController',
});
const SWAPS_CLIENT_ID = 'extension';
const networkController = NetworkController;
networkController.setInfuraProjectId(infuraProjectId as string);
initializeProvider();
console.log('networkController: ', networkController);
const gasFeeController = new GasFeeController({
  interval: 10000,
  messenger: gasFeeMessenger,
  clientId: SWAPS_CLIENT_ID,
  getProvider: () => networkController.getProviderAndBlockTracker().provider,
  onNetworkStateChange: networkController.on.bind(
    networkController,
    NETWORK_EVENTS.NETWORK_DID_CHANGE
  ),
  getCurrentNetworkEIP1559Compatibility:
    networkController.getEIP1559Compatibility.bind(networkController),
  getCurrentAccountEIP1559Compatibility: () => true,
  legacyAPIEndpoint: `${gasApiBaseUrl}/networks/<chain_id>/gasPrices`,
  EIP1559APIEndpoint: `${gasApiBaseUrl}/networks/<chain_id>/suggestedGasFees`,
  getCurrentNetworkLegacyGasAPICompatibility: () => {
    const chainId = networkController.getCurrentChainId();
    return chainId === MAINNET_CHAIN_ID;
  },
  getChainId: () => {
    return networkController.getCurrentChainId();
  },
});

const txController = new TransactionController({
  initState: {},
  // TODO: this.permissionsController.getAccounts
  getPermittedAccounts: () => undefined,
  getProviderConfig:
    networkController.getProviderConfig.bind(networkController),
  getCurrentNetworkEIP1559Compatibility:
    networkController.getEIP1559Compatibility.bind(networkController),
  getCurrentAccountEIP1559Compatibility: () => true,
  networkStore: networkController.networkStore,
  getCurrentChainId:
    networkController.getCurrentChainId.bind(networkController),
  // preferencesStore: this.preferencesController.store,
  txHistoryLimit: 40,
  signTransaction: keyringController.signTransaction.bind(keyringController),
  provider: networkController.getProviderAndBlockTracker().provider,
  blockTracker: networkController.getProviderAndBlockTracker().blockTracker,
  getEth: networkController.getCurrentEth.bind(networkController),
  trackMetaMetricsEvent: () => undefined,
  getParticipateInMetrics: () => false,
  getEIP1559GasFeeEstimates:
    gasFeeController.fetchGasFeeEstimates.bind(gasFeeController),
});

const latestBlockDataHub = new LatestBlockDataHubService({
  provider: networkController.getProviderAndBlockTracker().provider,
  blockTracker: networkController.getProviderAndBlockTracker().blockTracker,
  gasFeeTracker: gasFeeController,
  networkProviderStore: networkController.networkStore,
});

latestBlockDataHub.store.subscribe(({ isBaseFeePerGasExist }) => {
  networkPreferenceService.markCurrentNetworkEIPStatus(
    '1559',
    isBaseFeePerGasExist
  );
});

const cosmosTxController = cosmosTxFn(networkPreferenceService);

export {
  txController,
  gasFeeController,
  networkController,
  notificationService,
  keyringService,
  permissionService,
  preferenceService,
  networkPreferenceService,
  sessionService,
  i18n,
  knownMethodService,
  TokenService,
  latestBlockDataHub,
  contactBookService,
  cosmosTxController,
};

async function newUnapprovedTransaction(txParams, req) {
  return await txController.newUnapprovedTransaction(txParams, req);
}
async function getPendingNonce(address) {
  const { nonceDetails, releaseLock } =
    await txController.nonceTracker.getNonceLock(address);
  const pendingNonce = nonceDetails.params.highestSuggested;

  releaseLock();
  return pendingNonce;
}

function initializeProvider() {
  const version = '0.0.1';
  const providerOpts = {
    static: {
      eth_syncing: false,
      web3_clientVersion: `TeleportWallet/v${version}`,
    },
    version,
    // account mgmt
    getAccounts: async ({ origin }) => {
      if (origin === 'metamask') {
        const selectedAddress = preferenceService.getSelectedAddress();
        return selectedAddress ? [selectedAddress] : [];
      }
      // TODO: need import `permissionsController.getAccounts`
      // else if (this.isUnlocked()) {
      //   return await this.permissionsController.getAccounts(origin);
      // }
      return []; // changing this is a breaking change
    },
    // tx signing
    processTransaction: newUnapprovedTransaction,
    // TODO: msg signing
    // processEthSignMessage: this.newUnsignedMessage.bind(this),
    // processTypedMessage: this.newUnsignedTypedMessage.bind(this),
    // processTypedMessageV3: this.newUnsignedTypedMessage.bind(this),
    // processTypedMessageV4: this.newUnsignedTypedMessage.bind(this),
    // processPersonalMessage: this.newUnsignedPersonalMessage.bind(this),
    // processDecryptMessage: this.newRequestDecryptMessage.bind(this),
    // processEncryptionPublicKey: this.newRequestEncryptionPublicKey.bind(this),
    getPendingNonce: getPendingNonce,
    getPendingTransactionByHash: (hash) =>
      txController.getTransactions({
        searchCriteria: {
          hash,
          status: TRANSACTION_STATUSES.SUBMITTED,
        },
      })[0],
  };
  const providerProxy = networkController.initializeProvider(
    providerOpts as any
  );
  return providerProxy;
}

txController.on('tx:status-update', async (txId, status) => {
  if (
    status === TRANSACTION_STATUSES.CONFIRMED ||
    status === TRANSACTION_STATUSES.FAILED
  ) {
    const txMeta = txController.txStateManager.getTransaction(txId);
    platform.showTransactionNotification(txMeta, {});
  }
});
