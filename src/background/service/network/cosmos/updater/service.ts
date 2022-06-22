// import { inject, singleton, delay } from "tsyringe";
// import { TYPES } from "../types";

import Axios from 'axios';
// import { KVStore } from "@keplr-wallet/common";
// import { ChainsService } from "../chains";
import NetworkPreferenceService from '../../network';
import { CosmosParams, Ecosystem, Provider } from 'types/network';
import { ObservableStorage } from 'background/utils/obsStorage';
import { ChainIdHelper } from 'utils/cosmos/chainId';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';

// @singleton()
export class CosmosChainUpdaterService {
  kvStore: ObservableStorage<Record<string, Partial<Provider>>>;

  constructor(
    // @inject(delay(() => ChainsService))
    // protected readonly chainsService: ChainsService
    protected readonly chainsService: typeof NetworkPreferenceService
  ) {
    this.kvStore = new ObservableStorage('cosmos_chain_updated_properties', {});

    chainsService.networkStore.subscribe(async ({ provider }) => {
      if (provider.ecosystem !== Ecosystem.COSMOS) return;
      await this.tryUpdateChain(provider.chainId);
    });
  }

  putUpdatedPropertyToProvider(chainInfo: Provider): Provider {
    const updatedProperty = this.getUpdatedChainProperty(chainInfo.chainId);

    const chainId = ChainIdHelper.parse(chainInfo.chainId);
    const updatedChainId = ChainIdHelper.parse(
      updatedProperty.chainId || chainInfo.chainId
    );

    // If the saved property is lesser than the current chain id, just ignore.
    if (updatedChainId.version < chainId.version) {
      return chainInfo;
    }

    const features = chainInfo.ecoSystemParams?.features ?? [];
    for (const updatedFeature of updatedProperty.ecoSystemParams?.features ??
      []) {
      if (!features.includes(updatedFeature)) {
        features.push(updatedFeature);
      }
    }

    return {
      ...chainInfo,
      chainId: updatedProperty.chainId || chainInfo.chainId,
      ecoSystemParams: {
        ...(chainInfo.ecoSystemParams as CosmosParams),
        features,
      },
    };
  }

  async clearUpdatedProperty(chainId: string) {
    this.kvStore.updateState({
      [ChainIdHelper.parse(chainId).identifier]: undefined,
    });

    // this.chainsService.clearCachedProviders();
  }

  async tryUpdateChain(chainId: string) {
    console.debug('CosmosChainUpdate::tryUpdateChain: started');
    try {
      const chainInfo = this.chainsService.getCosmosChainInfo(chainId);

      // If chain id is not fomatted as {chainID}-{version},
      // there is no way to deal with the updated chain id.
      if (!ChainIdHelper.hasChainVersion(chainInfo.chainId)) {
        console.debug(
          'CosmosChainUpdate::tryUpdateChain: exit due to no version in chainId:',
          chainInfo.chainId
        );
        return;
      }

      const updates = await CosmosChainUpdaterService.checkChainUpdate(
        chainInfo
      );
      console.debug('CosmosChainUpdate::tryUpdateChain::updates:', updates);

      if (updates.explicit || updates.slient) {
        const currentVersion = ChainIdHelper.parse(chainInfo.chainId);

        if (updates.chainId) {
          const fetchedChainId = updates.chainId;
          const fetchedVersion = ChainIdHelper.parse(fetchedChainId);

          if (
            currentVersion.identifier === fetchedVersion.identifier &&
            currentVersion.version < fetchedVersion.version
          ) {
            await this.saveChainProperty(currentVersion.identifier, {
              chainId: fetchedChainId,
            });
          }
        }

        if (updates.features && updates.features.length > 0) {
          const savedChainProperty = this.getUpdatedChainProperty(
            chainInfo.chainId
          );

          const updateFeatures =
            savedChainProperty.ecoSystemParams?.features ?? [];

          for (const feature of updates.features) {
            if (!updateFeatures.includes(feature)) {
              updateFeatures.push(feature);
            }
          }

          console.debug(
            'CosmosChainUpdate::tryUpdateChain::updateFeatures:',
            updateFeatures
          );

          this.saveChainEcoSystemProperty(currentVersion.identifier, {
            features: updateFeatures,
          });
        }
      }
    } catch (error: any) {
      if (error.message.startsWith('There is no cosmos chain info for')) {
        console.warn(
          'unable to tryUpdateChain, since no match network found, maybe the app is initializing.'
        );
      } else {
        console.error('tryUpdateChain::error: ', error);
      }
    }
  }

  private getUpdatedChainProperty(chainId: string): Partial<Provider> {
    const version = ChainIdHelper.parse(chainId);

    return this.loadChainProperty(version.identifier);
  }

  private async saveChainProperty(
    identifier: string,
    chainInfo: Partial<Provider>
  ) {
    const saved = this.loadChainProperty(identifier);

    this.kvStore.updateState({
      [identifier]: {
        ...saved,
        ...chainInfo,
      },
    });

    // this.chainsService.clearCachedProviders();
  }

