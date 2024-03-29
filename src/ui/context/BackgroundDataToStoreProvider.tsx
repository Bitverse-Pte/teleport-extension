import { ITokenStore } from 'types/token';
import { EVENTS } from 'constants/index';
import eventBus from 'eventBus';
import { TransactionHistoryStore } from 'constants/transaction';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTokenServiceState } from '../reducer/token.reducer';
import { setTransactions } from '../reducer/transactions.reducer';
import { KnownMethodDict } from 'background/service/knownMethod';
import { updateKnownMethods } from 'ui/reducer/knownMethod.reducer';
import { updatePreferences } from 'ui/reducer/preference.reducer';
import { PreferenceStore } from 'background/service/preference';
import { Ecosystem, Network, NetworkController, Provider } from 'types/network';
import { updateNetworkController } from 'ui/reducer/network.reducer';
import { setCustomNetworks } from 'ui/reducer/customNetwork.reducer';
import { setCurrentGasLimit, setGasEstimates } from 'ui/reducer/block.reducer';
import type { BlockData } from 'background/service/network/latestBlockDataHub';
import type { CosmosTx } from 'background/service/transactions/cosmos/cosmos';
import { setCosmosTransactions } from 'ui/reducer/cosmosTxs.reducer';

/**
 * BackgroundDataSyncMiddleware
 * to manage the data sync between these two parts
 */
export function BackgroundDataSyncMiddleware() {
  const dispatch = useDispatch();

  const fetchStorageDataFromBackground = (storageName: string) =>
    eventBus.emit(EVENTS.broadcastToBackground, {
      method: `dataSyncService.fetch.${storageName}`,
    });

  const onPageUnloadDisablePollingBlocks = (e: BeforeUnloadEvent) => {
    // push UI closed event if clean up
    eventBus.emit(EVENTS.broadcastToBackground, {
      method: 'UI_STATUS',
      data: false,
    });
  };

  useEffect(() => {
    // only for the beginning of this hook
    const onTxServiceBackgroundMessage = (txs: TransactionHistoryStore) => {
      dispatch(setTransactions(txs.transactions));
    };
    const onCosmosTxHistoryUpdate = (txs: {
      transactions: Record<string, CosmosTx>;
    }) => {
      dispatch(setCosmosTransactions(txs.transactions));
    };
    const onTokenServiceBackgroundMessage = (s: ITokenStore) => {
      dispatch(setTokenServiceState(s));
    };
    const onKnownMethodsUpdate = (s: KnownMethodDict) => {
      dispatch(updateKnownMethods(s));
    };
    const onPreferenceUpdate = (s: PreferenceStore) => {
      dispatch(updatePreferences(s));
    };
    const onNetworkStore = (s: NetworkController) => {
      dispatch(updateNetworkController(s));
    };
    const onCustomNetworksStore = (s: {
      networks: Network[];
      // ecosytems => list of network's ID by order
      orderOfNetworks: Record<Ecosystem, string[]>;
    }) => {
      dispatch(
        setCustomNetworks({
          ...s,
          networks: s.networks.map((n) => ({ ...n, type: 'rpc' })),
        })
      );
    };
    const onCurrentBlockStore = (s: BlockData) => {
      dispatch(setCurrentGasLimit(s.currentBlockGasLimit));
      dispatch(setGasEstimates(s));
    };
    eventBus.addEventListener(
      'dataSyncService.transactionHistory',
      onTxServiceBackgroundMessage
    );
    eventBus.addEventListener(
      'dataSyncService.cosmosTxHistory',
      onCosmosTxHistoryUpdate
    );
    eventBus.addEventListener(
      'dataSyncService.tokenStore',
      onTokenServiceBackgroundMessage
    );
    eventBus.addEventListener(
      'dataSyncService.knownMethod',
      onKnownMethodsUpdate
    );
    eventBus.addEventListener('dataSyncService.preference', onPreferenceUpdate);
    eventBus.addEventListener('dataSyncService.networkStore', onNetworkStore);
    eventBus.addEventListener(
      'dataSyncService.customNetworksStore',
      onCustomNetworksStore
    );
    eventBus.addEventListener(
      'dataSyncService.latestBlockData',
      onCurrentBlockStore
    );

    fetchStorageDataFromBackground('cosmosTxHistory');
    fetchStorageDataFromBackground('transactionHistory');
    fetchStorageDataFromBackground('tokenStore');
    fetchStorageDataFromBackground('knownMethod');
    fetchStorageDataFromBackground('preference');
    fetchStorageDataFromBackground('networkStore');
    fetchStorageDataFromBackground('customNetworksStore');
    fetchStorageDataFromBackground('latestBlockData');

    /**
     * For Lastest Block Datahub Service use
     * not fetching data if page are closed
     */
    eventBus.emit(EVENTS.broadcastToBackground, {
      method: 'UI_STATUS',
      data: true,
    });
    window.addEventListener('beforeunload', onPageUnloadDisablePollingBlocks);

    return () => {
      eventBus.removeEventListener(
        'dataSyncService.transactionHistory',
        onTxServiceBackgroundMessage
      );
      eventBus.removeEventListener(
        'dataSyncService.cosmosTxHistory',
        onCosmosTxHistoryUpdate
      );
      eventBus.removeEventListener(
        'dataSyncService.tokenStore',
        onTxServiceBackgroundMessage
      );
      eventBus.removeEventListener(
        'dataSyncService.knownMethod',
        onTxServiceBackgroundMessage
      );
      eventBus.removeEventListener(
        'dataSyncService.preference',
        onPreferenceUpdate
      );
      eventBus.removeEventListener(
        'dataSyncService.networkStore',
        onNetworkStore
      );
      eventBus.removeEventListener(
        'dataSyncService.customNetworksStore',
        onCustomNetworksStore
      );
      eventBus.removeEventListener(
        'dataSyncService.latestBlockData',
        onCurrentBlockStore
      );

      window.removeEventListener(
        'beforeunload',
        onPageUnloadDisablePollingBlocks
      );
    };
  }, []);

  return null;
}
