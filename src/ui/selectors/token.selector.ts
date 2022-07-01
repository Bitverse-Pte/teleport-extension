import { createSelector } from 'reselect';
import { RootState } from 'ui/reducer';
import { getSelectedAddress } from './selectors';

export const getTokenBalancesOf = (account?: string) => (state: RootState) => {
  if (!state.tokens.balances || !account) return [];
  /** fallback to empty array, avoid undefined errors */
  return state.tokens.balances[account] || [];
};

export const getTokenBalancesOfCurrentAccount = createSelector(
  getSelectedAddress,
  (s: RootState) => s,
  (selectedAddress, rootState) => getTokenBalancesOf(selectedAddress)(rootState)
);
