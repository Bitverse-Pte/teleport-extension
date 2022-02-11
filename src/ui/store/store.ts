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
   * @todo:
   * Conditional loading redux tool
   */
  const isLoadingReduxDevtools = true;

  if (isLoadingReduxDevtools) {
    const composeEnhancers = composeWithDevTools({
      name: 'Teleport-Wallet-Extension',
      hostname: 'localhost',
      port: 8000,
      realtime: true,
    });
    /**
     * Load dev tools
     */
    storeEnhancers = composeEnhancers(storeEnhancers);
  }

  return createStore(rootReducer, storeEnhancers);
}
