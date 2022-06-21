import React, {
  useState,
  createContext,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Button } from 'antd';
import { useWallet } from 'ui/utils';

const ConfirmTx = () => {
  const wallet = useWallet();
  const history = useHistory();
  // amount, recipient: toAddress, memo
  const { state, pathname } = useLocation<{
    amount: string;
    recipient: string;
    memo: string;
  }>();

  console.log(state, pathname);
  const { amount, recipient, memo } = state;

  const next = async () => {
    console.log('next');
    // const amount = 0.001;
    // chainInfo.currencies[0];
    const currency = {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
      coinGeckoId: 'osmosis',
    };
    // const recipient = 'osmo17lds9mrleuqq3g88wwkxt4x97q6mcg80e35d5l';
    // const memo = 'hello123';
    const stdFee = {
      amount: [
        {
          denom: 'uosmo',
          amount: '2500',
        },
      ],
      gas: '200000',
    };
    const signOptions = {
      preferNoSetFee: true,
      preferNoSetMemo: true,
    };
    const onTxEvents = {
      onBroadcasted: (txHash) => {
        console.log('--------------onBroadcasted--------------', txHash);
      },
      onFulfil: (tx) => {
        console.log('--------------onBroadcasted--------------', tx);
      },
    };
    wallet.sendCosmosToken(
      amount,
      currency,
      recipient,
      memo,
      stdFee,
      signOptions,
      onTxEvents
    );
    history.push('/home');
  };

  return (
    <div>
      <div className="send-container">
        <h1>SEND Confirm</h1>
        <p>recipient: {recipient}</p>
        <p>memo: {memo}</p>
        <p>amount: {amount}</p>
        <Button onClick={next}>Confirm</Button>
      </div>
    </div>
  );
};

export default ConfirmTx;
