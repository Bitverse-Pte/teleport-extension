import {
  EthGasPriceEstimate,
  GasFeeController,
  GasFeeEstimates,
  LegacyGasPriceEstimate,
} from '@metamask/controllers';
import { ObservableStore } from '@metamask/obs-store';
import { PollingBlockTracker } from 'eth-block-tracker';
import EthQuery from 'eth-query';
import pify from 'pify';
import eventBus from 'eventBus';

type BlockData = {
  /**
   * The Current GasLimit
   */
  currentBlockGasLimit: string;
  /**
   * The Current gasFeeEstimates
   */
  gasFeeEstimates:
    | EthGasPriceEstimate
    | GasFeeEstimates
    | LegacyGasPriceEstimate
    | Record<string, never>;
  /**
   * Indicate a EVM chain is implemented EIP1559 or not
   */
  isBaseFeePerGasExist: boolean;
};

type NetworkProviderStore = ObservableStore<{
  provider: {
    rpcUrl: string;
  };
}>;

interface LatestBlockDataHubConstructorParams {
  provider: any;
  blockTracker: PollingBlockTracker;
  gasFeeTracker: GasFeeController;
  networkProviderStore: NetworkProviderStore;
  getPopupOpen: () => boolean;
}

export class LatestBlockDataHubService {
  currentBlockNumber: string | null;
  gasFeeEstimates: any | null;
  store: ObservableStore<BlockData>;
  private _blockTracker: PollingBlockTracker;
  private _gasFeeTracker: GasFeeController;
  private _provider: any;
  private _query: any;
  private rpcUrl: string;
  private getPopupOpen: () => boolean;

  constructor(opts: LatestBlockDataHubConstructorParams) {
    this.store = new ObservableStore({
      currentBlockGasLimit: '',
      gasFeeEstimates: {},
      isBaseFeePerGasExist: false,
    });
    this.getPopupOpen = opts.getPopupOpen;

    this._provider = opts.provider;
    this._query = pify(new EthQuery(this._provider));

    this._blockTracker = opts.blockTracker;
    // blockTracker.currentBlock may be null
    this.currentBlockNumber = this._blockTracker.getCurrentBlock();
    this._blockTracker.once('latest', (blockNumber) => {
      this.currentBlockNumber = blockNumber;
    });
    this._gasFeeTracker = opts.gasFeeTracker;
    // bind function for easier listener syntax
    this.updateForBlock = this.updateForBlock.bind(this);
    this.handleProviderChange = this.handleProviderChange.bind(this);
    this.rpcUrl = opts.networkProviderStore.getState().provider.rpcUrl;
    // keep `rpcUrl` updated
    opts.networkProviderStore.subscribe(this.handleProviderChange);
  }

  fetchLatestBlockNow() {
    return this.updateForBlock('latest');
  }

  /**
   * Given a block, updates this AccountTracker's currentBlockGasLimit
   *
   * @private
   * @param blockNumber - the block number to update to.
   * @fires 'block' The updated state, if all account updates are successful
   */
  private async updateForBlock(blockNumber: string) {
    /**
     * not update when UI close
     */
    if (!this.getPopupOpen()) {
      console.debug(
        'LatestBlockDataHubService::updateForBlock: skipped because popup is not open.'
      );
      return;
    }
    this.currentBlockNumber = blockNumber;
    const currentBlock = await this._query.getBlockByNumber(blockNumber, false);
    if (!currentBlock) {
      return;
    }
    console.debug('LatestBlockDataHubService::currentBlock:', currentBlock);
    const currentBlockGasLimit = currentBlock.gasLimit;
    /**
     * not update if block are null
     */
    if (!currentBlock) {
      return;
    }
    // even it's 0, it's a BigNumber '0', so just use boolean
    // null / undefined will be false
    const isBaseFeePerGasExist = currentBlock.baseFeePerGas !== undefined;

    const gasFeeState = await this._gasFeeTracker.fetchGasFeeEstimates();
    const gasFeeEstimates = gasFeeState.gasFeeEstimates;
    this.store.updateState({
      currentBlockGasLimit,
      gasFeeEstimates,
      isBaseFeePerGasExist,
    });
    console.debug(
      `LatestBlockDataHubService::updateForBlock: executed for block ${blockNumber} for RPC ${this.rpcUrl}`
    );
  }

  private async handleProviderChange(
    state: ReturnType<NetworkProviderStore['getState']>
  ) {
    const isRpcChanged = this.rpcUrl !== state.provider.rpcUrl;
    if (!isRpcChanged) {
      // skip
      return;
    }
    console.debug(
      'LatestBlockDataHubService::handleProviderChange: changing rpcUrl to: ',
      state.provider.rpcUrl
    );
    this.rpcUrl = state.provider.rpcUrl;
    this.start();
  }

  start() {
    // remove first to avoid double add
    this._blockTracker.removeListener('latest', this.updateForBlock);
    // add listener
    this._blockTracker.addListener('latest', this.updateForBlock);
  }

  stop() {
    // remove listener
    this._blockTracker.removeListener('latest', this.updateForBlock);
  }
}
