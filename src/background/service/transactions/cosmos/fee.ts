import { Coin, CoinPretty, Dec, DecUtils, Int } from '@keplr-wallet/unit';
import { DenomHelper } from '@keplr-wallet/common';
import deepmerge from 'deepmerge';
import { DeepPartial, DeepReadonly } from 'utility-types';
import { Currency } from '@keplr-wallet/types';
import { keyringService, networkPreferenceService } from 'background/service';
import {
  FeeType,
  CosmosMsgOpts,
  SecretMsgOpts,
  CosmwasmMsgOpts,
  GasPriceStep,
} from './types';

export const defaultCosmwasmMsgOpts: CosmwasmMsgOpts = {
  send: {
    cw20: {
      gas: 150000,
    },
  },

  executeWasm: {
    type: 'wasm/MsgExecuteContract',
  },
};

export const getGasByCosmos: (
  chainId: string
) => DeepPartial<CosmosMsgOpts> | undefined = (chainId) => {
  // In certik, change the msg type of the MsgSend to "bank/MsgSend"
  if (chainId.startsWith('shentu-')) {
    return {
      send: {
        native: {
          type: 'bank/MsgSend',
        },
      },
    };
  }

  // In akash or sifchain, increase the default gas for sending
  if (chainId.startsWith('akashnet-') || chainId.startsWith('sifchain')) {
    return {
      send: {
        native: {
          gas: 120000,
        },
      },
    };
  }

  if (chainId.startsWith('secret-')) {
    return {
      send: {
        native: {
          gas: 20000,
        },
      },
      withdrawRewards: {
        gas: 25000,
      },
    };
  }

  // For terra related chains
  if (chainId.startsWith('bombay-') || chainId.startsWith('columbus-')) {
    return {
      send: {
        native: {
          type: 'bank/MsgSend',
        },
      },
    };
  }

  if (chainId.startsWith('evmos_')) {
    return {
      send: {
        native: {
          gas: 140000,
        },
      },
      withdrawRewards: {
        gas: 200000,
      },
    };
  }

  if (chainId.startsWith('osmosis')) {
    return {
      send: {
        native: {
          gas: 100000,
        },
      },
      withdrawRewards: {
        gas: 300000,
      },
    };
  }

  if (chainId.startsWith('stargaze-')) {
    return {
      send: {
        native: {
          gas: 100000,
        },
      },
      withdrawRewards: {
        gas: 200000,
      },
    };
  }
};

export const getGasBySecret: (
  chainId: string
) => DeepPartial<SecretMsgOpts> | undefined = (chainId) => {
  if (chainId.startsWith('secret-')) {
    return {
      send: {
        secret20: {
          gas: 50000,
        },
      },
      createSecret20ViewingKey: {
        gas: 50000,
      },
    };
  }
};

export const defaultCosmosMsgOpts: CosmosMsgOpts = {
  send: {
    native: {
      type: 'cosmos-sdk/MsgSend',
      gas: 80000,
    },
  },
  ibcTransfer: {
    type: 'cosmos-sdk/MsgTransfer',
    gas: 450000,
  },
  delegate: {
    type: 'cosmos-sdk/MsgDelegate',
    gas: 250000,
  },
  undelegate: {
    type: 'cosmos-sdk/MsgUndelegate',
    gas: 250000,
  },
  redelegate: {
    type: 'cosmos-sdk/MsgBeginRedelegate',
    gas: 250000,
  },
  // The gas multiplication per rewards.
  withdrawRewards: {
    type: 'cosmos-sdk/MsgWithdrawDelegationReward',
    gas: 140000,
  },
  govVote: {
    type: 'cosmos-sdk/MsgVote',
    gas: 250000,
  },
};

export const defaultSecretMsgOpts: SecretMsgOpts = {
  send: {
    secret20: {
      gas: 250000,
    },
  },

  createSecret20ViewingKey: {
    gas: 150000,
  },

  executeSecretWasm: {
    type: 'wasm/MsgExecuteContract',
  },
};

export const DefaultGasPriceStep: {
  low: number;
  average: number;
  high: number;
} = {
  low: 0.01,
  average: 0.025,
  high: 0.04,
};

class FeeConfig {
  toStdFee(feeType: FeeType, sendCurrency: Currency, customGas?: number) {
    const amount = this.getFeeTypePrimitive(feeType, sendCurrency, customGas);
    const gas = customGas
      ? customGas.toString()
      : this.gas(sendCurrency).toString();
    if (!amount) {
      return {
        gas,
        amount: [],
      };
    }

    return {
      gas,
      amount: [amount],
    };
  }

  get feeCurrency(): Currency | undefined {
    const { ecoSystemParams } = networkPreferenceService.getProviderConfig();
    return ecoSystemParams?.feeCurrencies[0];
  }

  get gasPriceStep(): GasPriceStep {
    const { ecoSystemParams } = networkPreferenceService.getProviderConfig();
    return ecoSystemParams?.gasPriceStep
      ? ecoSystemParams.gasPriceStep
      : DefaultGasPriceStep;
  }

  getFeeTypePrimitive(
    feeType: FeeType,
    sendCurrency: Currency,
    customGas?: number
  ) {
    if (!this.feeCurrency) {
      throw new Error('Fee currency not set');
    }

    const gasPrice = new Dec(this.gasPriceStep[feeType].toString());
    const gas = customGas ? customGas : this.gas(sendCurrency);
    const feeAmount = gasPrice.mul(new Dec(gas));

    return {
      denom: this.feeCurrency.coinMinimalDenom,
      amount: feeAmount.roundUp().toString(),
    };
  }

  getFeeTypePretty(
    feeType: FeeType,
    sendCurrency: Currency,
    customGas?: number
  ) {
    if (!this.feeCurrency) {
      throw new Error('Fee currency not set');
    }

    const feeTypePrimitive = this.getFeeTypePrimitive(
      feeType,
      sendCurrency,
      customGas
    );
    const feeCurrency = this.feeCurrency;
    console.log('feeTypePrimitive:', feeTypePrimitive, feeCurrency);

    return new CoinPretty(feeCurrency, new Int(feeTypePrimitive.amount))
      .maxDecimals(feeCurrency.coinDecimals)
      .trim(true)
      .toString();
  }

  gas(sendCurrency: Currency): number {
    const { chainId } = networkPreferenceService.getProviderConfig();
    const denomHelper = new DenomHelper(sendCurrency.coinMinimalDenom);

    switch (denomHelper.type) {
      case 'secret20': {
        const msgOptsFromCreator = getGasBySecret(chainId);
        const msgOptsCreator = deepmerge<
          SecretMsgOpts,
          DeepPartial<SecretMsgOpts>
        >(defaultSecretMsgOpts, msgOptsFromCreator ? msgOptsFromCreator : {});
        return msgOptsCreator.send.secret20.gas ?? 0;
      }
      case 'cw20': {
        const msgOpts = deepmerge<
          CosmwasmMsgOpts,
          DeepPartial<CosmwasmMsgOpts>
        >(defaultCosmwasmMsgOpts, {});
        return msgOpts.send.cw20.gas ?? 0;
      }
      default: {
        const msgOptsFromCreator = getGasByCosmos(chainId);
        const msgOpts = deepmerge<CosmosMsgOpts, DeepPartial<CosmosMsgOpts>>(
          defaultCosmosMsgOpts,
          msgOptsFromCreator ? msgOptsFromCreator : {}
        );
        return msgOpts.send.native.gas ?? 0;
      }
    }
  }
}

export default new FeeConfig();
