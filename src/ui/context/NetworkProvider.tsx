import { defaultNetworks } from 'constants/defaultNetwork';
import { CoinType, NetworkController, Provider } from 'types/network';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInterval } from 'react-use';
import { useWallet } from '../utils';
import {
  hideLoadingIndicator,
  showLoadingIndicator,
} from 'ui/reducer/appState.reducer';

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
   * useCustomProvider can switch the selected network to provided CustomProvider
   */
  useCustomProvider: (matchedIdx: number) => Promise<any>;
  /**
   * `getCustomProvider` can give you access to the Provider's data
   */
  getCustomProvider: (matchedIdx: number) => Provider;
  /**
   * use this to switch preset networks
   */
  usePresetProvider: (chain: string) => Promise<any>;

  // you can create / edit / remove custom network
  addCustomProvider: (
    nickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string
  ) => Promise<any>;
  editCustomProvider: (
    matchedIdx: number,
    newNickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string
  ) => Promise<any>;
  removeCustomProvider: (idxToBeRemoved: number) => Promise<any>;
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

  const customProviders = useSelector((state) => state.customNetworks);

  const getCustomProvider = useCallback(
    (matchedIdx: number) => {
      return customProviders[matchedIdx];
    },
    [customProviders]
  );

  const useCustomProvider = useCallback(
    async (matchedIdx: number) => {
      dispatch(showLoadingIndicator());
      try {
        await wallet.useCustomNetwork(matchedIdx);
        await wallet.fetchLatestBlockDataNow();
      } catch (error) {
        console.error('useCustomProvider::error', error);
      } finally {
        dispatch(hideLoadingIndicator());
      }
    },
    [wallet, customProviders]
  );

  const editCustomProvider = useCallback(
    async (
      matchedIdx: number,
      newNickname: string,
      rpcUrl: string,
      chainId: string,
      ticker?: string,
      blockExplorerUrl?: string,
      coinType = CoinType.ETH
    ) => {
      await wallet.editCustomNetwork(
        matchedIdx,
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

  const usePresetProvider = useCallback(
    async (chain: string) => {
      dispatch(showLoadingIndicator());
      try {
        await wallet.useDefaultNetwork(chain);
        await wallet.fetchLatestBlockDataNow();
      } catch (error) {
        console.error('usePresetProvider::error:', error);
      } finally {
        dispatch(hideLoadingIndicator());
      }
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
      await wallet.addCustomNetwork(
        nickname,
        rpcUrl,
        chainId,
        ticker,
        blockExplorerUrl,
        coinType
      );
    },
    [wallet]
  );

  const removeCustomProvider = useCallback(
    async (idxToBeRemoved: number) => {
      await wallet.removeCustomNetwork(idxToBeRemoved);
    },
    [wallet]
  );

  const enabledProviders = useMemo(() => {
    const presetProviders = Object.values(defaultNetworks).filter((val) => {
      // no null, undefined and no empty object
      return Boolean(val) && Object.keys(val).length > 0;
    });
    return [...presetProviders, ...customProviders];
  }, [customProviders]);

  const store = useMemo(
    () => ({
      currentNetworkController,
      customProviders,
      useCustomProvider,
      usePresetProvider,
      getCustomProvider,
      removeCustomProvider,
      editCustomProvider,
      enabledProviders,
      addCustomProvider,
      getAllProviders,
    }),
    [
      currentNetworkController,
      customProviders,
      useCustomProvider,
      usePresetProvider,
      getCustomProvider,
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
