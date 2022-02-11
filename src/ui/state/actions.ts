import { addHexPrefix } from 'background/utils/lib-util';
import { Dispatch } from 'redux';
import { RootState } from '../reducer';
import { getMethodDataAsync } from '../utils/transactions';

export function getContractMethodData(
  data = '',
  provider: any,
  background: any
) {
  return (dispatch: Dispatch, getState: () => RootState) => {
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
