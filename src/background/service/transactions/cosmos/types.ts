import { AppCurrency, ChainInfo, Bech32Config } from '@keplr-wallet/types';
import { AxiosRequestConfig } from 'axios';
export interface ChainGetter {
  // Return the chain info matched with chain id.
  // Expect that this method will return the chain info reactively,
  // so it is possible to detect the chain info changed without any additional effort.
  getChain(chainId: string): ChainInfo & {
    raw: ChainInfo;
    addUnknownCurrencies(...coinMinimalDenoms: string[]): void;
    findCurrency(coinMinimalDenom: string): AppCurrency | undefined;
    forceFindCurrency(coinMinimalDenom: string): AppCurrency;
  };
}

export type CoinPrimitive = {
  denom: string;
  amount: string;
};

export interface CosChainInfo {
  readonly rpc: string;
  readonly chainId: string;
  readonly rest: string | undefined;
  readonly restConfig?: AxiosRequestConfig;

  readonly bech32Config: Bech32Config;
  readonly coinType: number;
}

export type FeeType = 'high' | 'average' | 'low';

export interface MsgOpt {
  readonly type: string;
  readonly gas: number;
}

export interface CosmosMsgOpts {
  readonly send: {
    readonly native: MsgOpt;
  };
  readonly ibcTransfer: MsgOpt;
  readonly delegate: MsgOpt;
  readonly undelegate: MsgOpt;
  readonly redelegate: MsgOpt;
  // The gas multiplication per rewards.
  readonly withdrawRewards: MsgOpt;
  readonly govVote: MsgOpt;
}

export interface SecretMsgOpts {
  readonly send: {
    readonly secret20: Pick<MsgOpt, 'gas'>;
  };

  readonly createSecret20ViewingKey: Pick<MsgOpt, 'gas'>;
  readonly executeSecretWasm: Pick<MsgOpt, 'type'>;
}

export interface CosmwasmMsgOpts {
  readonly send: {
    readonly cw20: Pick<MsgOpt, 'gas'>;
  };

  readonly executeWasm: Pick<MsgOpt, 'type'>;
}

export interface GasPriceStep {
  low: number;
  average: number;
  high: number;
}
