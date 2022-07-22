import { combineReducers } from 'redux';
import networkSliceReducer from './network.reducer';
import customNetworkReducer from './customNetwork.reducer';
import transactionsReducer from './transactions.reducer';
import cosmosTxsReducer from './cosmosTxs.reducer';
import tokensReducer from './token.reducer';
import knownMethodReducer from './knownMethod.reducer';
import preferenceReducer from './preference.reducer';
import appStateReducer from './appState.reducer';
import gasReducer from './gas.reducer';
import sendReducer from './send.reducer';
import currentBlockReducer from './block.reducer';

const rootReducer = combineReducers({
  activeTab: (s) => (s === undefined ? null : s),
  network: networkSliceReducer,
  customNetworks: customNetworkReducer,
  tokens: tokensReducer,
  transactions: transactionsReducer,
  cosmosTxHistory: cosmosTxsReducer,
  knownMethod: knownMethodReducer,
  preference: preferenceReducer,
  appState: appStateReducer,
  gas: gasReducer,
  send: sendReducer,
  currentBlock: currentBlockReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
