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
import { Network, NetworkController } from 'types/network';
import { updateNetworkController } from 'ui/reducer/network.reducer';
import { setCustomNetworks } from 'ui/reducer/customNetwork.reducer';
import {
  setCurrentGasLimit,
  setGasFeeEstimates,
} from 'ui/reducer/block.reducer';

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
    const onCustomNetworksStore = (s: Record<number, Network>) => {
      dispatch(
        setCustomNetworks(
          Object.values(s).map((v) => ({
            ...v,
            type: 'rpc',
          }))
        )
      );
    };
    const onCurrentBlockStore = (s: {
      currentBlockGasLimit: string;
      gasFeeEstimates: any;
      isBaseFeePerGasExist: boolean;
    }) => {
      dispatch(setCurrentGasLimit(s.currentBlockGasLimit));
      dispatch(setGasFeeEstimates(s.gasFeeEstimates));
    };
    eventBus.addEventListener(
      'dataSyncService.transactionHistory',
      onTxServiceBackgroundMessage
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
