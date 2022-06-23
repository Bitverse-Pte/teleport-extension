import { CosmosAppCurrency, CosmosChainInfo } from 'types/cosmos';

export type CosmosTx = {
  id: string;
  status: string;
  chainInfo: Partial<CosmosChainInfo>;
  timestamp: number;
  account?: any;
  aminoMsgs?: any[];
  fee?: Partial<{
    amount: {
      amount: string;
      denom: string;
    }[];
    gas: string;
  }>;
  memo?: string;
  mode?: string;
  currency?: CosmosAppCurrency;
  tx_hash?: string;
};

export const MockCosmosTxHistory: Record<string, CosmosTx | undefined> = {
  _pBWBbRUSHFMqiBDW6xcd: {
    tx_hash: '114SB51H41SA9A198SX1ASDUNASD0',
    account: {
      '@type': '/cosmos.auth.v1beta1.BaseAccount',
      account_number: '539983',
      address: 'osmo1zcph3rkpnjpdyjdzd98yds2l4wn68spajxxfay',
      pub_key: {
        '@type': '/cosmos.crypto.secp256k1.PubKey',
        key: 'Ar4k8DYul1h6HIF3WeG7i8gw7c6NnMdbxJnutgRQOZX/',
      },
      sequence: '11',
    },
    aminoMsgs: [
      {
        type: 'cosmos-sdk/MsgSend',
        value: {
          amount: [
            {
              amount: '100',
              denom: 'uosmo',
            },
          ],
          from_address: 'osmo1zcph3rkpnjpdyjdzd98yds2l4wn68spajxxfay',
          to_address: 'cosmos17lds9mrleuqq3g88wwkxt4x97q6mcg80328azd',
        },
      },
    ],
    chainInfo: {
      bech32Config: {
        bech32PrefixAccAddr: 'osmo',
        bech32PrefixAccPub: 'osmopub',
        bech32PrefixConsAddr: 'osmovalcons',
        bech32PrefixConsPub: 'osmovalconspub',
        bech32PrefixValAddr: 'osmovaloper',
        bech32PrefixValPub: 'osmovaloperpub',
      },
      chainId: 'osmosis-1',
      coinType: 118,
      rest: 'https://lcd-osmosis.keplr.app',
      rpc: 'https://rpc-osmosis.keplr.app',
    },
    currency: {
      coinDecimals: 6,
      coinDenom: 'OSMO',
      coinGeckoId: 'osmosis',
      coinMinimalDenom: 'uosmo',
    },
    fee: {
      amount: [
        {
          amount: '2500',
          denom: 'uosmo',
        },
      ],
      gas: '200000',
    },
    id: '_pBWBbRUSHFMqiBDW6xcd',
    memo: 'test2',
    mode: 'sync',
    status: 'signed',
    timestamp: 1655802042037,
  },
};
