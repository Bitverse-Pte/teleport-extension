import { CosmosChainInfo } from 'types/cosmos';
import { Ecosystem, Provider } from 'types/network';

export function parsedKeplrChainInfoAsTeleportCosmosProvider(
  chainInfo: CosmosChainInfo
): Provider {
  return {
    id: chainInfo.chainId,
    type: 'rpc',
    rpcUrl: chainInfo.rpc,
    chainId: chainInfo.chainId,
    ticker: (
      chainInfo.currencies[0] ||
      chainInfo.feeCurrencies[0] ||
      chainInfo.stakeCurrency
    ).coinDenom,
    nickname: 'Cosmos Hub',
    rpcPrefs: {},
    chainName: 'COSMOS',
    coinType: chainInfo.bip44.coinType,
    ecosystem: Ecosystem.COSMOS,
    prefix: chainInfo.bech32Config,
    ecoSystemParams: {
      rest: chainInfo.rest,
      stakeCurrency: chainInfo.stakeCurrency,
      walletUrl: chainInfo.walletUrl,
      walletUrlForStaking: chainInfo.walletUrlForStaking,
      currencies: chainInfo.currencies,
      feeCurrencies: chainInfo.feeCurrencies,
      features: chainInfo.features,
      gasPriceStep: chainInfo.gasPriceStep,
      alternativeBIP44s: chainInfo.alternativeBIP44s,
    },
  };
}
