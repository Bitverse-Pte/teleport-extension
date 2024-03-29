// import OtherIcon from 'assets/chain/custom.png';
import EthIconB from 'assets/chain/with-border/eth.svg';
import BinanceIconB from 'assets/chain/with-border/binance.svg';
import SushiIconB from 'assets/chain/with-border/sushi.svg';
import BTCIconB from 'assets/chain/with-border/btc.svg';
import AVAXIconB from 'assets/chain/with-border/avax.svg';
import FTMIconB from 'assets/chain/with-border/ftm.svg';
import OPIconB from 'assets/chain/with-border/op.svg';
import CroIconB from 'assets/chain/with-border/cro.svg';
import KavaIconB from 'assets/chain/with-border/kava.svg';
import OsomosisIconB from 'assets/chain/with-border/osmo.svg';
import JunoIconB from 'assets/chain/with-border/juno.svg';
import ScrtIconB from 'assets/chain/with-border/scrt.svg';
import UmeeIconB from 'assets/chain/with-border/umee.svg';
import EvmOSIconB from 'assets/chain/with-border/evmos.svg';
import ArbitrumIcon from 'assets/chain/arbitrum.svg';
import MaticIcon from 'assets/tokens/matic.svg';
import CosmosAtomIcon from 'assets/tokens/atom.svg';
import DefaulutIcon from 'assets/tokens/default.svg';
import { BigNumber } from 'ethers';
import { PresetNetworkId } from 'constants/defaultNetwork';
import { Ecosystem } from 'types/network';

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
    case 'COSMOS':
      return CosmosAtomIcon;
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
    case PresetNetworkId.AVAX:
      return AVAXIconB; // AVAX
    case PresetNetworkId.FTM:
      return FTMIconB; // FTM
    case PresetNetworkId.OP:
      return OPIconB; // OP
    case PresetNetworkId.COSMOS_HUB:
      return CosmosAtomIcon;
    case PresetNetworkId.CRYPTO_ORG:
      return CroIconB;
    case PresetNetworkId.KAVA:
      return KavaIconB;
    case PresetNetworkId.SECRET_NETWORK:
      return ScrtIconB;
    case PresetNetworkId.OSMOSIS:
      return OsomosisIconB;
    case PresetNetworkId.JUNO:
      return JunoIconB;

    // @todo: add new case here
    case PresetNetworkId.EVMOS:
      return EvmOSIconB;
    case PresetNetworkId.UMEE:
      return UmeeIconB;

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
  const chainId = '0x' + parseInt(_chainId).toString(16);
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

    case '0xa869':
    case '0xa86a':
      return AVAXIconB; // AVAX
    case '0xfa':
    case '0xfa2':
      return FTMIconB; // FTM
    case '0xa':
      return OPIconB; // OP

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
      return CosmosAtomIcon;
    case Ecosystem.POLKADOT:
      return EthIconB;
    default:
      return EthIconB;
  }
}
