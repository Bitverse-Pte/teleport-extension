import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { message } from 'antd';
import {
  useWallet,
  useWalletRequest,
  transferAddress2Display,
  denom2SymbolRatio,
} from 'ui/utils';
import { AddTokenOpts } from 'types/token';
import { CustomButton, TokenIcon, WalletName } from 'ui/components/Widgets';
import { ErrorCode } from 'constants/code';
import Header from 'ui/components/Header';

import './style.less';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import skynet from 'utils/skynet';
const { sensors } = skynet;
import { getProvider } from 'ui/selectors/selectors';
import { useSelector } from 'react-redux';
import { Ecosystem, Provider } from 'types/network';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';

const TokenAdd = () => {
  const { state, pathname } = useLocation<{
    symbol: string;
    decimal: string;
    balance: string;
    name: string;
    contractAddress: string;
    chain: string;
    chainCustomId: string;
  }>();

  const history = useHistory();
  const wallet = useWallet();
  const { ecosystem }: Provider = useSelector(getProvider);
  const { isDarkMode } = useDarkmode();

  const [addToken, addTokenLoading] = useWalletRequest(wallet.addCustomToken, {
    onSuccess() {
      sensors.track('teleport_token_add_confirmed', { page: pathname });
      history.go(-2);
    },
    onError(err) {
      console.error(err.code);
      if (
        err &&
        err.code &&
        err.code === ErrorCode.CUSTOM_ERC20_TOKEN_DUPLICATED
      ) {
        ClickToCloseMessage.error({
          content: 'Token already added',
          key: 'Token already added',
        });
      }
    },
  });

  const handleConfirmClick = async () => {
    const customToken: AddTokenOpts = {
      symbol: state.symbol,
      name: state.name,
      decimal: state.decimal,
      chainCustomId: state.chainCustomId,
      contractAddress: state.contractAddress,
      isNative: false,
    };
    if (ecosystem === Ecosystem.COSMOS) {
      customToken.denom = `cw20:${state.contractAddress}:${state.name}`;
    }
    addToken(customToken);
  };

  return (
    <div className={clsx('token-add flexCol', { dark: isDarkMode })}>
      <Header title="Add Asset" />
      <div className="token-add-content flexCol content-wrap-padding">
        <p className="token-add-title">Would you like to add this token?</p>
        <div className="token-add-preview flexCol">
          <TokenIcon
            token={{
              symbol: state.symbol,
              decimal: state.decimal,
              contractAddress: state.contractAddress,
              isNative: false,
              chainCustomId: state.chainCustomId,
            }}
          />
          <div className="token-add-balance-container">
            <WalletName width={250} cls="token-add-balance-amount flexR">
              {denom2SymbolRatio(state.balance || 0, state.decimal || 0)}
            </WalletName>
            <span className="token-add-balance-symbol">{state.symbol}</span>
          </div>
          <p className="token-add-chain">{state.chain}</p>
          <div className="token-add-item">
            <p className="token-add-item-title">Token Contract Address:</p>
            <p className="token-add-item-content">
              {transferAddress2Display(state.contractAddress)}
            </p>
          </div>

          <div className="token-add-item">
            <p className="token-add-item-title">Token Symbol:</p>
            <p className="token-add-item-content">{state.symbol}</p>
          </div>
          <div className="token-add-item">
            <p className="token-add-item-title">Decimals of Precision:</p>
            <p className="token-add-item-content">{state.decimal}</p>
          </div>
        </div>
      </div>
      <div className="token-add-footer-container content-wrap-padding">
        <CustomButton
          type="primary"
          cls="button theme"
          onClick={handleConfirmClick}
          loading={addTokenLoading}
          block
        >
          Confirm
        </CustomButton>
      </div>
    </div>
  );
};

export default TokenAdd;
