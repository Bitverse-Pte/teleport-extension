import React, { lazy, Suspense } from 'react';
import { Store } from 'redux';
import { Provider, useSelector } from 'react-redux';
import { HashRouter as Router, Route } from 'react-router-dom';
import MainRoute from './MainRoute';

import Unlock from './Unlock';
import SortHat from 'ui/views/SortHat';

// const AsyncMainRoute = lazy(() => import('./MainRoute'));
import { WalletProvider } from 'ui/utils';
import { NetworkStoreProvider } from '../context/NetworkProvider';
import { BackgroundDataSyncMiddleware } from '../context/BackgroundDataToStoreProvider';
import { LoadingScreen } from '../components/LoadingScreen';
import { message } from 'antd';

const Main = () => {
  /**
   * We limit the maximum of `message` that pops at one page.
   */
  message.config({
    maxCount: 2,
  });
  const appState = useSelector((state) => state.appState);
  return (
    <>
      {appState.isLoading ? (
        <LoadingScreen loadingMessage={'Waiting...'} />
      ) : null}
      <Router>
        <Route exact path="/">
          <SortHat />
        </Route>
        <Route exact path="/unlock">
          <Unlock />
        </Route>
        {/* <Suspense fallback={null}> */}
        {/* <AsyncMainRoute /> */}
        <MainRoute />
        {/* </Suspense> */}
      </Router>
    </>
  );
};

/**
 * You can inject Context Providers here!
 * @param childrens  children elements into be injected
 */
const ProvidersInjector = ({
  store,
  wallet,
  children,
}: {
  store: Store;
  wallet: any;
  children: JSX.Element;
}) => {
  return (
    <Provider store={store}>
      <BackgroundDataSyncMiddleware />
      <WalletProvider wallet={wallet}>
        <NetworkStoreProvider>{children}</NetworkStoreProvider>
      </WalletProvider>
    </Provider>
  );
};

const App = ({ store, wallet }: { store: Store; wallet: any }) => {
  return (
    <ProvidersInjector store={store} wallet={wallet}>
      <Main />
    </ProvidersInjector>
  );
};

export default App;
