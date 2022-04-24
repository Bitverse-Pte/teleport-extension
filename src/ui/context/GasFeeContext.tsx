import React, { createContext, useContext } from 'react';
import { Transaction } from 'constants/transaction';
import { EDIT_GAS_MODES } from 'constants/gas';
import { useGasFeeInputs } from 'ui/hooks/gasFeeInput/useGasFeeInput';

interface GasFeeContextProviderpropTypes {
  children: React.ReactNode;
  defaultEstimateToUse: string;
  transaction: Transaction;
  minimumGasLimit: string;
  editGasMode: EDIT_GAS_MODES;
}

export const GasFeeContext = createContext<ReturnType<typeof useGasFeeInputs>>(
  {} as any
);

export const GasFeeContextProvider = ({
  children,
  defaultEstimateToUse,
  transaction,
  minimumGasLimit,
  editGasMode,
}: GasFeeContextProviderpropTypes) => {
  const gasFeeDetails = useGasFeeInputs(
    defaultEstimateToUse,
    transaction,
    minimumGasLimit,
    editGasMode
  );
  return (
    <GasFeeContext.Provider value={gasFeeDetails}>
      {children}
    </GasFeeContext.Provider>
  );
};

export function useGasFeeContext() {
  return useContext(GasFeeContext);
}
