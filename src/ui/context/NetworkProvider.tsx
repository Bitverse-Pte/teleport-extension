import { defaultNetworks, PresetNetworkId } from 'constants/defaultNetwork';
import { CoinType, NetworkController, Provider } from 'types/network';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInterval } from 'react-use';
import { useWallet } from '../utils';
import {
  hideLoadingIndicator,
  showLoadingIndicator,
} from 'ui/reducer/appState.reducer';
import {
  getCustomProvidersSelector,
  getEnabledProvidersSelector,
} from 'ui/selectors/network.selector';

/**
 * Design was based on MetaMask
 */
export const NetworkProviderContext = React.createContext<{
  /**
   * `currentNetworkController` is the network that user currently selected
   */
  currentNetworkController: NetworkController | null;
  /**
   * `customProviders` is the network providers that user saved
   */
  customProviders: Provider[];
  /**
   * All provider (custom and preset)
   */
  enabledProviders: Provider[];
  /**
   * useProviderById can switch the selected network to the specific provider
   */
  useProviderById: (networkId: PresetNetworkId | string) => Promise<any>;

  // you can create / edit / remove custom network
  addCustomProvider: (
    nickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string
  ) => Promise<any>;
  editCustomProvider: (
    providerId: string,
    newNickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string
  ) => Promise<any>;
  removeCustomProvider: (idToBeRemoved: string) => Promise<any>;
  getAllProviders: () => Promise<Provider[]>;
} | null>(null);

/**
 * NetworkStoreProvider
 * @param childrens  children elements into be injected
 * @returns
 */
export function NetworkStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallet = useWallet();

  const dispatch = useDispatch();

  const currentNetworkController = useSelector((state) => state.network);

  const customProviders = useSelector(getCustomProvidersSelector);

  const useProviderById = useCallback(
    async (networkId: string) => {
      dispatch(showLoadingIndicator());
      try {
        await wallet.useProviderById(networkId);
        await wallet.fetchLatestBlockDataNow();
      } catch (error) {
        console.error('useProviderById::error', error);
      } finally {
        dispatch(hideLoadingIndicator());
      }
    },
    [wallet, customProviders]
  );

  const editCustomProvider = useCallback(
    async (
      networkId: string,
      newNickname: string,
      rpcUrl: string,
      chainId: string,
      ticker?: string,
      blockExplorerUrl?: string,
      coinType = CoinType.ETH
    ) => {
      await wallet.editCustomNetwork(
        networkId,
        newNickname,
        rpcUrl,
        chainId,
        ticker,
        blockExplorerUrl,
        coinType
      );
    },
    [wallet]
  );

  const getAllProviders = useCallback(() => {
    return wallet.getAllProviders() as Promise<Provider[]>;
  }, [wallet]);

  const addCustomProvider = useCallback(
    async (
      nickname: string,
      rpcUrl: string,
      chainId: string,
      ticker?: string,
      blockExplorerUrl?: string,
      coinType = CoinType.ETH
    ) => {
      dispatch(showLoadingIndicator());
      try {
        await wallet.addCustomNetwork(
          nickname,
          rpcUrl,
          chainId,
          ticker,
          blockExplorerUrl,
          coinType
        );
        await wallet.fetchLatestBlockDataNow();
      } catch (error) {
        console.error('addCustomProvider::error', error);
      } finally {
        dispatch(hideLoadingIndicator());
      }
    },
    [wallet]
  );

  const removeCustomProvider = useCallback(
    async (idToBeRemoved: string) => {
      await wallet.removeCustomNetwork(idToBeRemoved);
    },
    [wallet]
  );

  const enabledProviders = useSelector(getEnabledProvidersSelector);

  const store = useMemo(
    () => ({
      currentNetworkController,
      customProviders,
      useProviderById,
      removeCustomProvider,
      editCustomProvider,
      enabledProviders,
      addCustomProvider,
      getAllProviders,
    }),
    [
      currentNetworkController,
      customProviders,
      useProviderById,
      enabledProviders,
      editCustomProvider,
      removeCustomProvider,
      addCustomProvider,
      getAllProviders,
    ]
  );

  return (
    <NetworkProviderContext.Provider value={store}>
      {children}
    </NetworkProviderContext.Provider>
  );
}
