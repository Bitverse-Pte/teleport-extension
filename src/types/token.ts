export interface Token {
  symbol: string;
  decimal: number | string;
  name: string;
  denom: string;
  icon?: string;
  chainCustomId: string;
  isNative: boolean;
  contractAddress?: string;
  trace?: IDenomTrace;
  isCustom: boolean;
  amount?: number | string;
  display?: boolean;
  tokenId?: string;
  price?: number | string;
  chainName?: string;
}

export interface AddTokenOpts {
  symbol: string;
  name: string;
  decimal: number | string;
  chainCustomId: string;
  contractAddress?: string;
  isNative: boolean;
  denom?: string;
}

export interface ITokenStore {
  tokens: Token[];
  balances: Record<string, Token[]> | null;
  denomTrace: Record<string, IDenomTrace> | null;
}

export interface ITrace {
  portId: string;
  channelId: string;
}

export interface IDenomTrace {
  hash: string;
  trace: ITrace[];
  denom: string;
  path: string;
}

export interface ERC20Struct {
  name: string;
  decimals: number | string;
  balanceOf: number | string;
  symbol: string;
  totalSupply?: number;
  owner?: string;
  freezeOf?: number;
  allowance?: number;
}

export interface PriceStruct {
  string: number;
}
