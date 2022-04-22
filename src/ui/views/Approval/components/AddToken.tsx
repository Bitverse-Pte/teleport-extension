import React, { useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  useWallet,
  useWalletRequest,
  useApproval,
  transferAddress2Display,
  denom2SymbolRatio,
} from 'ui/utils';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import './addToken.less';

/**
 * @dev according to the spec on MetaMask
 * checkout: https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
 */
interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

interface SwitchEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
}

interface AddChainProps {
  data: [AddEthereumChainParameter | SwitchEthereumChainParameter];
  session: {
    origin: string;
    icon: string;
    name: string;
  };
}

interface TokenProps {
  balanceOf: string;
  decimals: string;
  name: string;
  symbol: string;
}

const itemsCenteredCls = 'flex items-center justify-center';

const AddToken = ({ params }) => {
  const wallet = useWallet();
  const networkContext = useContext(NetworkProviderContext);
  const rpcUrl = networkContext?.currentNetworkController?.provider.rpcUrl;
  const [token, setToken] = useState<TokenProps>();
  const [queryToken, loading] = useWalletRequest(wallet.queryToken, {
    onSuccess(token) {
      console.log(token);
      if (token) {
        setToken(token);
      }
    },
    onError(err) {
      console.log(err);
    },
  });

  const networkLabel =
    networkContext?.currentNetworkController?.provider.nickname;

  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();
  const data = params.data;

  const [inited, setInited] = useState(false);

  const init = async () => {
    setInited(true);
  };

  useEffect(() => {
    init();
    queryToken(rpcUrl, data.options.address);
  }, []);

  if (!inited) return <>Loading</>;

  const defaultIcon = (
    <span className="token-icon-default">
      {data?.options.symbol?.substr(0, 1)?.toUpperCase()}
    </span>
  );

  return (
    <div className="addtoken-container">
      <div className="add-token">
        {data && (
          <>
            <h1>Add token to your wallet</h1>
            <div className="token-detail">
              <div className="token-info">
                {data.options.image ? (
                  <img
                    className="token-logo"
                    src={data.options.image}
                    alt="logo"
                  />
                ) : (
                  defaultIcon
                )}
                <div className="sym-num-container">
                  <span className="token-num">
                    {denom2SymbolRatio(
                      token?.balanceOf || 0,
                      token?.decimals || 0
                    )}
                  </span>
                  <span className="token-symbol">{data.options.symbol}</span>
                </div>
                <p className="cur-network">{networkLabel}</p>
              </div>
              <div className="token-item">
                <p className="title">Token Contract Address:</p>
                <p className="content">
                  {transferAddress2Display(data.options.address)}
                </p>
              </div>
              <div className="token-item">
                <p className="title">Token Symbol:</p>
                <p className="content">{data.options.symbol}</p>
              </div>
              <div className="token-item">
                <p className="title">Decimals of Precision:</p>
                <p className="content">{data.options.decimals}</p>
              </div>
            </div>
          </>
        )}
      </div>
      <footer className="connect-footer">
        <div className={clsx(['action-buttons mt-4'])}>
          <Button
            type="primary"
            size="large"
            className={clsx(itemsCenteredCls, 'w-full mt-2', 'mb-14')}
            onClick={() => resolveApproval()}
          >
            {t('Confirm')}
          </Button>
          <Button
            size="large"
            type="primary"
            ghost
            className={clsx(itemsCenteredCls, 'w-full mt-2')}
            onClick={() => rejectApproval()}
          >
            {t('Cancel')}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default AddToken;
