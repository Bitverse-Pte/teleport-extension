import { EVENTS } from 'constants/index';
import { defaultNetworks } from 'constants/defaultNetwork';
import eventBus from 'eventBus';
import {
  CoinType,
  NetworkBg2UIMessage,
  NetworkController,
  Provider,
} from 'types/network';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useInterval } from 'react-use';
import { setCustomNetworks } from '../reducer/customNetwork.reducer';
import { updateNetworkController } from '../reducer/network.reducer';
import { useWallet } from '../utils';

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
    category: string,
    ticker?: string,
    blockExplorerUrl?: string
  ) => Promise<any>;
  editCustomProvider: (
    matchedIdx: number,
    newNickname: string,
    rpcUrl: string,
    chainId: string,
    category: string,
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
  const setCurrentNetworkController = (newCtler: NetworkController) => {
    dispatch(updateNetworkController(newCtler));
  };

  const customProviders = useSelector((state) => state.customNetworks);
  const setCustomProviders = (ps: Provider[]) => {
    dispatch(setCustomNetworks(ps));
  };

  useInterval(() => {
    fetch1559ImplFromBackground();
  }, 1000 * 60);

  const fetch1559ImplFromBackground = useCallback(async () => {
    await wallet._update1559ImplForCurrentProvider();
  }, [wallet]);

  // const fetchNetworkFromBackground = () => port?.postMessage({ type: 'fetch' })
  // const fetchCustomProvidersFromBackground = () => port?.postMessage({ type: 'fetch_custom_network' })
  const fetchThemFromBackground = () =>
    eventBus.emit(EVENTS.broadcastToBackground, {
      method: 'fetchNetworkServiceData',
      data: {
        type: 'fetch_all',
      },
    });

  useEffect(() => {
    // only for the beginning of this hook
    const onBackgroundMessage = (message: NetworkBg2UIMessage) => {
      switch (message.type) {
        case 'update': {
          setCurrentNetworkController(message.data);
          break;
        }
        case 'update_all': {
          setCurrentNetworkController(message.data.ctrler);
          setCustomProviders(
            message.data.customNetworks.map((v) => ({
              ...v,
              type: 'rpc',
            }))
          );
          break;
        }
        case 'update_custom_network': {
          setCustomProviders(
            message.data.map((v) => ({
              ...v,
              type: 'rpc',
            }))
          );
          break;
        }
      }
    };
    eventBus.addEventListener('syncNetworkServiceData', onBackgroundMessage);
    fetchThemFromBackground();
    return () => {
      eventBus.removeEventListener(
        'syncNetworkServiceData',
        onBackgroundMessage
      );
    };
  }, []);

  const getCustomProvider = useCallback(
    (matchedIdx: number) => {
      return customProviders[matchedIdx];
    },
    [customProviders]
  );

  const useCustomProvider = useCallback(
    async (matchedIdx: number) => {
      await wallet.useCustomNetwork(matchedIdx);
    },
    [wallet, customProviders]
  );

  const editCustomProvider = useCallback(
    async (
      matchedIdx: number,
      newNickname: string,
      rpcUrl: string,
      chainId: string,
      category: string,
      ticker?: string,
      blockExplorerUrl?: string,
      isEthereumCompatible = true,
      coinType = CoinType.ETH
    ) => {
      await wallet.editCustomNetwork(
        matchedIdx,
        newNickname,
        rpcUrl,
        chainId,
        category,
        ticker,
        blockExplorerUrl,
        isEthereumCompatible,
        coinType
      );
    },
    [wallet]
  );

  const usePresetProvider = useCallback(
    async (chain: string) => {
      await wallet.useDefaultNetwork(chain);
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
      category: string,
      ticker?: string,
      blockExplorerUrl?: string,
      isEthereumCompatible = true,
      coinType = CoinType.ETH
    ) => {
      await wallet.addCustomNetwork(
        nickname,
        rpcUrl,
        chainId,
        category,
        ticker,
        blockExplorerUrl,
        isEthereumCompatible,
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
