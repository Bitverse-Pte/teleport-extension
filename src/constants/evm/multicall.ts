import { addHexPrefix } from 'ethereumjs-util';

/**
 * get multicall v2 contract address
 * @param chainId the chainId of EVM network
 * @returns the multicall v2 address that support `tryAggregate`
 */

export function getMulticallAddressOf(
  chainId: string | number
): string | undefined {
  const hexValue = addHexPrefix(Number(chainId).toString(16));
  switch (hexValue) {
    case '0x1':
    case '0x3':
    case '0x4':
    case '0x2a':
    case '0x5':
      // deployed by makerdao, same address across 5 ETH network
      return '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696';
    /**
     * Third parties deployed, should verify contract code before added below
     * Please noticed that we do not allow Upgradeable
     * to avoid future contract ABI changes
     */
    /**
     * Bsc Mainnet
     * Bsc Testnet
     * Polygon Mainnet
     * Polygon Mumbai testnet
     */
    case '0x38':
    case '0x61': // BSC testnet
    case '0x89': // Polygon Mainnet
    case '0x13881': // Polygon Testnet
      return '0xed386Fe855C1EFf2f843B910923Dd8846E45C5A4';
    /**
     * Optimism
     * OP Kovan
     */
    case '0xa':
    case '0x45':
      return '0x2DC0E2aa608532Da689e89e237dF582B783E552C';
    /** Fantom Mainnet */
    case '0xfa':
      return '0xD98e3dBE5950Ca8Ce5a4b59630a5652110403E5c';
    /** Arbitrum */
    case '0xa4b1':
      return '0x80C7DD17B01855a6D2347444a0FCC36136a314de';
    /** AVAX */
    case '0xa86a':
        return '0x8755b94F88D120AB2Cc13b1f6582329b067C760d';
    default:
      return undefined;
  }
}
