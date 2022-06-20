import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  NetworkDisplay,
  SenderToRecipient,
  UserPreferencedCurrencyDisplay,
} from 'ui/components';
import { HeaderWithFlex } from 'ui/components/Header';
import { CustomButton } from 'ui/components/Widgets';
import { useApproval, useAsyncEffect, useWallet } from 'ui/utils';
import {
  SignDoc,
  TxBody,
  AuthInfo,
} from '@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx';
import { JSONUint8Array } from 'utils/cosmos/json-uint8-array';
import { ProtoSignDocDecoder } from '@keplr-wallet/cosmos';
import {
  hideLoadingIndicator,
  showLoadingIndicator,
} from 'ui/reducer/appState.reducer';
import { Token } from 'types/token';

interface SignCosmosTxProps {
  data: [string, string, SignCosmosTxMsg];
  method: boolean;
  session: {
    origin: string;
    icon: string;
    name: string;
  };
}

interface SignCosmosTxMsg {
  accountNumber: string;
  authInfoBytes: Uint8Array;
  bodyBytes: Uint8Array;
  chainId: string;
}

const SignCosmTx = ({
  params,
  origin,
}: {
  params: SignCosmosTxProps;
  origin: string;
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [getApproval, resolveApproval, rejectApproval] = useApproval();
  const dispatch = useDispatch();
  const wallet = useWallet();
  const [signDoc, setSignDoc] = useState<any>();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [prices, setPrices] = useState();

  const initState = async () => {
    dispatch(showLoadingIndicator());
    const chainId = params.data[0];
    const from = params.data[1];
    const msg = JSONUint8Array.unwrap(params.data[2]);
    const protoSignDoc = new ProtoSignDocDecoder(msg);
    const signDoc = protoSignDoc.toJSON();
    setSignDoc(signDoc);
    const tokens = await wallet.getTokenBalancesAsync(true);
    console.log('=======>>>>>>tokens:', tokens);
    const prices = await wallet.queryTokenPrices();
    console.log('=======>>>>>>tokens:', tokens);
    console.log('=======>>>>>>prices:', prices);
    if (prices) setPrices(prices);
    if (tokens) setTokens(tokens);
    dispatch(hideLoadingIndicator());
  };

  useAsyncEffect(initState, []);

  const chainId = useMemo(() => {
    return params.data[0];
  }, []);

  console.log('==chainId==', chainId);

  const txBodyMemo = useMemo(() => {
    return signDoc?.txBody;
  }, [signDoc]);

  const authInfoMemo = useMemo(() => {
    return signDoc?.authInfo;
  }, [signDoc]);

  const nativeToken = useMemo(() => {
    const nativeToken = tokens.find((t: Token) => t.isNative);
    if (prices && nativeToken) {
      if (nativeToken!.symbol.toUpperCase() in prices) {
        nativeToken!.price = prices[nativeToken!.symbol.toUpperCase()];
      }
    }
    return nativeToken;
  }, [tokens, prices]);

  const txToken = useMemo(() => {
    const symbol = txBodyMemo?.messages[0].amount[0].denom;
    console.log(
      '====[symbol, tokens, nativeToken]====',
      symbol,
      tokens,
      nativeToken
    );
    const txToken = symbol
      ? tokens.find((t: Token) => t.symbol === symbol)
      : nativeToken;
    return txToken;
  }, [tokens, txBodyMemo]);

  const renderContent = () => {
    return (
      <div className="tx-details-tab-container">
        <div></div>
        <div></div>
      </div>
    );
  };

  const handleAllow = async () => {
    resolveApproval({});
  };

  const handleCancel = () => {
    rejectApproval('User rejected the request.');
  };

  return (
    <div className="approval-tx flexCol">
      <div className="top-part-container flexCol flex-wrap items-center">
        <HeaderWithFlex
          title={<NetworkDisplay networkName={chainId} />}
          handleBackClick={handleCancel}
        />
        <SenderToRecipient
          senderAddress={txBodyMemo?.messages[0].fromAddress}
          senderName={''}
          recipientName={''}
          recipientAddress={txBodyMemo?.messages[0].toAddress}
        />
        <TxSummaryComponent
          action={params.method}
          value={txBodyMemo?.messages[0].amount[0].amount}
          token={txToken}
          origin={origin}
        />
      </div>
      {renderContent()}
      <div className="tx-button-container flexCol">
        <CustomButton
          type="primary"
          onClick={handleAllow}
          cls="theme tx-btn-container-top"
          block
        >
          {t('Send')}
        </CustomButton>
        <CustomButton
          type="default"
          cls="custom-button-default"
          onClick={handleCancel}
          block
        >
          {t('Decline')}
        </CustomButton>
      </div>
    </div>
  );
};

const TxSummaryComponent = ({ action, value, token, origin }) => {
  console.log('==[value, token, origin]==', value, token, origin);
  return (
    <div className="tx-summary">
      <div className="tx-summary-origin">
        {origin === 'https://teleport.network' ? null : <div>{origin}</div>}
      </div>
      <div className="tx-summary-currency">
        <UserPreferencedCurrencyDisplay value={value} token={token} />
      </div>
    </div>
  );
};

export default SignCosmTx;
