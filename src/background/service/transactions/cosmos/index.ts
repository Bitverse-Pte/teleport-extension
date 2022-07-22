import { CosmosAccount, CosmosAccountImpl } from './cosmos';
import { CosmwasmAccount, CosmwasmAccountImpl } from './cosmwasm';
import { DenomHelper } from '@keplr-wallet/common';
import { getGasByCosmos } from './fee';
import { CosChainInfo } from './types';

class cosmosController {
  cosmosAccount: CosmosAccountImpl;
  cosmwasmAccount: CosmwasmAccountImpl;
  constructor(networkPreferenceService) {
    const { chainId } = networkPreferenceService.getProviderConfig();
    const cosmosAccount = CosmosAccount({
      chainId,
      msgOptsCreator: getGasByCosmos,
    });
    this.cosmosAccount = cosmosAccount;
    const cosmwasmAccount = CosmwasmAccount({
      base: cosmosAccount,
      chainId,
    });
    this.cosmwasmAccount = cosmwasmAccount;
  }

  sendToken(
    amount: string,
    currency,
    recipient: string,
    contractAddress,
    memo = '',
    stdFee = {},
    signOptions,
    onTxEvents
  ) {
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    // cw20, secret20, native
    switch (denomHelper.type) {
      case 'native': {
        return this.cosmosAccount.processSendToken(
          amount,
          currency,
          recipient,
          memo,
          stdFee,
          signOptions,
          onTxEvents
        );
      }
      case 'cw20': {
        return this.cosmwasmAccount.processSendToken(
          amount,
          {
            ...currency,
            type: 'cw20',
            contractAddress,
          },
          recipient,
          memo,
          stdFee,
          signOptions,
          onTxEvents
        );
      }
      default:
        return false;
    }
  }
  async generateMsg(options: {
    amount: string;
    currency;
    recipient: string;
    memo: string;
    stdFee;
    contractAddress?: string;
  }) {
    const { amount, currency, recipient, memo, stdFee, contractAddress } =
      options;
    const denomHelper = new DenomHelper(currency.coinMinimalDenom);
    // cw20, secret20, native
    switch (denomHelper.type) {
      case 'native': {
        return this.cosmosAccount.generateMsg(
          amount,
          currency,
          recipient,
          memo,
          stdFee
        );
      }
      case 'cw20': {
        return this.cosmwasmAccount.generateMsg(
          amount,
          currency,
          recipient,
          contractAddress,
          memo,
          stdFee
        );
      }
      default:
        return false;
    }
  }
  async sendTx(
    cosChainInfo: CosChainInfo,
    tx: unknown,
    mode: 'async' | 'sync' | 'block',
    txId: string
  ): Promise<Uint8Array> {
    return this.cosmosAccount.sendTx(cosChainInfo, tx, mode, txId);
  }
}

export default cosmosController;
