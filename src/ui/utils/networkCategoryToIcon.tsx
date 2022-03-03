// import OtherIcon from 'assets/chain/custom.png';
import EthIconB from 'assets/chain/with-border/eth.svg';
import BinanceIconB from 'assets/chain/with-border/binance.svg';
import SushiIconB from 'assets/chain/with-border/sushi.svg';
import BTCIconB from 'assets/chain/with-border/btc.svg';
import ArbitrumIcon from 'assets/chain/arbitrum.svg';
import MaticIcon from 'assets/tokens/matic.svg';
import DefaulutIcon from 'assets/tokens/default.svg';
import { BigNumber } from 'ethers';
import { PresetNetworkId } from 'constants/defaultNetwork';
import { CoinType, Ecosystem } from 'types/network';
import { CoinTypeEcosystemMapping } from 'constants/wallet';

export function categoryToIconSVG(category?: string): string | undefined {
  switch (category) {
    case 'ETH':
      return EthIconB;
    case 'BSC':
    case 'BNB':
      return BinanceIconB;
    case 'SUSHI':
      return SushiIconB;
    case 'BTC':
      return BTCIconB;
    case 'ARBITRUM':
      return ArbitrumIcon;
    case 'POLYGON':
    case 'MATIC':
      return MaticIcon;
    // @todo: add new case here

    // the fallback icon
    default:
      return DefaulutIcon;
  }
}

/**
 * get the logo of the chain by chain ID
 * @param id the network id of this chain
 */
export function IdToChainLogoSVG(id: PresetNetworkId | string) {
  switch (id) {
    case PresetNetworkId.ETHEREUM:
      return EthIconB; // rinkeby
    case PresetNetworkId.BSC:
      return BinanceIconB; // bsc
    case PresetNetworkId.ARBITRUM:
      return ArbitrumIcon; // Arbitrum
    case PresetNetworkId.POLYGON:
      return MaticIcon; // Polygon
    // @todo: add new case here

    // @todo: is there a better icon other than this?
    default:
      return DefaulutIcon;
  }
}

/**
 * get the logo of the chain by chain ID
 * @param chainId the hexstring of this chain
 */
export function ChainIdToChainLogoSVG(_chainId: string) {
  const chainId = BigNumber.from(_chainId).toHexString();
  switch (chainId) {
    case '0x1':
    case '0x2':
    case '0x3':
    case '0x4':
    case '0x2a':
      return EthIconB; // ETH
    case '0x38':
    case '0x62':
      return BinanceIconB; // bsc
    case '0xa4b1':
    case '0x66eeb':
      return ArbitrumIcon; // Arbitrum
    case '0x89':
    case '0x13881':
      return MaticIcon; // Polygon

    // @todo: is there a better icon other than this?
    default:
      return DefaulutIcon;
  }
}

export function ecosystemToIconSVG(ecosystem: Ecosystem) {
  switch (ecosystem) {
    case Ecosystem.EVM:
      return EthIconB;
    case Ecosystem.COSMOS:
      return EthIconB;
    case Ecosystem.POLKADOT:
      return EthIconB;
    default:
      return EthIconB;
  }
}
export function coinTypeToIconSVG(coinType: CoinType) {
  let ecosystem;
  for (const eco in CoinTypeEcosystemMapping) {
    if (CoinTypeEcosystemMapping[eco].coinType.includes(coinType)) {
      ecosystem = eco;
    }
  }
  switch (ecosystem) {
    case Ecosystem.EVM:
      return EthIconB;
    case Ecosystem.COSMOS:
      return EthIconB;
    case Ecosystem.POLKADOT:
      return EthIconB;
    default:
      return EthIconB;
  }
}
