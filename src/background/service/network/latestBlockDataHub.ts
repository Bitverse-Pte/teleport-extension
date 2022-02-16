import { ObservableStore } from '@metamask/obs-store';
import { PollingBlockTracker } from 'eth-block-tracker';
import { ethers } from 'ethers';
import eventBus from 'eventBus';

type BlockData = {
  /**
   * The Current GasLimit
   */
  currentBlockGasLimit: string;
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
  blockTracker: PollingBlockTracker;
  networkProviderStore: NetworkProviderStore;
}

export class LatestBlockDataHubService {
  currentBlockNumber: string | null;
  store: ObservableStore<BlockData>;
  private _blockTracker: PollingBlockTracker;
  private rpcUrl: string;
  private isUiOpened = false;

  constructor(opts: LatestBlockDataHubConstructorParams) {
    this.store = new ObservableStore({
      currentBlockGasLimit: '',
      isBaseFeePerGasExist: false,
    });

    this._blockTracker = opts.blockTracker;
    // blockTracker.currentBlock may be null
    this.currentBlockNumber = this._blockTracker.getCurrentBlock();
    this._blockTracker.once('latest', (blockNumber) => {
      this.currentBlockNumber = blockNumber;
    });
    // bind function for easier listener syntax
    this.updateForBlock = this.updateForBlock.bind(this);
    this.handleProviderChange = this.handleProviderChange.bind(this);
    this.handleUIStatus = this.handleUIStatus.bind(this);
    this.rpcUrl = opts.networkProviderStore.getState().provider.rpcUrl;
    // keep `rpcUrl` updated
    opts.networkProviderStore.subscribe(this.handleProviderChange);

    eventBus.addEventListener('UI_STATUS', this.handleUIStatus);
  }

  private handleUIStatus(_isUiOpened: boolean) {
    console.debug('LatestBlockDataHubService::UI_STATUS:', _isUiOpened);
    this.isUiOpened = _isUiOpened;
    if (!_isUiOpened) {
      this.stop();
    } else {
      // start if UI are back
      this.start();
    }
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
    if (!this.isUiOpened) {
      return;
    }
    this.currentBlockNumber = blockNumber;
    const p = new ethers.providers.JsonRpcProvider(this.rpcUrl);
    const currentBlock = await p.getBlock(blockNumber);
    /**
     * not update if block are null
     */
    if (!currentBlock) {
      return;
    }
    const currentBlockGasLimit = currentBlock.gasLimit.toHexString();
    // even it's 0, it's a BigNumber '0', so just use boolean
    // null / undefined will be false
    const isBaseFeePerGasExist = Boolean(currentBlock.baseFeePerGas);
    this.store.updateState({
      currentBlockGasLimit,
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
