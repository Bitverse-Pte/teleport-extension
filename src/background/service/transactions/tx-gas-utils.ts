import EthQuery from 'ethjs-query';
import log from 'loglevel';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { cloneDeep } from 'lodash';
import { hexToBn, BnMultiplyByFraction, bnToHex } from './lib/lib-util';
import { TransactionMeta } from './typing';
import ns from '../network';
interface GasAnalysisResult {
  blockGasLimit: string;
  estimatedGasHex: string;
  simulationFails: any;
}

/**
tx-gas-utils are gas utility methods for Transaction manager
its passed ethquery
and used to do things like calculate gas of a tx.
@param {Object} provider - A network provider.
*/

export default class TxGasUtil {
  query!: any;
  constructor(provider) {
    this.query = ns.getCurrentEth();
  }

  /**
    @param {Object} txMeta - the txMeta object
    @returns {GasAnalysisResult} The result of the gas analysis
  */
  async analyzeGasUsage(txMeta: TransactionMeta): Promise<GasAnalysisResult> {
    const block = await ns.getCurrentEth().getBlockByNumber('latest', false);

    // fallback to block gasLimit
    const blockGasLimitBN = hexToBn(block.gasLimit);
    const saferGasLimitBN = BnMultiplyByFraction(blockGasLimitBN, 19, 20);
    let estimatedGasHex = bnToHex(saferGasLimitBN);
    let simulationFails;
    try {
      estimatedGasHex = await this.estimateTxGas(txMeta);
    } catch (error) {
      log.warn(error);
      simulationFails = {
        reason: (error as any).message,
        errorKey: (error as any).errorKey,
        debug: { blockNumber: block.number, blockGasLimit: block.gasLimit },
      };
    }

    return { blockGasLimit: block.gasLimit, estimatedGasHex, simulationFails };
  }

  /**
    Estimates the tx's gas usage
    @param {Object} txMeta - the txMeta object
    @returns {string} the estimated gas limit as a hex string
  */
  async estimateTxGas(txMeta: TransactionMeta): Promise<string> {
    const txParams = cloneDeep(txMeta.txParams);

    // `eth_estimateGas` can fail if the user has insufficient balance for the
    // value being sent, or for the gas cost. We don't want to check their
    // balance here, we just want the gas estimate. The gas price is removed
    // to skip those balance checks. We check balance elsewhere. We also delete
    // maxFeePerGas and maxPriorityFeePerGas to support EIP-1559 txs.
    delete txParams.gasPrice;
    delete txParams.maxFeePerGas;
    delete txParams.maxPriorityFeePerGas;

    // estimate tx gas requirements
    return await ns.getCurrentEth().estimateGas(txParams);
  }

  /**
    Adds a gas buffer with out exceeding the block gas limit

    @param {string} initialGasLimitHex - the initial gas limit to add the buffer too
    @param {string} blockGasLimitHex - the block gas limit
    @returns {string} the buffered gas limit as a hex string
  */
  addGasBuffer(
    initialGasLimitHex: string,
    blockGasLimitHex: string,
    multiplier = 1.5
  ): string {
    const initialGasLimitBn = hexToBn(initialGasLimitHex);
    const blockGasLimitBn = hexToBn(blockGasLimitHex);
    const upperGasLimitBn = blockGasLimitBn.muln(0.9);
    const bufferedGasLimitBn = initialGasLimitBn.muln(multiplier);

    // if initialGasLimit is above blockGasLimit, dont modify it
    if (initialGasLimitBn.gt(upperGasLimitBn)) {
      return bnToHex(initialGasLimitBn);
    }
    // if bufferedGasLimit is below blockGasLimit, use bufferedGasLimit
    if (bufferedGasLimitBn.lt(upperGasLimitBn)) {
      return bnToHex(bufferedGasLimitBn);
    }
    // otherwise use blockGasLimit
    return bnToHex(upperGasLimitBn);
  }

  async getBufferedGasLimit(txMeta: TransactionMeta, multiplier?: number) {
    const { blockGasLimit, estimatedGasHex, simulationFails } =
      await this.analyzeGasUsage(txMeta);

    // add additional gas buffer to our estimation for safety
    const gasLimit = this.addGasBuffer(
      addHexPrefix(estimatedGasHex),
      blockGasLimit,
      multiplier
    );
    return { gasLimit, simulationFails };
  }
}
