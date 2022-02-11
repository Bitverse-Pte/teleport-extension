import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useWallet } from './WalletContext';
import { POLICY_AGREED } from 'constants/wallet';
import { getUiType } from './index';

export const useApproval = () => {
  const wallet = useWallet();
  const history = useHistory();

  const getApproval = useMemo(() => wallet.getApproval, [wallet.getApproval]);

  const resolveApproval = useCallback(
    async (data?: any) => {
      const approval = await getApproval();

      if (approval) {
        wallet.resolveApproval(data);
      }
      history.replace('/');
    },
    [wallet.resolveApproval, history, getApproval]
  );

  const rejectApproval = useCallback(
    async (err?) => {
      const approval = await getApproval();
      if (approval) {
        await wallet.rejectApproval(err);
      }
      history.replace('/');
    },
    [wallet.rejectApproval, getApproval, history]
  );

  useEffect(() => {
    if (!getUiType().isNotification) {
      return;
    }
    window.addEventListener('beforeunload', rejectApproval);

    return () => window.removeEventListener('beforeunload', rejectApproval);
  }, []);

  return [getApproval, resolveApproval, rejectApproval] as const;
};
/**
export const useSelectOption = <T>({
                                     options,
                                     defaultValue = [],
                                     onChange,
                                     value
                                   }: {
  options: T[];
  defaultValue?: T[];
  onChange?: (arg: T[]) => void;
  value?: T[];
}) => {
  const isControlled = useRef(typeof value !== "undefined").current;
  const [idxs, setChoosedIdxs] = useState(
    (isControlled ? value! : defaultValue).map((x) => options.indexOf(x))
  );

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    // shallow compare
    if (value && idxs.some((x, i) => options[x] != value[i])) {
      setChoosedIdxs(value.map((x) => options.indexOf(x)));
    }
  }, [value]);

  const changeValue = (idxs: number[]) => {
    setChoosedIdxs([...idxs]);
    onChange && onChange(idxs.map((o) => options[o]));
  };

  const handleRemove = (i: number) => {
    idxs.splice(i, 1);
    changeValue(idxs);
  };

  const handleChoose = (i: number) => {
    if (idxs.includes(i)) {
      return;
    }

    idxs.push(i);
    changeValue(idxs);
  };

  const handleToggle = (i: number) => {
    const inIdxs = idxs.indexOf(i);
    if (inIdxs !== -1) {
      handleRemove(inIdxs);
    } else {
      handleChoose(i);
    }
  };

  const handleClear = () => {
    changeValue([]);
  };

  return [
    idxs.map((o) => options[o]),
    handleRemove,
    handleChoose,
    handleToggle,
    handleClear,
    idxs
  ] as const;
};*/

export const useWalletRequest = (
  requestFn,
  {
    onSuccess,
    onError,
  }: { onSuccess?(arg: any): void; onError?(arg: any): void }
) => {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [loading, setLoading] = useState<boolean>(false);
  const [res, setRes] = useState<any>();
  const [err, setErr] = useState<any>();

  const run = async (...args) => {
    setLoading(true);
    try {
      const _res = await Promise.resolve(requestFn(...args));
      if (!mounted.current) {
        return;
      }
      setRes(_res);
      onSuccess && onSuccess(_res);
    } catch (err) {
      if (!mounted.current) {
        return;
      }
      setErr(err);
      onError && onError(err);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  return [run, loading, res, err] as const;
};

export function useAsyncEffect<T, U extends any[]>(
  method: () => Promise<T>,
  deps?: U
) {
  useEffect(() => {
    (async () => {
      await method();
    })();
  }, deps);
}

export function usePolicyAgreed() {
  let policyShow = false;
  const policyAgreed = localStorage.getItem(POLICY_AGREED);
  if (!policyAgreed || policyAgreed !== 'true') {
    policyShow = true;
  }
  const updateStoragePolicyAgreed = () => {
    localStorage.setItem(POLICY_AGREED, 'true');
  };
  return [policyShow, updateStoragePolicyAgreed] as const;
}
