import { CosmosAccount } from './tx';
import { CosChainInfo } from './types';
import { AccountSetBaseSuper } from './base';

const cosmosTxFn = (networkPreferenceService) => {
  const {
    rpcUrl,
    chainId,
    ecoSystemParams,
    prefix: bech32Config,
    coinType,
  } = networkPreferenceService.getProviderConfig();
  // console.log('-----------rpcUrl, chainId: -----------', rpcUrl, chainId, coinType);
  const cosChainInfo = {
    rpc: rpcUrl,
    chainId,
    rest: ecoSystemParams?.rest,
    bech32Config,
    coinType,
  } as CosChainInfo;

  const accountSetBase = new AccountSetBaseSuper(chainId, {
    suggestChain: false,
    autoInit: true,
  });

  const cosmosAccountFn = CosmosAccount.use({
    msgOptsCreator: (chainId) => {
      // In certik, change the msg type of the MsgSend to "bank/MsgSend"
      if (chainId.startsWith('shentu-')) {
        return {
          send: {
            native: {
              type: 'bank/MsgSend',
            },
          },
        };
      }

      // In akash or sifchain, increase the default gas for sending
      if (chainId.startsWith('akashnet-') || chainId.startsWith('sifchain')) {
        return {
          send: {
            native: {
              gas: 120000,
            },
          },
        };
      }

      if (chainId.startsWith('secret-')) {
        return {
          send: {
            native: {
              gas: 20000,
            },
          },
          withdrawRewards: {
            gas: 25000,
          },
        };
      }

      // For terra related chains
      if (chainId.startsWith('bombay-') || chainId.startsWith('columbus-')) {
        return {
          send: {
            native: {
              type: 'bank/MsgSend',
            },
          },
        };
      }

      if (chainId.startsWith('evmos_')) {
        return {
          send: {
            native: {
              gas: 140000,
            },
          },
          withdrawRewards: {
            gas: 200000,
          },
        };
      }

      if (chainId.startsWith('osmosis')) {
        return {
          send: {
            native: {
              gas: 100000,
            },
          },
          withdrawRewards: {
            gas: 300000,
          },
        };
      }

      if (chainId.startsWith('stargaze-')) {
        return {
          send: {
            native: {
              gas: 100000,
            },
          },
          withdrawRewards: {
            gas: 200000,
          },
        };
      }
    },
  });

  const cosmosAccount = cosmosAccountFn(accountSetBase, cosChainInfo, chainId);
  return cosmosAccount;
};

export default cosmosTxFn;
