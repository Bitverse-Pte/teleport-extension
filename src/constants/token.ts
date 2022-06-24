import { Token } from 'types/token';
import { PresetNetworkId } from 'constants/defaultNetwork';
import { Bech32Address } from '@keplr-wallet/cosmos';
import { ChainInfo } from '@keplr-wallet/types';

export const DEFAULT_TOKEN_CONFIG: Token[] = [
  {
    symbol: 'ETH',
    decimal: 18,
    name: 'ETH',
    denom: 'wei',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'USDT',
    decimal: 6,
    name: 'USDT',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',

    display: true,
  },

  {
    symbol: 'USDC',
    decimal: 6,
    name: 'USDC',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',

    display: true,
  },
  {
    symbol: 'UNI',
    decimal: 18,
    name: 'UNI',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',

    display: true,
  },

  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',

    display: true,
  },

  {
    symbol: 'BIT',
    decimal: 18,
    name: 'BIT',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5',

    display: true,
  },

  {
    symbol: 'TUSD',
    decimal: 18,
    name: 'TUSD',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x0000000000085d4780B73119b644AE5ecd22b376',

    display: true,
  },
  {
    symbol: 'BNB',
    decimal: 18,
    name: 'BNB',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.BSC,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'WBNB',
    decimal: 18,
    name: 'WBNB',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',

    display: true,
  },

  {
    symbol: 'USDT',
    decimal: 18,
    name: 'BSC-USD',
    denom: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/USDT-6D8/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x55d398326f99059ff775485246999027b3197955',

    display: true,
  },
  {
    symbol: 'CAKE',
    decimal: 18,
    name: 'CAKE',
    denom: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/CAKE-435/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',

    display: true,
  },
  {
    symbol: 'ETH',
    decimal: 18,
    name: 'ETH',
    denom: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/ETH-1C9/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',

    display: true,
  },
  {
    symbol: 'USDC',
    decimal: 18,
    name: 'USDC',
    denom: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/USDC-CD2/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',

    display: true,
  },
  {
    symbol: 'BUSD',
    decimal: 18,
    name: 'BUSD',
    denom: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',

    display: true,
  },
  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    denom: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/DAI-D75/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',

    display: true,
  },
  {
    symbol: 'TUSD',
    decimal: 18,
    name: 'TUSD',
    denom: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/TUSDB-888/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x14016e85a25aeb13065688cafb43044c2ef86784',

    display: true,
  },
  {
    symbol: 'MATIC',
    decimal: 18,
    name: 'MATIC',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'WETH',
    decimal: 18,
    name: 'WETH',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',

    display: true,
  },

  {
    symbol: 'USDT',
    decimal: 6,
    name: 'USDT',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',

    display: true,
  },
  {
    symbol: 'USDC',
    decimal: 6,
    name: 'USDC',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',

    display: true,
  },
  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',

    display: true,
  },
  {
    symbol: 'TUSD',
    decimal: 18,
    name: 'TUSD',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0x2e1ad108ff1d8c782fcbbb89aad783ac49586756',

    display: true,
  },
  {
    symbol: 'UNI',
    decimal: 18,
    name: 'UNI',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0xb33eaad8d922b1083446dc23f610c2567fb5180f',

    display: true,
  },
  {
    symbol: 'ETH',
    decimal: 18,
    name: 'ETH',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'USDT',
    decimal: 6,
    name: 'USDT',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',

    display: true,
  },

  {
    symbol: 'USDC',
    decimal: 6,
    name: 'USDC',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',

    display: true,
  },
  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',

    display: true,
  },
  {
    symbol: 'TUSD',
    decimal: 18,
    name: 'TUSD',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x4d15a3a2286d883af0aa1b3f21367843fac63e07',

    display: true,
  },
  {
    symbol: 'UNI',
    decimal: 18,
    name: 'UNI',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0',

    display: true,
  },
  {
    symbol: 'SUSHI',
    decimal: 18,
    name: 'SUSHI',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xd4d42f0b6def4ce0383636770ef773390d85c61a',

    display: true,
  },

  {
    symbol: 'FTM',
    decimal: 18,
    name: 'FTM',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.FTM,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'FETH',
    decimal: 18,
    name: 'FETH',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.FTM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x658b0c7613e890ee50b8c4bc6a3f41ef411208ad',

    display: true,
  },

  {
    symbol: 'USDC',
    decimal: 6,
    name: 'USDC',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.FTM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',

    display: true,
  },
  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.FTM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e',

    display: true,
  },
  {
    symbol: 'YFI',
    decimal: 18,
    name: 'YFI',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.FTM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x29b0Da86e484E1C0029B56e817912d778aC0EC69',

    display: true,
  },
  {
    symbol: 'AVAX',
    decimal: 18,
    name: 'AVAX',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'WAVAX',
    decimal: 18,
    name: 'WAVAX',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: false,
    isCustom: false,
    contractAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',

    display: true,
  },
  {
    symbol: 'USDT.e',
    decimal: 6,
    name: 'USDT.e',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: false,
    isCustom: false,
    contractAddress: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',

    display: true,
  },
  {
    symbol: 'DAI.e',
    decimal: 18,
    name: 'DAI.e',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: false,
    isCustom: false,
    contractAddress: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',

    display: true,
  },
  {
    symbol: 'WETH.e',
    decimal: 18,
    name: 'WETH.e',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: false,
    isCustom: false,
    contractAddress: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',

    display: true,
  },
  {
    symbol: 'USDC.e',
    decimal: 6,
    name: 'USDC.e',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: false,
    isCustom: false,
    contractAddress: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',

    display: true,
  },
  {
    symbol: 'ETH',
    decimal: 18,
    name: 'ETH',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'OP',
    decimal: 18,
    name: 'OP',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: false,
    isCustom: false,
    contractAddress: '0x4200000000000000000000000000000000000042',

    display: true,
  },
  {
    symbol: 'OP',
    decimal: 18,
    name: 'OP',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: false,
    isCustom: false,
    contractAddress: '0x4200000000000000000000000000000000000042',
    display: true,
  },
  {
    symbol: 'USDT',
    decimal: 6,
    name: 'USDT',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: false,
    isCustom: false,
    contractAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',

    display: true,
  },
  {
    symbol: 'USDC',
    decimal: 6,
    name: 'USDC',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: false,
    isCustom: false,
    contractAddress: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',

    display: true,
  },
  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: false,
    isCustom: false,
    contractAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',

    display: true,
  },
  {
    symbol: 'Tele',
    decimal: 18,
    name: 'Tele',
    denom: '',
    icon: '',
    chainCustomId: PresetNetworkId.TELE_TEST,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'ATOM',
    decimal: 6,
    name: 'ATOM',
    denom: 'uatom',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cosmos/info/logo.png',
    chainCustomId: PresetNetworkId.COSMOS_HUB,
    isNative: true,
    isCustom: false,
    display: true,
  },
  {
    symbol: 'SCRT',
    decimal: 6,
    name: 'SCRT',
    denom: 'uscrt',
    icon: '',
    chainCustomId: PresetNetworkId.SECRET_NETWORK,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'OSMO',
    decimal: 6,
    name: 'OSMOSIS',
    denom: 'uosmo',
    icon: 'https://github.com/trustwallet/assets/blob/master/blockchains/osmosis/info/logo.png',
    chainCustomId: PresetNetworkId.OSMOSIS,
    isNative: true,
    isCustom: false,
    contractAddress: '',
    display: true,
  },
  {
    symbol: 'ION',
    decimal: 6,
    name: 'ION',
    denom: 'uion',
    icon: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmosis-ion.png',
    chainCustomId: PresetNetworkId.OSMOSIS,
    isNative: false,
    isCustom: false,
    contractAddress: '',
    display: true,
  },
  {
    symbol: 'JUNO',
    decimal: 6,
    name: 'JUNO',
    denom: 'ujuno',
    icon: '',
    chainCustomId: PresetNetworkId.JUNO,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'EVMOS',
    decimal: 6,
    name: 'EVMOS',
    denom: 'aevmos',
    icon: '',
    chainCustomId: PresetNetworkId.EVMOS,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'UMEE',
    decimal: 6,
    name: 'UMEE',
    denom: 'uumee',
    icon: '',
    chainCustomId: PresetNetworkId.UMEE,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'KAVA',
    decimal: 6,
    name: 'KAVA',
    denom: 'ukava',
    icon: 'https://github.com/trustwallet/assets/blob/master/blockchains/kava/info/logo.png',
    chainCustomId: PresetNetworkId.KAVA,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
  {
    symbol: 'CRO',
    decimal: 6,
    name: 'CRO',
    denom: 'basecro',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cronos/info/logo.png',
    chainCustomId: PresetNetworkId.CRYPTO_ORG,
    isNative: true,
    isCustom: false,
    contractAddress: '',

    display: true,
  },
];

