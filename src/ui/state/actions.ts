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
import { RootState } from '../reducer';
import { getMethodDataAsync } from '../utils/transactions';

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
  return (dispatch: ThunkDispatch<RootState, void, AnyAction>) => {
    _showLoadingIndication && dispatch(showLoadingIndicator());
    return new Promise<void>((resolve, reject) => {
      background.cancelTransaction(txData.id, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    })
      .then(() => {
        // dispatch(resetSendState());
        dispatch(completedTx(txData.id));
        dispatch(hideLoadingIndicator());
        // @todo:
        // dispatch(closeCurrentNotificationWindow());

        return txData;
      })
      .catch((error) => {
        dispatch(hideLoadingIndicator());
        throw error;
      });
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
      const cancellations = txIds.map(
        (id) =>
          new Promise<void>((resolve, reject) => {
            background.cancelTransaction(id, (err) => {
              if (err) {
                reject(err);
                return;
              }

              resolve();
            });
          })
      );

      await Promise.all(cancellations);

      // @todo:
      // dispatch(resetSendState());

      txIds.forEach((id) => {
        dispatch(completedTx(id));
      });
    } finally {
      if (getEnvironmentType() === ENVIRONMENT_TYPE_NOTIFICATION) {
        // @todo:
        // closeNotificationPopup();
      } else {
        dispatch(hideLoadingIndicator());
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