  private saveChainEcoSystemProperty(
    identifier: string,
    chainInfo: Partial<Provider['ecoSystemParams']>
  ) {
    const saved = this.loadChainProperty(identifier);

    this.kvStore.updateState({
      [identifier]: {
        ...saved,
        ...chainInfo,
      },
    });

    // this.chainsService.clearCachedProviders();
  }

  private loadChainProperty(identifier: string): Partial<Provider> {
    const state = this.kvStore.getState();
    const chainInfo = state[identifier];
    if (!chainInfo) return {};
    return chainInfo;
  }

  /**
   * Returns wether the chain has been changed.
   * Currently, only check the chain id has been changed.
   * @param chainInfo Chain information.
   */
  public static async checkChainUpdate(chainInfo: Readonly<Provider>): Promise<{
    explicit: boolean;
    slient: boolean;

    chainId?: string;
    features?: string[];
  }> {
    const chainId = chainInfo.chainId;

    // If chain id is not fomatted as {chainID}-{version},
    // there is no way to deal with the updated chain id.
    if (!ChainIdHelper.hasChainVersion(chainId)) {
      return {
        explicit: false,
        slient: false,
      };
    }

    const instance = Axios.create({
      baseURL: chainInfo.rpcUrl,
      adapter: fetchAdapter,
    });

    // Get the status to get the chain id.
    const result = await instance.get<{
      result: {
        node_info: {
          network: string;
        };
      };
    }>('/status');

    const resultChainId = result.data.result.node_info.network;

    const version = ChainIdHelper.parse(chainId);
    const fetchedVersion = ChainIdHelper.parse(resultChainId);

    // TODO: Should throw an error?
    if (version.identifier !== fetchedVersion.identifier) {
      return {
        explicit: false,
        slient: false,
      };
    }

    const restInstance = Axios.create({
      baseURL: chainInfo.ecoSystemParams?.rest,
      adapter: fetchAdapter,
    });

    let ibcGoUpdates = false;
    try {
      if (
        !chainInfo.ecoSystemParams?.features ||
        !chainInfo.ecoSystemParams?.features.includes('ibc-go')
      ) {
        // If the chain uses the ibc-go module separated from the cosmos-sdk,
        // we need to check it because the REST API is different.
        const result = await restInstance.get<{
          params: {
            receive_enabled: boolean;
            send_enabled: boolean;
          };
        }>('/ibc/apps/transfer/v1/params');

        if (result.status === 200) {
          ibcGoUpdates = true;
        }
      }
    } catch (error) {
      console.error('/ibc/apps/transfer/v1/params::error', error);
    }

    let ibcTransferUpdate = false;
    try {
      if (
        !chainInfo.ecoSystemParams?.features ||
        !chainInfo.ecoSystemParams?.features.includes('ibc-transfer')
      ) {
        const isIBCGo =
          ibcGoUpdates ||
          (chainInfo.ecoSystemParams?.features &&
            chainInfo.ecoSystemParams?.features.includes('ibc-go'));

        // If the chain doesn't have the ibc transfer feature,
        // try to fetch the params of ibc transfer module.
        // assume that it can support the ibc transfer if the params return true, and try to update the features.
        const result = await restInstance.get<{
          params: {
            receive_enabled: boolean;
            send_enabled: boolean;
          };
        }>(
          isIBCGo
            ? '/ibc/apps/transfer/v1/params'
            : '/ibc/applications/transfer/v1beta1/params'
        );
        if (
          result.data.params.receive_enabled &&
          result.data.params.send_enabled
        ) {
          ibcTransferUpdate = true;
        }
      }
    } catch (error) {
      console.error('ibcTransferUpdate:: error', error);
    }

    let wasmd24Update = false;
    try {
      if (
        chainInfo.ecoSystemParams?.features?.includes('cosmwasm') &&
        !chainInfo.ecoSystemParams?.features.includes('wasmd_0.24+')
      ) {
        // It is difficult to decide which contract address to test on each chain.
        // So it simply sends a query that fails unconditionally.
        // However, if 400 bad request instead of 501 occurs, the url itself exists.
        // In this case, it is assumed that wasmd 0.24+ version.
        const result = await restInstance.get(
          '/cosmwasm/wasm/v1/contract/test/smart/test',
          {
            validateStatus: (status) => {
              return status === 400 || status === 501;
            },
          }
        );
        if (result.status === 400) {
          wasmd24Update = true;
        }
      }
    } catch (error) {
      console.error('/cosmwasm/wasm/v1/contract/test/smart/test', error);
    }

    const features: string[] = [];
    if (ibcGoUpdates) {
      features.push('ibc-go');
    }
    if (ibcTransferUpdate) {
      features.push('ibc-transfer');
    }
    if (wasmd24Update) {
      features.push('wasmd_0.24+');
    }

    return {
      explicit: version.version < fetchedVersion.version,
      slient: features.length > 0,

      chainId: resultChainId,
      features,
    };
  }
}
