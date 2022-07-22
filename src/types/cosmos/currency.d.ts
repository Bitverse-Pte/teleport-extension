/**
 * The currency that is supported on the chain natively.
 */
export interface CosmosCurrency {
  readonly coinDenom: string;
  readonly coinMinimalDenom: string;
  readonly coinDecimals: number;
  /**
   * This is used to fetch asset's fiat value from coingecko.
   * You can get id from https://api.coingecko.com/api/v3/coins/list.
   */
  readonly coinGeckoId?: string;
  readonly coinImageUrl?: string;
}
/**
 * The currency that is supported on the cosmwasm.
 * This should be the CW-20 that confirms the standard.
 * And, in this case, `coinMinimalDenom` must start with the type and contract address of currency such as "cw20:coral1vv6hruqu...3sfhwh:ukeplr".
 */
export interface CW20Currency extends CosmosCurrency {
  readonly type: 'cw20';
  readonly contractAddress: string;
}
export interface Secret20Currency extends CosmosCurrency {
  readonly type: 'secret20';
  readonly contractAddress: string;
  readonly viewingKey: string;
}
/**
 * IBCCurrency is the currency that is sent from the other chain via IBC.
 * This will be handled as similar to the native currency.
 * But, this has more information abounr IBC channel and paths.
 */
export interface IBCCurrency extends CosmosCurrency {
  readonly paths: {
    portId: string;
    channelId: string;
  }[];
  /**
   * The chain id that the currency is from.
   * If that chain is unknown, this will be undefined.
   */
  readonly originChainId: string | undefined;
  readonly originCurrency:
    | CosmosCurrency
    | CW20Currency
    | Secret20Currency
    | undefined;
}
/**
 * Any type of currency that Kepler applications can support.
 */
export declare type CosmosAppCurrency =
  | CosmosCurrency
  | CW20Currency
  | Secret20Currency
  | IBCCurrency;
export interface FiatCurrency {
  readonly currency: string;
  readonly symbol: string;
  readonly maxDecimals: number;
  readonly locale: string;
}