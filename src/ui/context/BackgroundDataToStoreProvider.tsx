import { ITokenStore, Token } from 'types/token';
import { EVENTS } from 'constants/index';
import eventBus from 'eventBus';
import { Transaction, TransactionHistoryStore } from 'constants/transaction';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTokens, setTokenServiceState } from '../reducer/token.reducer';
import { setTransactions } from '../reducer/transactions.reducer';
import { useWallet } from '../utils';
import { KnownMethodDict } from 'background/service/knownMethod';
import { useInterval } from 'react-use';
import { updateKnownMethods } from 'ui/reducer/knownMethod.reducer';
import { updatePreferences } from 'ui/reducer/preference.reducer';

type TxStore = Record<string, Transaction>;

/**
 * BackgroundDataToStoreProvider
 * @param childrens  children elements into be injected
 * @returns
 */
export function BackgroundDataToStoreProvider({
  children,
}: {
  children: JSX.Element;
}) {
  const dispatch = useDispatch();
  const walletBg = useWallet();

  const fetchStorageDataFromBackground = (storageName: string) =>
    eventBus.emit(EVENTS.broadcastToBackground, {
      method: `dataSyncService.fetch.${storageName}`,
    });

  const fetchPreferenceStore = useCallback(async () => {
    const s = await walletBg.getPreferenceStore();
    dispatch(updatePreferences(s));
  }, [walletBg]);

  useInterval(() => {
    // fetch PreferenceStore every second since it's not stream based store
    fetchPreferenceStore();
    // I do not want to exceed eventBus, so 3 sec delay
  }, 1000 * 3);

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
    // not in dataSyncService
    // eventBus.addEventListener('onPreferenceUpdate', onPreferenceUpdate)
    fetchStorageDataFromBackground('transactionHistory');
    fetchStorageDataFromBackground('tokenStore');
    fetchStorageDataFromBackground('knownMethod');
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
      // not in dataSyncService
      // eventBus.removeEventListener('onPreferenceUpdate', onPreferenceUpdate)
    };
  }, []);

  return children;
}