export interface AppChainInfo extends ChainInfo {
  readonly chainSymbolImageUrl?: string;
  readonly hideInUI?: boolean;
  readonly txExplorer?: {
    readonly name: string;
    readonly txUrl: string;
  };
}

export const EmbedChainInfos: AppChainInfo[] = [
  {
    rpc: 'https://rpc-cosmoshub.keplr.app',
    rest: 'https://lcd-cosmoshub.keplr.app',
    chainId: 'cosmoshub-4',
    chainName: 'Cosmos Hub',
    stakeCurrency: {
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinDecimals: 6,
      coinGeckoId: 'cosmos',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('cosmos'),
    currencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
      },
    ],
    coinType: 118,
    features: ['ibc-transfer', 'ibc-go'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/atom.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/cosmos/txs/{txHash}',
    },
  },
  {
    rpc: 'https://rpc-osmosis.keplr.app',
    rest: 'https://lcd-osmosis.keplr.app',
    chainId: 'osmosis-1',
    chainName: 'Osmosis',
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('osmo'),
    currencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png',
      },
      {
        coinDenom: 'ION',
        coinMinimalDenom: 'uion',
        coinDecimals: 6,
        coinGeckoId: 'ion',
        coinImageUrl:
          'https://dhj8dql1kzq2v.cloudfront.net/white/osmosis-ion.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
        coinGeckoId: 'osmosis',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png',
      },
    ],
    coinType: 118,
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04,
    },
    features: ['ibc-transfer', 'ibc-go', 'cosmwasm'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/osmosis/txs/{txHash}',
    },
  },
  {
    rpc: 'https://rpc-secret.keplr.app',
    rest: 'https://lcd-secret.keplr.app',
    chainId: 'secret-3',
    chainName: 'Secret Network',
    stakeCurrency: {
      coinDenom: 'SCRT',
      coinMinimalDenom: 'uscrt',
      coinDecimals: 6,
      coinGeckoId: 'secret',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/secret.png',
    },
    bip44: {
      coinType: 529,
    },
    alternativeBIP44s: [
      {
        coinType: 118,
      },
    ],
    bech32Config: Bech32Address.defaultBech32Config('secret'),
    currencies: [
      {
        coinDenom: 'SCRT',
        coinMinimalDenom: 'uscrt',
        coinDecimals: 6,
        coinGeckoId: 'secret',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/secret.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'SCRT',
        coinMinimalDenom: 'uscrt',
        coinDecimals: 6,
        coinGeckoId: 'secret',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/secret.png',
      },
    ],
    coinType: 529,
    gasPriceStep: {
      low: 0.1,
      average: 0.25,
      high: 0.3,
    },
    chainSymbolImageUrl:
      'https://dhj8dql1kzq2v.cloudfront.net/white/secret.png',
    features: ['secretwasm'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-akash.keplr.app',
    rest: 'https://lcd-akash.keplr.app',
    chainId: 'akashnet-2',
    chainName: 'Akash',
    stakeCurrency: {
      coinDenom: 'AKT',
      coinMinimalDenom: 'uakt',
      coinDecimals: 6,
      coinGeckoId: 'akash-network',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/akash.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('akash'),
    currencies: [
      {
        coinDenom: 'AKT',
        coinMinimalDenom: 'uakt',
        coinDecimals: 6,
        coinGeckoId: 'akash-network',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/akash.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'AKT',
        coinMinimalDenom: 'uakt',
        coinDecimals: 6,
        coinGeckoId: 'akash-network',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/akash.png',
      },
    ],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/akash.png',
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-crypto-org.keplr.app',
    rest: 'https://lcd-crypto-org.keplr.app',
    chainId: 'crypto-org-chain-mainnet-1',
    chainName: 'Crypto.org',
    stakeCurrency: {
      coinDenom: 'CRO',
      coinMinimalDenom: 'basecro',
      coinDecimals: 8,
      coinGeckoId: 'crypto-com-chain',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/crypto-org.png',
    },
    bip44: {
      coinType: 394,
    },
    bech32Config: Bech32Address.defaultBech32Config('cro'),
    currencies: [
      {
        coinDenom: 'CRO',
        coinMinimalDenom: 'basecro',
        coinDecimals: 8,
        coinGeckoId: 'crypto-com-chain',
        coinImageUrl:
          'https://dhj8dql1kzq2v.cloudfront.net/white/crypto-org.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'CRO',
        coinMinimalDenom: 'basecro',
        coinDecimals: 8,
        coinGeckoId: 'crypto-com-chain',
        coinImageUrl:
          'https://dhj8dql1kzq2v.cloudfront.net/white/crypto-org.png',
      },
    ],
    gasPriceStep: {
      low: 0.025,
      average: 0.03,
      high: 0.04,
    },
    chainSymbolImageUrl:
      'https://dhj8dql1kzq2v.cloudfront.net/white/crypto-org.png',
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-iov.keplr.app',
    rest: 'https://lcd-iov.keplr.app',
    chainId: 'iov-mainnet-ibc',
    chainName: 'Starname',
    stakeCurrency: {
      coinDenom: 'IOV',
      coinMinimalDenom: 'uiov',
      coinDecimals: 6,
      coinGeckoId: 'starname',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/starname.png',
    },
    bip44: {
      coinType: 234,
    },
    bech32Config: Bech32Address.defaultBech32Config('star'),
    currencies: [
      {
        coinDenom: 'IOV',
        coinMinimalDenom: 'uiov',
        coinDecimals: 6,
        coinGeckoId: 'starname',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/starname.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'IOV',
        coinMinimalDenom: 'uiov',
        coinDecimals: 6,
        coinGeckoId: 'starname',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/starname.png',
      },
    ],
    gasPriceStep: {
      low: 1,
      average: 2,
      high: 3,
    },
    chainSymbolImageUrl:
      'https://dhj8dql1kzq2v.cloudfront.net/white/starname.png',
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-sifchain.keplr.app',
    rest: 'https://lcd-sifchain.keplr.app/',
    chainId: 'sifchain-1',
    chainName: 'Sifchain',
    stakeCurrency: {
      coinDenom: 'ROWAN',
      coinMinimalDenom: 'rowan',
      coinDecimals: 18,
      coinGeckoId: 'sifchain',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/sifchain.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('sif'),
    currencies: [
      {
        coinDenom: 'ROWAN',
        coinMinimalDenom: 'rowan',
        coinDecimals: 18,
        coinGeckoId: 'sifchain',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/sifchain.png',
      },
      {
        coinDenom: 'Tether USDT',
        coinMinimalDenom: 'cusdt',
        coinDecimals: 6,
      },
      {
        coinDenom: 'Ethereum',
        coinMinimalDenom: 'ceth',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Basic Attention Token',
        coinMinimalDenom: 'cbat',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Aragon',
        coinMinimalDenom: 'cant',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Bancor Network Token',
        coinMinimalDenom: 'cbnt',
        coinDecimals: 18,
      },
      {
        coinDenom: '0x',
        coinMinimalDenom: 'czrx',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Chainlink',
        coinMinimalDenom: 'clink',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Decentraland',
        coinMinimalDenom: 'cmana',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Loopring',
        coinMinimalDenom: 'clrc',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Enjin Coin',
        coinMinimalDenom: 'cenj',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Synthetix Network Token',
        coinMinimalDenom: 'csnx',
        coinDecimals: 18,
      },
      {
        coinDenom: 'TrueUSD',
        coinMinimalDenom: 'ctusd',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Ocean Protocol',
        coinMinimalDenom: 'cocean',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Fantom',
        coinMinimalDenom: 'cftm',
        coinDecimals: 18,
      },
      {
        coinDenom: 'sUSD',
        coinMinimalDenom: 'csusd',
        coinDecimals: 18,
      },
      {
        coinDenom: 'USD Coin',
        coinMinimalDenom: 'cusdc',
        coinDecimals: 6,
      },
      {
        coinDenom: 'Crypto com Coin',
        coinMinimalDenom: 'ccro',
        coinDecimals: 8,
      },
      {
        coinDenom: 'Wrapped Bitcoin',
        coinMinimalDenom: 'cwbtc',
        coinDecimals: 8,
      },
      {
        coinDenom: 'Swipe',
        coinMinimalDenom: 'csxp',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Band Protocol',
        coinMinimalDenom: 'cband',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Dai Stablecoin',
        coinMinimalDenom: 'cdai',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Compound',
        coinMinimalDenom: 'ccomp',
        coinDecimals: 18,
      },
      {
        coinDenom: 'UMA',
        coinMinimalDenom: 'cuma',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Balancer',
        coinMinimalDenom: 'cbal',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Yearn finance',
        coinMinimalDenom: 'cyfi',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Serum',
        coinMinimalDenom: 'csrm',
        coinDecimals: 6,
      },
      {
        coinDenom: 'Cream',
        coinMinimalDenom: 'ccream',
        coinDecimals: 18,
      },
      {
        coinDenom: 'SAND',
        coinMinimalDenom: 'csand',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Sushi',
        coinMinimalDenom: 'csushi',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Empty Set Dollar',
        coinMinimalDenom: 'cesd',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Uniswap',
        coinMinimalDenom: 'cuni',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Aave',
        coinMinimalDenom: 'caave',
        coinDecimals: 18,
      },
      {
        coinDenom: 'BarnBridge',
        coinMinimalDenom: 'cbond',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Wrapped Filecoin',
        coinMinimalDenom: 'cwfil',
        coinDecimals: 18,
      },
      {
        coinDenom: 'The Graph',
        coinMinimalDenom: 'cgrt',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Tokenlon',
        coinMinimalDenom: 'clon',
        coinDecimals: 18,
      },
      {
        coinDenom: '1inch',
        coinMinimalDenom: 'c1inch',
        coinDecimals: 18,
      },
      {
        coinDenom: 'THORChain ERC20',
        coinMinimalDenom: 'crune',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Secret ERC20',
        coinMinimalDenom: 'cwscrt',
        coinDecimals: 6,
      },
      {
        coinDenom: 'IoTeX',
        coinMinimalDenom: 'ciotx',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Reef Finance',
        coinMinimalDenom: 'creef',
        coinDecimals: 18,
      },
      {
        coinDenom: 'COCOS BCX',
        coinMinimalDenom: 'ccocos',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Keep Network',
        coinMinimalDenom: 'ckeep',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Origin Protocol',
        coinMinimalDenom: 'cogn',
        coinDecimals: 18,
      },
      {
        coinDenom: 'ODAOfi',
        coinMinimalDenom: 'cdaofi',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Linear',
        coinMinimalDenom: 'clina',
        coinDecimals: 18,
      },
      {
        coinDenom: '12Ships',
        coinMinimalDenom: 'ctshp',
        coinDecimals: 18,
      },
      {
        coinDenom: 'B.20',
        coinMinimalDenom: 'cb20',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Akropolis',
        coinMinimalDenom: 'cakro',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Rio Fuel Token',
        coinMinimalDenom: 'crfuel',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Rally',
        coinMinimalDenom: 'crly',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Convergence',
        coinMinimalDenom: 'cconv',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Render Token',
        coinMinimalDenom: 'crndr',
        coinDecimals: 18,
      },
      {
        coinDenom: 'PAID Network',
        coinMinimalDenom: 'cpaid',
        coinDecimals: 18,
      },
      {
        coinDenom: 'Tidal',
        coinMinimalDenom: 'ctidal',
        coinDecimals: 18,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'ROWAN',
        coinMinimalDenom: 'rowan',
        coinDecimals: 18,
        coinGeckoId: 'sifchain',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/sifchain.png',
      },
    ],
    gasPriceStep: {
      low: 500000000000,
      average: 1000000000000,
      high: 2000000000000,
    },
    chainSymbolImageUrl:
      'https://dhj8dql1kzq2v.cloudfront.net/white/sifchain.png',
    features: [],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-certik.keplr.app',
    rest: 'https://lcd-certik.keplr.app',
    chainId: 'shentu-2.2',
    chainName: 'Certik',
    stakeCurrency: {
      coinDenom: 'CTK',
      coinMinimalDenom: 'uctk',
      coinDecimals: 6,
      coinGeckoId: 'certik',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('certik'),
    currencies: [
      {
        coinDenom: 'CTK',
        coinMinimalDenom: 'uctk',
        coinDecimals: 6,
        coinGeckoId: 'certik',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'CTK',
        coinMinimalDenom: 'uctk',
        coinDecimals: 6,
        coinGeckoId: 'certik',
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-iris.keplr.app',
    rest: 'https://lcd-iris.keplr.app',
    chainId: 'irishub-1',
    chainName: 'IRISnet',
    stakeCurrency: {
      coinDenom: 'IRIS',
      coinMinimalDenom: 'uiris',
      coinDecimals: 6,
      coinGeckoId: 'iris-network',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/iris.png',
    },
    bip44: {
      coinType: 118,
    },
    alternativeBIP44s: [
      {
        coinType: 566,
      },
    ],
    bech32Config: Bech32Address.defaultBech32Config('iaa'),
    currencies: [
      {
        coinDenom: 'IRIS',
        coinMinimalDenom: 'uiris',
        coinDecimals: 6,
        coinGeckoId: 'iris-network',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/iris.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'IRIS',
        coinMinimalDenom: 'uiris',
        coinDecimals: 6,
        coinGeckoId: 'iris-network',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/iris.png',
      },
    ],
    gasPriceStep: {
      low: 0.2,
      average: 0.3,
      high: 0.4,
    },
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/iris.png',
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-regen.keplr.app',
    rest: 'https://lcd-regen.keplr.app',
    chainId: 'regen-1',
    chainName: 'Regen',
    stakeCurrency: {
      coinDenom: 'REGEN',
      coinMinimalDenom: 'uregen',
      coinDecimals: 6,
      coinGeckoId: 'regen',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/regen.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('regen'),
    currencies: [
      {
        coinDenom: 'REGEN',
        coinMinimalDenom: 'uregen',
        coinDecimals: 6,
        coinGeckoId: 'regen',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/regen.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'REGEN',
        coinMinimalDenom: 'uregen',
        coinDecimals: 6,
        coinGeckoId: 'regen',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/regen.png',
      },
    ],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/regen.png',
    features: ['ibc-transfer', 'ibc-go'],
  },
  {
    rpc: 'https://rpc-juno.keplr.app',
    rest: 'https://lcd-juno.keplr.app',
    chainId: 'juno-1',
    chainName: 'Juno',
    stakeCurrency: {
      coinDenom: 'JUNO',
      coinMinimalDenom: 'ujuno',
      coinDecimals: 6,
      coinGeckoId: 'juno-network',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('juno'),
    currencies: [
      {
        coinDenom: 'JUNO',
        coinMinimalDenom: 'ujuno',
        coinDecimals: 6,
        coinGeckoId: 'juno-network',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'JUNO',
        coinMinimalDenom: 'ujuno',
        coinDecimals: 6,
        coinGeckoId: 'juno-network',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png',
      },
    ],
    gasPriceStep: {
      low: 0.001,
      average: 0.0025,
      high: 0.004,
    },
    features: ['cosmwasm', 'ibc-transfer', 'ibc-go', 'wasmd_0.24+'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/juno.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/juno/txs/{txHash}',
    },
  },
  {
    rpc: 'https://rpc-stargaze.keplr.app',
    rest: 'https://lcd-stargaze.keplr.app',
    chainId: 'stargaze-1',
    chainName: 'Stargaze',
    stakeCurrency: {
      coinDenom: 'STARS',
      coinMinimalDenom: 'ustars',
      coinDecimals: 6,
      coinGeckoId: 'stargaze',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/stargaze.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('stars'),
    currencies: [
      {
        coinDenom: 'STARS',
        coinMinimalDenom: 'ustars',
        coinDecimals: 6,
        coinGeckoId: 'stargaze',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/stargaze.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'STARS',
        coinMinimalDenom: 'ustars',
        coinDecimals: 6,
        coinGeckoId: 'stargaze',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/stargaze.png',
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
    chainSymbolImageUrl:
      'https://dhj8dql1kzq2v.cloudfront.net/white/stargaze.png',
    txExplorer: {
      name: 'Mintscan',
      txUrl: 'https://www.mintscan.io/stargaze/txs/{txHash}',
    },
  },
  {
    rpc: 'https://rpc-persistence.keplr.app',
    rest: 'https://lcd-persistence.keplr.app',
    chainId: 'core-1',
    chainName: 'Persistence',
    stakeCurrency: {
      coinDenom: 'XPRT',
      coinMinimalDenom: 'uxprt',
      coinDecimals: 6,
      coinGeckoId: 'persistence',
      coinImageUrl:
        'https://dhj8dql1kzq2v.cloudfront.net/white/persistence.png',
    },
    bip44: {
      coinType: 750,
    },
    bech32Config: Bech32Address.defaultBech32Config('persistence'),
    currencies: [
      {
        coinDenom: 'XPRT',
        coinMinimalDenom: 'uxprt',
        coinDecimals: 6,
        coinGeckoId: 'persistence',
        coinImageUrl:
          'https://dhj8dql1kzq2v.cloudfront.net/white/persistence.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'XPRT',
        coinMinimalDenom: 'uxprt',
        coinDecimals: 6,
        coinGeckoId: 'persistence',
        coinImageUrl:
          'https://dhj8dql1kzq2v.cloudfront.net/white/persistence.png',
      },
    ],
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04,
    },
    chainSymbolImageUrl:
      'https://dhj8dql1kzq2v.cloudfront.net/white/persistence.png',
    features: ['ibc-transfer', 'ibc-go'],
  },
  {
    rpc: 'https://rpc-axelar.keplr.app',
    rest: 'https://lcd-axelar.keplr.app',
    chainId: 'axelar-dojo-1',
    chainName: 'Axelar',
    stakeCurrency: {
      coinDenom: 'AXL',
      coinMinimalDenom: 'uaxl',
      coinDecimals: 6,
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/axelar.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('axelar'),
    currencies: [
      {
        coinDenom: 'AXL',
        coinMinimalDenom: 'uaxl',
        coinDecimals: 6,
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/axelar.png',
      },
      {
        coinDenom: 'USDC',
        coinMinimalDenom: 'uusdc',
        coinDecimals: 6,
        coinGeckoId: 'usd-coin',
      },
      {
        coinDenom: 'FRAX',
        coinMinimalDenom: 'frax-wei',
        coinDecimals: 18,
        coinGeckoId: 'frax',
      },
      {
        coinDenom: 'DAI',
        coinMinimalDenom: 'dai-wei',
        coinDecimals: 18,
        coinGeckoId: 'dai',
      },
      {
        coinDenom: 'USDT',
        coinMinimalDenom: 'uusdt',
        coinDecimals: 6,
        coinGeckoId: 'tether',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'AXL',
        coinMinimalDenom: 'uaxl',
        coinDecimals: 6,
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/axelar.png',
      },
    ],
    gasPriceStep: {
      low: 0.05,
      average: 0.075,
      high: 0.1,
    },
    features: ['ibc-transfer', 'ibc-go'],
    chainSymbolImageUrl:
      'https://dhj8dql1kzq2v.cloudfront.net/white/axelar.png',
  },
  {
    rpc: 'https://rpc-sommelier.keplr.app',
    rest: 'https://lcd-sommelier.keplr.app',
    chainId: 'sommelier-3',
    chainName: 'Sommelier',
    stakeCurrency: {
      coinDenom: 'SOMM',
      coinMinimalDenom: 'usomm',
      coinDecimals: 6,
      coinGeckoId: 'sommelier',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/somm.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('somm'),
    currencies: [
      {
        coinDenom: 'SOMM',
        coinMinimalDenom: 'usomm',
        coinDecimals: 6,
        coinGeckoId: 'sommelier',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/somm.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'SOMM',
        coinMinimalDenom: 'usomm',
        coinDecimals: 6,
        coinGeckoId: 'sommelier',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/somm.png',
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/somm.png',
  },
  {
    rpc: 'https://rpc-umee.keplr.app',
    rest: 'https://lcd-umee.keplr.app',
    chainId: 'umee-1',
    chainName: 'Umee',
    stakeCurrency: {
      coinDenom: 'UMEE',
      coinMinimalDenom: 'uumee',
      coinDecimals: 6,
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/umee.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('umee'),
    currencies: [
      {
        coinDenom: 'UMEE',
        coinMinimalDenom: 'uumee',
        coinDecimals: 6,
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/umee.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'UMEE',
        coinMinimalDenom: 'uumee',
        coinDecimals: 6,
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/umee.png',
      },
    ],
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.04,
    },
    features: ['ibc-transfer', 'ibc-go'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/umee.png',
  },
  {
    rpc: 'https://rpc-agoric.keplr.app',
    rest: 'https://lcd-agoric.keplr.app',
    chainId: 'agoric-3',
    chainName: 'Agoric',
    stakeCurrency: {
      coinDenom: 'BLD',
      coinMinimalDenom: 'ubld',
      coinDecimals: 6,
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/agoric.png',
    },
    bip44: {
      coinType: 564,
    },
    bech32Config: Bech32Address.defaultBech32Config('agoric'),
    currencies: [
      {
        coinDenom: 'BLD',
        coinMinimalDenom: 'ubld',
        coinDecimals: 6,
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/agoric.png',
      },
      {
        coinDenom: 'RUN',
        coinMinimalDenom: 'urun',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'RUN',
        coinMinimalDenom: 'urun',
        coinDecimals: 6,
      },
    ],
    gasPriceStep: {
      low: 0,
      average: 0,
      high: 0,
    },
    features: ['ibc-go'],
    chainSymbolImageUrl:
      'https://dhj8dql1kzq2v.cloudfront.net/white/agoric.png',
  },
  {
    rpc: 'https://rpc-gravity-bridge.keplr.app',
    rest: 'https://lcd-gravity-bridge.keplr.app',
    chainId: 'gravity-bridge-3',
    chainName: 'Gravity Bridge',
    stakeCurrency: {
      coinDenom: 'GRAV',
      coinMinimalDenom: 'ugraviton',
      coinDecimals: 6,
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/grav.png',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('gravity'),
    currencies: [
      {
        coinDenom: 'GRAV',
        coinMinimalDenom: 'ugraviton',
        coinDecimals: 6,
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/grav.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'GRAV',
        coinMinimalDenom: 'ugraviton',
        coinDecimals: 6,
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/grav.png',
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/grav.png',
  },
  {
    rpc: 'https://rpc-sentinel.keplr.app',
    rest: 'https://lcd-sentinel.keplr.app',
    chainId: 'sentinelhub-2',
    chainName: 'Sentinel',
    stakeCurrency: {
      coinDenom: 'DVPN',
      coinMinimalDenom: 'udvpn',
      coinDecimals: 6,
      coinGeckoId: 'sentinel',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/sentinel.png',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/#/sentinel/stake'
        : 'http://localhost:8081/#/sentinel/stake',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/#/sentinel/stake'
        : 'http://localhost:8081/#/sentinel/stake',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('sent'),
    currencies: [
      {
        coinDenom: 'DVPN',
        coinMinimalDenom: 'udvpn',
        coinDecimals: 6,
        coinGeckoId: 'sentinel',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/sentinel.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'DVPN',
        coinMinimalDenom: 'udvpn',
        coinDecimals: 6,
        coinGeckoId: 'sentinel',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/sentinel.png',
      },
    ],
    gasPriceStep: {
      low: 0.1,
      average: 0.25,
      high: 0.4,
    },
    chainSymbolImageUrl:
      'https://dhj8dql1kzq2v.cloudfront.net/white/sentinel.png',
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-impacthub.keplr.app',
    rest: 'https://lcd-impacthub.keplr.app',
    chainId: 'impacthub-3',
    chainName: 'ixo',
    stakeCurrency: {
      coinDenom: 'IXO',
      coinMinimalDenom: 'uixo',
      coinDecimals: 6,
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/ixo.png',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/#/ixo/stake'
        : 'http://localhost:8081/#/ixo/stake',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/#/ixo/stake'
        : 'http://localhost:8081/#/ixo/stake',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('ixo'),
    currencies: [
      {
        coinDenom: 'IXO',
        coinMinimalDenom: 'uixo',
        coinDecimals: 6,
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/ixo.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'IXO',
        coinMinimalDenom: 'uixo',
        coinDecimals: 6,
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/ixo.png',
      },
    ],
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/ixo.png',
    features: [],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-emoney.keplr.app',
    rest: 'https://lcd-emoney.keplr.app',
    chainId: 'emoney-3',
    chainName: 'e-Money',
    stakeCurrency: {
      coinDenom: 'NGM',
      coinMinimalDenom: 'ungm',
      coinDecimals: 6,
      coinGeckoId: 'e-money',
      coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png',
    },
    walletUrl:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/#/emoney/stake'
        : 'http://localhost:8080/#/emoney/stake',
    walletUrlForStaking:
      process.env.NODE_ENV === 'production'
        ? 'https://wallet.keplr.app/#/emoney/stake'
        : 'http://localhost:8080/#/emoney/stake',
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('emoney'),
    currencies: [
      {
        coinDenom: 'NGM',
        coinMinimalDenom: 'ungm',
        coinDecimals: 6,
        coinGeckoId: 'e-money',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png',
      },
      {
        coinDenom: 'EEUR',
        coinMinimalDenom: 'eeur',
        coinDecimals: 6,
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'NGM',
        coinMinimalDenom: 'ungm',
        coinDecimals: 6,
        coinGeckoId: 'e-money',
        coinImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png',
      },
    ],
    gasPriceStep: {
      low: 1,
      average: 1,
      high: 1,
    },
    chainSymbolImageUrl: 'https://dhj8dql1kzq2v.cloudfront.net/white/ngm.png',
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-microtick.keplr.app',
    rest: 'https://lcd-microtick.keplr.app',
    chainId: 'microtick-1',
    chainName: 'Microtick',
    stakeCurrency: {
      coinDenom: 'TICK',
      coinMinimalDenom: 'utick',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('micro'),
    currencies: [
      {
        coinDenom: 'TICK',
        coinMinimalDenom: 'utick',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'TICK',
        coinMinimalDenom: 'utick',
        coinDecimals: 6,
      },
    ],
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-columbus.keplr.app',
    rest: 'https://lcd-columbus.keplr.app',
    chainId: 'columbus-5',
    chainName: 'Terra',
    stakeCurrency: {
      coinDenom: 'LUNA',
      coinMinimalDenom: 'uluna',
      coinDecimals: 6,
      coinGeckoId: 'terra-luna',
    },
    bip44: {
      coinType: 330,
    },
    bech32Config: Bech32Address.defaultBech32Config('terra'),
    currencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna',
      },
      {
        coinDenom: 'UST',
        coinMinimalDenom: 'uusd',
        coinDecimals: 6,
        coinGeckoId: 'terrausd',
      },
      {
        coinDenom: 'KRT',
        coinMinimalDenom: 'ukrw',
        coinDecimals: 6,
        coinGeckoId: 'terrakrw',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LUNA',
        coinMinimalDenom: 'uluna',
        coinDecimals: 6,
        coinGeckoId: 'terra-luna',
      },
      {
        coinDenom: 'UST',
        coinMinimalDenom: 'uusd',
        coinDecimals: 6,
        coinGeckoId: 'terrausd',
      },
    ],
    gasPriceStep: {
      low: 0.015,
      average: 0.015,
      high: 0.015,
    },
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://mainnet-node.like.co/rpc',
    rest: 'https://mainnet-node.like.co',
    chainId: 'likecoin-mainnet-2',
    chainName: 'LikeCoin',
    stakeCurrency: {
      coinDenom: 'LIKE',
      coinMinimalDenom: 'nanolike',
      coinDecimals: 9,
      coinGeckoId: 'likecoin',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('cosmos'),
    currencies: [
      {
        coinDenom: 'LIKE',
        coinMinimalDenom: 'nanolike',
        coinDecimals: 9,
        coinGeckoId: 'likecoin',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LIKE',
        coinMinimalDenom: 'nanolike',
        coinDecimals: 9,
        coinGeckoId: 'likecoin',
      },
    ],
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-impacthub.keplr.app',
    rest: 'https://lcd-impacthub.keplr.app',
    chainId: 'impacthub-3',
    chainName: 'IXO',
    stakeCurrency: {
      coinDenom: 'IXO',
      coinMinimalDenom: 'uixo',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('ixo'),
    currencies: [
      {
        coinDenom: 'IXO',
        coinMinimalDenom: 'uixo',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'IXO',
        coinMinimalDenom: 'uixo',
        coinDecimals: 6,
      },
    ],
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc.bitcanna.io',
    rest: 'https://lcd.bitcanna.io',
    chainId: 'bitcanna-1',
    chainName: 'BitCanna',
    stakeCurrency: {
      coinDenom: 'BCNA',
      coinMinimalDenom: 'ubcna',
      coinDecimals: 6,
      coinGeckoId: 'bitcanna',
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('bcna'),
    currencies: [
      {
        coinDenom: 'BCNA',
        coinMinimalDenom: 'ubcna',
        coinDecimals: 6,
        coinGeckoId: 'bitcanna',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'BCNA',
        coinMinimalDenom: 'ubcna',
        coinDecimals: 6,
        coinGeckoId: 'bitcanna',
      },
    ],
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc.explorebitsong.com',
    rest: 'https://lcd.explorebitsong.com',
    chainId: 'bitsong-2b',
    chainName: 'BitSong',
    stakeCurrency: {
      coinDenom: 'BTSG',
      coinMinimalDenom: 'ubtsg',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 639,
    },
    bech32Config: Bech32Address.defaultBech32Config('bitsong'),
    currencies: [
      {
        coinDenom: 'BTSG',
        coinMinimalDenom: 'ubtsg',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'BTSG',
        coinMinimalDenom: 'ubtsg',
        coinDecimals: 6,
      },
    ],
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-mainnet.blockchain.ki',
    rest: 'https://api-mainnet.blockchain.ki',
    chainId: 'kichain-2',
    chainName: 'Ki',
    stakeCurrency: {
      coinDenom: 'XKI',
      coinMinimalDenom: 'uxki',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('ki'),
    currencies: [
      {
        coinDenom: 'XKI',
        coinMinimalDenom: 'uxki',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'XKI',
        coinMinimalDenom: 'uxki',
        coinDecimals: 6,
      },
    ],
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc.gopanacea.org',
    rest: 'https://api.gopanacea.org',
    chainId: 'panacea-3',
    chainName: 'Panacea',
    stakeCurrency: {
      coinDenom: 'MED',
      coinMinimalDenom: 'umed',
      coinDecimals: 6,
      coinGeckoId: 'medibloc',
    },
    bip44: {
      coinType: 371,
    },
    bech32Config: Bech32Address.defaultBech32Config('panacea'),
    currencies: [
      {
        coinDenom: 'MED',
        coinMinimalDenom: 'umed',
        coinDecimals: 6,
        coinGeckoId: 'medibloc',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'MED',
        coinMinimalDenom: 'umed',
        coinDecimals: 6,
        coinGeckoId: 'medibloc',
      },
    ],
    gasPriceStep: {
      low: 5,
      average: 7,
      high: 9,
    },
    features: ['ibc-transfer'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc.bostrom.cybernode.ai',
    rest: 'https://lcd.bostrom.cybernode.ai',
    chainId: 'bostrom',
    chainName: 'Bostrom',
    stakeCurrency: {
      coinDenom: 'BOOT',
      coinMinimalDenom: 'boot',
      coinDecimals: 0,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('bostrom'),
    currencies: [
      {
        coinDenom: 'BOOT',
        coinMinimalDenom: 'boot',
        coinDecimals: 0,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'BOOT',
        coinMinimalDenom: 'boot',
        coinDecimals: 0,
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc.comdex.one',
    rest: 'https://rest.comdex.one',
    chainId: 'comdex-1',
    chainName: 'Comdex',
    stakeCurrency: {
      coinDenom: 'CMDX',
      coinMinimalDenom: 'ucmdx',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('comdex'),
    currencies: [
      {
        coinDenom: 'CMDX',
        coinMinimalDenom: 'ucmdx',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'CMDX',
        coinMinimalDenom: 'ucmdx',
        coinDecimals: 6,
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc.cheqd.net',
    rest: 'https://api.cheqd.net',
    chainId: 'cheqd-mainnet-1',
    chainName: 'cheqd',
    stakeCurrency: {
      coinDenom: 'CHEQ',
      coinMinimalDenom: 'ncheq',
      coinDecimals: 9,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('cheqd'),
    currencies: [
      {
        coinDenom: 'CHEQ',
        coinMinimalDenom: 'ncheq',
        coinDecimals: 9,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'CHEQ',
        coinMinimalDenom: 'ncheq',
        coinDecimals: 9,
      },
    ],
    gasPriceStep: {
      low: 25,
      average: 30,
      high: 50,
    },
    features: ['ibc-transfer', 'ibc-go'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc.chihuahua.wtf',
    rest: 'https://api.chihuahua.wtf',
    chainId: 'chihuahua-1',
    chainName: 'Chihuahua',
    stakeCurrency: {
      coinDenom: 'HUAHUA',
      coinMinimalDenom: 'uhuahua',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('chihuahua'),
    currencies: [
      {
        coinDenom: 'HUAHUA',
        coinMinimalDenom: 'uhuahua',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'HUAHUA',
        coinMinimalDenom: 'uhuahua',
        coinDecimals: 6,
      },
    ],
    gasPriceStep: {
      low: 0.025,
      average: 0.03,
      high: 0.035,
    },
    features: ['ibc-transfer', 'ibc-go'],
    hideInUI: true,
  },
  {
    rpc: 'https://node0.mainnet.lum.network/rpc',
    rest: 'https://node0.mainnet.lum.network/rest',
    chainId: 'lum-network-1',
    chainName: 'Lum Network',
    stakeCurrency: {
      coinDenom: 'LUM',
      coinMinimalDenom: 'ulum',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('lum'),
    currencies: [
      {
        coinDenom: 'LUM',
        coinMinimalDenom: 'ulum',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'LUM',
        coinMinimalDenom: 'ulum',
        coinDecimals: 6,
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
    hideInUI: true,
  },
  {
    rpc: 'https://mainnet-rpc.vidulum.app',
    rest: 'https://mainnet-lcd.vidulum.app',
    chainId: 'vidulum-1',
    chainName: 'Vidulum',
    stakeCurrency: {
      coinDenom: 'VDL',
      coinMinimalDenom: 'uvdl',
      coinDecimals: 6,
      coinGeckoId: 'vidulum',
    },
    bip44: {
      coinType: 370,
    },
    bech32Config: Bech32Address.defaultBech32Config('vdl'),
    currencies: [
      {
        coinDenom: 'VDL',
        coinMinimalDenom: 'uvdl',
        coinDecimals: 6,
        coinGeckoId: 'vidulum',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'VDL',
        coinMinimalDenom: 'uvdl',
        coinDecimals: 6,
        coinGeckoId: 'vidulum',
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc.mainnet.desmos.network',
    rest: 'https://api.mainnet.desmos.network',
    chainId: 'desmos-mainnet',
    chainName: 'Desmos',
    stakeCurrency: {
      coinDenom: 'DSM',
      coinMinimalDenom: 'udsm',
      coinDecimals: 6,
      coinGeckoId: 'desmos',
    },
    bip44: {
      coinType: 852,
    },
    bech32Config: Bech32Address.defaultBech32Config('desmos'),
    currencies: [
      {
        coinDenom: 'DSM',
        coinMinimalDenom: 'udsm',
        coinDecimals: 6,
        coinGeckoId: 'desmos',
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'DSM',
        coinMinimalDenom: 'udsm',
        coinDecimals: 6,
        coinGeckoId: 'desmos',
      },
    ],
    features: ['ibc-transfer', 'ibc-go'],
    hideInUI: true,
  },
  {
    rpc: 'https://rpc-1-dig.notional.ventures',
    rest: 'https://api-1-dig.notional.ventures',
    chainId: 'dig-1',
    chainName: 'Dig',
    stakeCurrency: {
      coinDenom: 'DIG',
      coinMinimalDenom: 'udig',
      coinDecimals: 6,
    },
    bip44: {
      coinType: 118,
    },
    bech32Config: Bech32Address.defaultBech32Config('dig'),
    currencies: [
      {
        coinDenom: 'DIG',
        coinMinimalDenom: 'udig',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'DIG',
        coinMinimalDenom: 'udig',
        coinDecimals: 6,
      },
    ],
    gasPriceStep: {
      low: 0.025,
      average: 0.03,
      high: 0.035,
    },
    features: ['ibc-transfer', 'ibc-go'],
    hideInUI: true,
  },
];
