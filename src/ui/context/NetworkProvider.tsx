import { defaultNetworks, PresetNetworkId } from 'constants/defaultNetwork';
import {
  CoinType,
  Ecosystem,
  NetworkController,
  Provider,
} from 'types/network';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWallet } from '../utils';
import {
  hideLoadingIndicator,
  showLoadingIndicator,
} from 'ui/reducer/appState.reducer';
import {
  getCustomProvidersSelector,
  getEnabledProvidersSelector,
} from 'ui/selectors/network.selector';
import { ErrorCode } from 'constants/code';

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
  useProviderById: (networkId: PresetNetworkId | string) => Promise<Provider>;

  // you can create / edit / remove custom network
  addCustomEthereumProvider: (
    nickname: string,
    rpcUrl: string,
    chainId: string,
    ticker?: string,
    blockExplorerUrl?: string
  ) => Promise<any>;
  editCustomEthereumProvider: (
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

export function NetworkErrorCodeToMessageKey(code?: ErrorCode) {
  switch (code) {
    case ErrorCode.ACCOUNT_DOES_NOT_EXIST:
      return 'SWITCH_PROVIDER_ACCOUNT_DOES_NOT_EXIST';
    case ErrorCode.NORMAL_WALLET_SWITCH_EVM_ONLY:
      return 'NORMAL_WALLET_SWITCH_EVM_ONLY';
    default:
      return 'UNCAUGHT_NETWORK_ERROR';
  }
}

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
        const provider = await wallet.useProviderById(networkId);
        if (provider.ecosystem === Ecosystem.EVM)
          await wallet.fetchLatestBlockDataNow();
        return provider;
      } catch (error: any) {
        console.error('useProviderById::error', error);
        throw error;
      } finally {
        dispatch(hideLoadingIndicator());
      }
    },
    [wallet, customProviders]
  );

  const editCustomEthereumProvider = useCallback(
    async (
      networkId: string,
      newNickname: string,
      rpcUrl: string,
      chainId: string,
      ticker?: string,
      blockExplorerUrl?: string,
      coinType = CoinType.ETH
    ) => {
      await wallet.editCustomEthereumProvider(
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

  const addCustomEthereumProvider = useCallback(
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
        await wallet.addCustomEthereumProvider(
          nickname,
          rpcUrl,
          chainId,
          ticker,
          blockExplorerUrl,
          coinType
        );
        await wallet.fetchLatestBlockDataNow();
      } catch (error) {
        console.error('addCustomEthereumProvider::error', error);
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
      editCustomEthereumProvider,
      enabledProviders,
      addCustomEthereumProvider,
      getAllProviders,
    }),
    [
      currentNetworkController,
      customProviders,
      useProviderById,
      enabledProviders,
      editCustomEthereumProvider,
      removeCustomProvider,
      addCustomEthereumProvider,
      getAllProviders,
    ]
  );

  return (
    <NetworkProviderContext.Provider value={store}>
      {children}
    </NetworkProviderContext.Provider>
  );
}
