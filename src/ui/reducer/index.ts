import { combineReducers } from 'redux';
import networkSliceReducer from './network.reducer';
import customNetworkReducer from './customNetwork.reducer';
import transactionsReducer from './transactions.reducer';
import tokensReducer from './token.reducer';
import knownMethodReducer from './knownMethod.reducer';
import preferenceReducer from './preference.reducer';
import appStateReducer from './appState.reducer';
import gasReducer from './gas.reducer';

const rootReducer = combineReducers({
  activeTab: (s) => (s === undefined ? null : s),
  network: networkSliceReducer,
  customNetworks: customNetworkReducer,
  tokens: tokensReducer,
  transactions: transactionsReducer,
  knownMethod: knownMethodReducer,
  preference: preferenceReducer,
  appState: appStateReducer,
  gas: gasReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
