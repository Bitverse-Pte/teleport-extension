import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'remote-redux-devtools';
import rootReducer from '../reducer';

export default function configureStore() {
  /**
   * Load redux-thunk middleware to support async action
   */
  let storeEnhancers = applyMiddleware(thunkMiddleware);

  /**
   * Conditional loading redux tool
   */
  const shouldLoadReduxDevtools = process.env.REDUX_DEVTOOL_ENABLED;

  if (shouldLoadReduxDevtools) {
    console.debug('redux devtools will be loaded at localhost:8001');
    const composeEnhancers = composeWithDevTools({
      name: 'Teleport-Wallet-Extension',
      hostname: 'localhost',
      port: 8001,
      realtime: true,
    });
    /**
     * Load dev tools
     */
    storeEnhancers = composeEnhancers(storeEnhancers);
  }

  return createStore(rootReducer, storeEnhancers);
}
