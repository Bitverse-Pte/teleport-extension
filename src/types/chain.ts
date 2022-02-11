import { CHAINS_ENUM } from 'constants/index';

export interface Chain {
  id: number;
  name: string;
  hex: string;
  logo: string;
  enum: CHAINS_ENUM;
  serverId: string;
  network: string;
  nativeTokenSymbol: string;
  whiteLogo?: string;
  nativeTokenLogo: string;
  nativeTokenAddress: string;
  scanLink: string;
}
