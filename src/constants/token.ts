import { Token } from 'types/token';
import { PresetNetworkId } from 'constants/defaultNetwork';

export const DEFAULT_TOKEN_CONFIG: Token[] = [
  {
    symbol: 'ETH',
    decimal: 18,
    name: 'ETH',
    demon: 'wei',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: true,
    isCustom: false,
    contractAddress: '',
    track: '',
    display: true,
    themeColor: '#000000',
  },
  {
    symbol: 'USDT',
    decimal: 6,
    name: 'USDT',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },

  {
    symbol: 'USDC',
    decimal: 6,
    name: 'USDC',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'UNI',
    decimal: 18,
    name: 'UNI',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },

  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },

  {
    symbol: 'BIT',
    decimal: 18,
    name: 'BIT',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },

  {
    symbol: 'TUSD',
    decimal: 18,
    name: 'TUSD',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ETHEREUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x0000000000085d4780B73119b644AE5ecd22b376',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'BNB',
    decimal: 18,
    name: 'BNB',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.BSC,
    isNative: true,
    isCustom: false,
    contractAddress: '',
    track: '',
    display: true,
    themeColor: '#000000',
  },
  {
    symbol: 'WBNB',
    decimal: 18,
    name: 'WBNB',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },

  {
    symbol: 'USDT',
    decimal: 18,
    name: 'BSC-USD',
    demon: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/USDT-6D8/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x55d398326f99059ff775485246999027b3197955',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'CAKE',
    decimal: 18,
    name: 'CAKE',
    demon: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/CAKE-435/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'ETH',
    decimal: 18,
    name: 'ETH',
    demon: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/ETH-1C9/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'USDC',
    decimal: 18,
    name: 'USDC',
    demon: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/USDC-CD2/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'BUSD',
    decimal: 18,
    name: 'BUSD',
    demon: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BUSD-BD1/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    demon: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/DAI-D75/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'TUSD',
    decimal: 18,
    name: 'TUSD',
    demon: '',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/TUSDB-888/logo.png',
    chainCustomId: PresetNetworkId.BSC,
    isNative: false,
    isCustom: false,
    contractAddress: '0x14016e85a25aeb13065688cafb43044c2ef86784',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'MATIC',
    decimal: 18,
    name: 'MATIC',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: true,
    isCustom: false,
    contractAddress: '',
    track: '',
    display: true,
    themeColor: '#000000',
  },
  {
    symbol: 'WETH',
    decimal: 18,
    name: 'WETH',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },

  {
    symbol: 'USDT',
    decimal: 6,
    name: 'USDT',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'USDC',
    decimal: 6,
    name: 'USDC',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'TUSD',
    decimal: 18,
    name: 'TUSD',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0x2e1ad108ff1d8c782fcbbb89aad783ac49586756',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'UNI',
    decimal: 18,
    name: 'UNI',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.POLYGON,
    isNative: false,
    isCustom: false,
    contractAddress: '0xb33eaad8d922b1083446dc23f610c2567fb5180f',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'ETH',
    decimal: 18,
    name: 'ETH',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: true,
    isCustom: false,
    contractAddress: '',
    track: '',
    display: true,
    themeColor: '#000000',
  },
  {
    symbol: 'USDT',
    decimal: 6,
    name: 'USDT',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },

  {
    symbol: 'USDC',
    decimal: 6,
    name: 'USDC',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'TUSD',
    decimal: 18,
    name: 'TUSD',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x4d15a3a2286d883af0aa1b3f21367843fac63e07',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'UNI',
    decimal: 18,
    name: 'UNI',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'SUSHI',
    decimal: 18,
    name: 'SUSHI',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.ARBITRUM,
    isNative: false,
    isCustom: false,
    contractAddress: '0xd4d42f0b6def4ce0383636770ef773390d85c61a',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },

  {
    symbol: 'FTM',
    decimal: 18,
    name: 'FTM',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.FTM,
    isNative: true,
    isCustom: false,
    contractAddress: '',
    track: '',
    display: true,
    themeColor: '#000000',
  },
  {
    symbol: 'FETH',
    decimal: 18,
    name: 'FETH',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.FTM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x658b0c7613e890ee50b8c4bc6a3f41ef411208ad',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },

  {
    symbol: 'USDC',
    decimal: 6,
    name: 'USDC',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.FTM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.FTM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'YFI',
    decimal: 18,
    name: 'YFI',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.FTM,
    isNative: false,
    isCustom: false,
    contractAddress: '0x29b0Da86e484E1C0029B56e817912d778aC0EC69',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'AVAX',
    decimal: 18,
    name: 'AVAX',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: true,
    isCustom: false,
    contractAddress: '',
    track: '',
    display: true,
    themeColor: '#000000',
  },
  {
    symbol: 'WAVAX',
    decimal: 18,
    name: 'WAVAX',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: false,
    isCustom: false,
    contractAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'USDT.e',
    decimal: 6,
    name: 'USDT.e',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: false,
    isCustom: false,
    contractAddress: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'DAI.e',
    decimal: 18,
    name: 'DAI.e',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: false,
    isCustom: false,
    contractAddress: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'WETH.e',
    decimal: 18,
    name: 'WETH.e',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: false,
    isCustom: false,
    contractAddress: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'USDC.e',
    decimal: 6,
    name: 'USDC.e',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.AVAX,
    isNative: false,
    isCustom: false,
    contractAddress: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'ETH',
    decimal: 18,
    name: 'ETH',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: true,
    isCustom: false,
    contractAddress: '',
    track: '',
    display: true,
    themeColor: '#000000',
  },
  {
    symbol: 'OP',
    decimal: 18,
    name: 'OP',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: false,
    isCustom: false,
    contractAddress: '0x4200000000000000000000000000000000000042',
    track: '',
    display: true,
    themeColor: '#000000',
  },
  {
    symbol: 'USDT',
    decimal: 6,
    name: 'USDT',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: false,
    isCustom: false,
    contractAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'USDC',
    decimal: 6,
    name: 'USDC',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: false,
    isCustom: false,
    contractAddress: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'DAI',
    decimal: 18,
    name: 'DAI',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.OP,
    isNative: false,
    isCustom: false,
    contractAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    track: '',
    display: true,
    themeColor: '#FFA800',
  },
  {
    symbol: 'Tele',
    decimal: 18,
    name: 'Tele',
    demon: '',
    icon: '',
    chainCustomId: PresetNetworkId.TELE_TEST,
    isNative: true,
    isCustom: false,
    contractAddress: '',
    track: '',
    display: true,
    themeColor: '#000000',
  },
];
