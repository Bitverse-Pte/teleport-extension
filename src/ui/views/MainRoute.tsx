import React, { Fragment, lazy } from 'react';
import { Switch, Route } from 'react-router-dom';
import { LazyPrivateRoute } from 'ui/components';
import Welcome from 'ui/views/Welcome/Welcome';
import { AddChain } from './Approval/components';
import { DarkModeTest } from './_DarkModeTest';

const AccountCreate = lazy(() => import('ui/views/AccountCreate'));
const MnemonicBackup = lazy(() => import('ui/views/MnemonicBackup'));
const NetworkSelection = lazy(() => import('./Network/NetworksSelectionPage'));
const NetworkEdit = lazy(() => import('./Network/NetworkEdit'));
// const NetworkEdit = lazy(() => import('./Network/NetworkEdit'));
const AccountRecover = lazy(() => import('ui/views/AccountRecover'));
const Home = lazy(() => import('ui/views/Home'));
const Approval = lazy(() => import('ui/views/Approval'));
const WalletManage = lazy(() => import('ui/views/WalletManage'));
const AccountManage = lazy(() => import('ui/views/AccountManage'));
const TestTxList = lazy(() => import('./TestTxList'));
const TokenManage = lazy(() => import('ui/views/TokenManage'));
const SingleToken = lazy(() => import('ui/views/SingleToken'));
const TokenAdd = lazy(() => import('ui/views/TokenAdd'));
const AboutSoftware = lazy(() => import('ui/views/AboutSoftware'));
const MnemonicCheck = lazy(() => import('ui/views/MnemonicCheck'));
const ActivityDetail = lazy(
  () => import('ui/views/Transaction/TransactionDetail')
);

const CosmosActivityDetail = lazy(
  () => import('ui/views/Transaction/CosmosTransactionDetail')
);

const MpcRecoveryWallet = lazy(() => import('ui/views/MpcRecoveryWallet'));

const Send = lazy(() => import('ui/views/Send'));
const SendCos = lazy(() => import('ui/views/SendCos'));
const ConfirmSendCos = lazy(() => import('ui/views/SendCosConfirm'));
const Receive = lazy(() => import('ui/views/Receive'));
const GasFee = lazy(() => import('ui/views/GasFee'));
const Policy = lazy(() => import('ui/views/Policy'));

const Main = () => {
  return (
    <Fragment>
      <Switch>
        <LazyPrivateRoute exact path="/welcome">
          <Welcome />
        </LazyPrivateRoute>

        <LazyPrivateRoute exact path="/create">
          <AccountCreate />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/mnemonic-backup">
          <MnemonicBackup />
        </LazyPrivateRoute>

        <LazyPrivateRoute exact path="/network">
          <NetworkSelection />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/network/edit/:id">
          <NetworkEdit />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/network/add">
          <NetworkEdit />
        </LazyPrivateRoute>

        <LazyPrivateRoute exact path="/recover">
          <AccountRecover />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/home">
          <Home />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/about">
          <AboutSoftware />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/receive/:symbol">
          <Receive />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/wallet-manage">
          <WalletManage />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/account-manage">
          <AccountManage />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/test-tx-list">
          <TestTxList />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/token-manage">
          <TokenManage />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/token-add">
          <TokenAdd />
        </LazyPrivateRoute>

        <LazyPrivateRoute exact path="/single-token/:tokenId">
          <SingleToken />
        </LazyPrivateRoute>

        <LazyPrivateRoute exact path="/mnemonic-check">
          <MnemonicCheck />
        </LazyPrivateRoute>

        <LazyPrivateRoute exact path="/activity/:activityId">
          <ActivityDetail />
        </LazyPrivateRoute>

        <LazyPrivateRoute exact path="/policy">
          <Policy />
        </LazyPrivateRoute>

        {/* Remove these two routes when we feel good about them  */}
        <LazyPrivateRoute exact path="/mock/switchNetworkPrompt">
          <AddChain
            params={{
              data: [{ chainId: '0x1' }],
              session: {
                origin: 'https://foo.bar',
                icon: 'https://metamask.github.io/test-dapp/metamask-fox.svg',
                name: 'The ACME Dapp',
              },
            }}
          />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/cosmos/activity/:activityId">
          <CosmosActivityDetail />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/dev/darkmode">
          <DarkModeTest />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/mock/addNetworkPrompt">
          <AddChain
            params={{
              data: [
                {
                  chainId: '0x114514',
                  chainName: 'YJSP Mainnet',
                  nativeCurrency: {
                    name: 'YAJU SENPAI',
                    symbol: 'YAJU',
                    decimals: 18,
                  },
                  rpcUrls: ['https://foo.bar/rpc'],
                  blockExplorerUrls: ['https://foosacn.bar'],
                },
              ],
              session: {
                origin: 'https://foo.bar',
                icon: 'https://metamask.github.io/test-dapp/metamask-fox.svg',
                name: 'The ACME Dapp',
              },
            }}
          />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/send">
          <Send />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/send-cos">
          <SendCos />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/send-cos/:tokenId">
          <SendCos />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/confirm-send-cos">
          <ConfirmSendCos />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/send/:tokenId">
          <Send />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/receive/:symbol">
          <Receive />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/confirm-transaction">
          <Approval />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/gas-fee">
          <GasFee />
        </LazyPrivateRoute>
        <LazyPrivateRoute exact path="/mpc-recovery-wallet">
          <MpcRecoveryWallet />
        </LazyPrivateRoute>
      </Switch>
    </Fragment>
  );
};

export default Main;
