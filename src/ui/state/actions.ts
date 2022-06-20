import { addHexPrefix, getEnvironmentType } from 'background/utils/lib-util';
import { ENVIRONMENT_TYPE_NOTIFICATION } from 'constants/app';
import { AnyAction, Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
// import txHelper from 'ui/helpers/utils/tx-helper';
import {
  hideLoadingIndicator,
  showLoadingIndicator,
} from 'ui/reducer/appState.reducer';
// import { getCurrentChainId } from 'ui/selectors/selectors';
// import {
//   unapprovedMsgsSelector,
//   unapprovedTxsSelector,
//   unapprovedPersonalMsgsSelector,
//   unapprovedDecryptMsgsSelector,
//   unapprovedEncryptionPublicKeyMsgsSelector,
//   unapprovedTypedMessagesSelector,
// } from 'ui/selectors/transactions';
import { GasFeeState } from '@metamask/controllers';
import { RootState } from '../reducer';
import { getMethodDataAsync } from '../utils/transactions';
import { Transaction } from 'constants/transaction';

let background: Record<string, any>;
export function _setBackgroundConnection(backgroundConnection) {
  background = backgroundConnection;
}

export function getContractMethodData(
  data = '',
  provider: any,
  background: any
) {
  return (_: Dispatch, getState: () => RootState) => {
    const prefixedData: string = addHexPrefix(data);
    const fourBytePrefix = prefixedData.slice(0, 10);
    const knownMethodData = getState().knownMethod;

    if (
      (knownMethodData &&
        knownMethodData[fourBytePrefix] &&
        Object.keys(knownMethodData[fourBytePrefix] || {}).length !== 0) ||
      fourBytePrefix === '0x'
    ) {
      return Promise.resolve(knownMethodData[fourBytePrefix]);
    }

    // dispatch(loadingMethodDataStarted());
    console.debug('loadingMethodData');

    return getMethodDataAsync(fourBytePrefix, provider).then(
      ({ name, params }) => {
        // dispatch(loadingMethodDataFinished());
        background.addKnownMethodData(
          fourBytePrefix,
          { name, params },
          (err) => {
            if (err) {
              // dispatch(displayWarning(err.message));
            }
          }
        );
        return { name, params };
      }
    );
  };
}

export function cancelTx(
  txData: { id: string },
  _showLoadingIndication = true,
  background: any
) {
  return async (dispatch: ThunkDispatch<RootState, void, AnyAction>) => {
    _showLoadingIndication && dispatch(showLoadingIndicator());
    try {
      await background.cancelTransaction(txData.id);
      // dispatch(resetSendState());
      // dispatch(completedTx(txData.id));
      dispatch(hideLoadingIndicator());
      console.debug('hideLoadingIndicator::after');
      // @todo:
      // dispatch(closeCurrentNotificationWindow());

      return txData;
    } catch (error) {
      dispatch(hideLoadingIndicator());
      throw error;
    }
  };
}

/**
 * Cancels all of the given transactions
 *
 * @param txDataList - a list of tx data objects
 */
export function cancelTxs(txDataList: { id: string }[], background: any) {
  return async (dispatch: ThunkDispatch<RootState, void, AnyAction>) => {
    dispatch(showLoadingIndicator());

    try {
      const txIds = txDataList.map(({ id }) => id);
      const cancellations = txIds.map((id) => background.cancelTransaction(id));
      console.debug('before promise');
      await Promise.all(cancellations);
      console.debug('after promise');
      // @todo:
      // dispatch(resetSendState());

      // txIds.forEach((id) => {
      //   dispatch(completedTx(id));
      // });
    } finally {
      // hiding loading indicator no matter what
      dispatch(hideLoadingIndicator());
      console.debug('hideLoadingIndicator::after');
      if (getEnvironmentType() === ENVIRONMENT_TYPE_NOTIFICATION) {
        closeNotificationPopup();
      }
    }
  };
}

export function completedTx(id: string) {
  return (
    dispatch: ThunkDispatch<RootState, void, AnyAction>,
    getState: () => RootState
  ) => {
    /**
     * This emit a `COMPLETED_TX` event to refresh metamask's UI
     * I think we can ignore it since we are not MetaMask
     * but feel free to enable our own's `COMPLETED_TX` event
     *
     * original logic: https://github.com/MetaMask/metamask-extension/blob/a1eaa33b45adc7cbfd4a52658ae489e65a05361c/ui/ducks/app/app.js#L209-L226
     */
    // const state = getState();
    // const chainId = getCurrentChainId(state);
    // const unconfirmedActions = txHelper(
    //   unapprovedTxsSelector(state),
    //   unapprovedMsgsSelector(state),
    //   unapprovedPersonalMsgsSelector(state),
    //   unapprovedDecryptMsgsSelector(state),
    //   unapprovedEncryptionPublicKeyMsgsSelector(state),
    //   unapprovedTypedMessagesSelector(state),
    //   chainId
    // );
    // const otherUnconfirmedActions = unconfirmedActions.filter(
    //   (tx) => tx.id !== id
    // );
    // dispatch({
    //   // actionConstant.COMPLETED_TX
    //   type: 'COMPLETED_TX',
    //   value: {
    //     id,
    //     unconfirmedActionsCount: otherUnconfirmedActions.length,
    //   },
    // });
  };
}

export function updateTransactionParams(id: string, txParams: any) {
  // let { currentNetworkTxList } = metamaskState;
  // currentNetworkTxList = currentNetworkTxList.map((tx) => {
  //   if (tx.id === txId) {
  //     const newTx = { ...tx };
  //     newTx.txParams = value;
  //     return newTx;
  //   }
  //   return tx;
  // });
  // return {
  //   ...metamaskState,
  //   currentNetworkTxList,
  // };
}

export function updateTransaction(
  txData: Transaction,
  dontShowLoadingIndicator?: boolean
) {
  return async (dispatch) => {
    !dontShowLoadingIndicator && dispatch(showLoadingIndicator());

    try {
      await background.updateTransaction(txData);
    } catch (error) {
      console.error('updateTransaction::error', error);
      // dispatch(updateTransactionParams(txData.id, txData.txParams));
      // dispatch(hideLoadingIndication());
      // dispatch(txError(error));
      // dispatch(goHome());
      // log.error(error.message);
      throw error;
    }

    // try {
    //   dispatch(updateTransactionParams(txData.id, txData.txParams));
    //   // dispatch(updateMetamaskState(newState));
    //   // dispatch(showConfTxPage({ id: txData.id }));
    //   return txData;
    // } finally {
    //   dispatch(hideLoadingIndicator());
    // }
    dispatch(hideLoadingIndicator());
  };
}

export function createCancelTransaction(
  txId: string,
  customGasSettings: any,
  newTxMetaProps: Partial<Transaction>
) {
  console.debug('background.cancelTransaction');
  // let newTxId: string;

  return async (dispatch: ThunkDispatch<RootState, void, AnyAction>) => {
    // await new Promise((resolve, reject) => {
    const res = await background.createCancelTransaction(
      txId,
      customGasSettings,
      newTxMetaProps
    );
    console.info('createCancelTransaction::res', res);
    return res.id;
  };
}

export function createSpeedUpTransaction(
  txId: string,
  customGasSettings: any,
  newTxMetaProps: Partial<Transaction>
) {
  console.debug('background.createSpeedUpTransaction');
  // let newTx;

  return async (dispatch: ThunkDispatch<RootState, void, AnyAction>) => {
    // await new Promise((resolve, reject) => {
    const res = await background.createSpeedUpTransaction(
      txId,
      customGasSettings,
      newTxMetaProps
    );
    // const { currentNetworkTxList } = newState;
    // newTx = currentNetworkTxList[currentNetworkTxList.length - 1];
    // return newTx;
    console.info('createSpeedUpTransaction::res', res);
    return res.id;
  };
}

export function createRetryTransaction(txId: string, customGasSettings: any) {
  // let newTx;

  return async (dispatch: ThunkDispatch<RootState, void, AnyAction>) => {
    // await new Promise((resolve, reject) => {
    await background.createSpeedUpTransaction(txId, customGasSettings);

    // const { currentNetworkTxList } = newState;
    // newTx = currentNetworkTxList[currentNetworkTxList.length - 1];
    // return newTx;
  };
}

export function estimateGas(params) {
  return background.estimateGas(params);
}

export function fetchGasFeeEstimates(): any {
  return background.fetchGasFeeEstimates();
}

export function closeNotificationPopup() {
  return background.setPopupOpen(false);
}

export function getTokenBalancesSync() {
  return background.getTokenBalancesSync();
}
