import { BigNumber } from 'ethers';

export const toBNDecimalStr = (n: string | number) =>
  BigNumber.from(n).toString();

/**
 * query the category name by Chain ID
 * @param _rawChainId the chain id for EVM chain
 * @returns the category name
 */
export function chainIdToCategory(_rawChainId: string | number) {
  const chainId = BigNumber.from(_rawChainId).toString();

  switch (chainId) {
    case toBNDecimalStr('0x1'):
    case toBNDecimalStr('0x2'):
    case toBNDecimalStr('0x3'):
    case toBNDecimalStr('0x4'):
    case toBNDecimalStr('0x2a'):
      return 'ETH'; // ETH
    case toBNDecimalStr('0x38'):
    case toBNDecimalStr('0x62'):
      return 'BSC'; // bsc
    case toBNDecimalStr('0xa4b1'):
    case toBNDecimalStr('0x66eeb'):
      return 'ARBITRUM'; // Arbitrum
    case toBNDecimalStr('0x89'):
    case toBNDecimalStr('0x13881'):
      return 'POLYGON'; // Polygon

    // @todo: is there a better icon other than this?
    default:
      return 'OTHERS';
  }
}
