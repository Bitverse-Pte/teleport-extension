import { CosmosAccount, CosmosAccountImpl } from './cosmos';
import { CosmwasmAccount, CosmwasmAccountImpl } from './cosmwasm';
import { DenomHelper } from '@keplr-wallet/common';
import { getGasByCosmos } from './fee';

// const cosmosTxFn = (networkPreferenceService) => {
//   const {
//     rpcUrl,
//     chainId,
//     ecoSystemParams,
//     prefix: bech32Config,
//     coinType,
//   } = networkPreferenceService.getProviderConfig();
//   // console.log('-----------rpcUrl, chainId: -----------', rpcUrl, chainId, coinType);
//   const cosChainInfo = {
//     rpc: rpcUrl,
//     chainId,
//     rest: ecoSystemParams?.rest,
//     bech32Config,
//     coinType,
//   } as CosChainInfo;

//   const accountSetBase = new AccountSetBaseSuper(chainId, {
//     suggestChain: false,
//     autoInit: true,
//   });
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
            contractAddress
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
}

export default cosmosController;
