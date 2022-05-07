import { createSelector } from '@reduxjs/toolkit';
import { defaultNetworks } from 'constants/defaultNetwork';
import type { RootState } from 'ui/reducer';

export const getCustomProvidersSelector = (state: RootState) =>
  state.customNetworks.networks;

export const getEnabledProvidersSelector = createSelector(
  getCustomProvidersSelector,
  (customProviders) => {
    const presetProviders = Object.values(defaultNetworks).filter((val) => {
      // no null, undefined and no empty object
      return Boolean(val) && Object.keys(val).length > 0;
    });
    return [...presetProviders, ...customProviders];
  }
);
