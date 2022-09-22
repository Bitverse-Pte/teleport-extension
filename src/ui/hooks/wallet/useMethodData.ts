import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  currentEthProviderSelector,
  getKnownMethodData,
} from 'ui/selectors/selectors';
import { getContractMethodData as getContractMethodDataAction } from 'ui/state/actions';
import { useWallet } from 'ui/utils';

/**
 * Access known method data and attempt to resolve unknown method data
 *
 * encapsulates an effect that will fetch methodData when the component mounts,
 * and subsequently anytime the provided data attribute changes. Note that
 * the getContractMethodData action handles over-fetching prevention, first checking
 * if the data is in the store and returning it directly. While using this hook
 * in multiple places in a tree for the same data will create extra event ticks and
 * hit the action more frequently, it should only ever result in a single store update
 * @param data - the transaction data to find method data for
 * @return contract method data
 */
export function useMethodData(data?: string) {
  const dispatch = useDispatch();
  const knownMethodData = useSelector((state) =>
    getKnownMethodData(state, data)
  );
  const backgroundCtrler = useWallet();
  const provider = useSelector(currentEthProviderSelector);
  const getContractMethodData = useCallback(
    (methodData?: string) => {
      console.debug('getContractMethodData::triggered');
      return dispatch(
        getContractMethodDataAction(methodData, provider, backgroundCtrler)
      );
    },
    [dispatch, backgroundCtrler, provider]
  );

  useEffect(() => {
    /**
     * only trigger if no data exist for data
     */
    if (!knownMethodData && data) {
      console.debug(`getContractMethodData for ${data}`);
      getContractMethodData(data);
    }
  }, [getContractMethodData, data, knownMethodData]);
  return knownMethodData;
}
