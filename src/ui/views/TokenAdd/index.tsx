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
import { CustomButton, TokenIcon } from 'ui/components/Widgets';
import { ErrorCode } from 'constants/code';
import Header from 'ui/components/Header';

import './style.less';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';

const TokenAdd = () => {
  const { state } = useLocation<{
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

  const [addToken, addTokenLoading] = useWalletRequest(wallet.addCustomToken, {
    onSuccess() {
      history.go(-2);
    },
    onError(err) {
      console.error(err.code);
      if (
        err &&
        err.code &&
        err.code === ErrorCode.CUSTOM_ERC20_TOKEN_DUPLICATED
      ) {
        ClickToCloseMessage.error('Token already added');
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
    addToken(customToken);
  };

  return (
    <div className="token-add flexCol">
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
              themeColor: '#1484F5',
            }}
          />
          <div className="token-add-balance-container">
            <span className="token-add-balance-amount">
              {denom2SymbolRatio(state.balance || 0, state.decimal || 0)}
            </span>
            <span className="token-add-balance-symbol">
              {state.symbol?.toUpperCase()}
            </span>
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
            <p className="token-add-item-content">
              {state.symbol?.toUpperCase()}
            </p>
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

      {/* <Drawer
        placement="bottom"
        closable={false}
        height="90vh"
        bodyStyle={{
          padding: '0 24px 36px 24px',
          boxSizing: 'border-box',
        }}
        contentWrapperStyle={{
          borderRadius: '16px 16px 0 0',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        visible={popupVisible}
        key="top"
      >
        <div className="add-token-popup-container flexCol">
          <div className="header">
            Add Asset
            <IconComponent
              name="close"
              onClick={() => setPopupVisible(false)}
              cls="base-text-color"
            />
          </div>
          <div className="content-container flexCol">

            <span className="balance">
              {' '}

            </span>
            <div className="item">
              <span className="title">Networks:</span>
              <span className="content">{currentChain?.nickname}</span>
            </div>
            <div className="item">
              <span className="title">Token Contract Address</span>
              <span className="content">
                {transferAddress2Display(contractAddress)}
              </span>
            </div>
            <div className="item">
              <span className="title">Token Symbol</span>
              <span className="content">{symbol?.toUpperCase()}</span>
            </div>
            <div className="item">
              <span className="title">Decimals of Precision</span>
              <span className="content">{decimal}</span>
            </div>
            <p className="add-custom-token-notice">
              Î Would you like to add these tokens
            </p>
          </div>
          <CustomButton
            type="primary"
            cls="button"
            onClick={handleConfirmClick}
            block
            loading={addTokenLoading}
          >
            Confirm
          </CustomButton>
        </div>
      </Drawer> */}
    </div>
  );
};

export default TokenAdd;
