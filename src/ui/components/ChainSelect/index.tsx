import React, { useState } from 'react';
import { Provider } from 'types/network';
import { IdToChainLogoSVG } from 'ui/utils/networkCategoryToIcon';
import { IconComponent } from '../IconComponents';
import { useAsyncEffect, useWallet } from 'ui/utils';

import './style.less';
interface ChainSelectProps {
  handleChainSelect(chain: Provider): void;
  style?: Record<string, any>;
}

export default (props: ChainSelectProps) => {
  const wallet = useWallet();
  const [currentChain, setCurrentChain] = useState<Provider>();
  const [maskVisible, setMaskVisible] = useState(false);
  const [chains, setChains] = useState<Provider[]>([]);

  const getCurrentChain = async () => {
    const chain = await wallet.getCurrentChain().catch((e) => {
      console.error(e);
    });

    if (chain) {
      setCurrentChain(chain);
      props.handleChainSelect(chain);
    }
  };
  const fetchChains = async () => {
    const chainList = await wallet.getAllProviders().catch((e) => {
      console.error(e);
    });
    console.log('chain list', chainList);
    if (chainList) {
      setChains(chainList);
    }
  };

  useAsyncEffect(fetchChains, []);
  useAsyncEffect(getCurrentChain, []);

  return (
    <>
      <div
        className="select-container flexR"
        onClick={() => setMaskVisible(true)}
        style={props.style ? props.style : {}}
      >
        <div className="left flexR">
          {currentChain && (
            <img src={IdToChainLogoSVG(currentChain.id)} className="icon" />
          )}
          <span className="token">{currentChain?.type}</span>
          <span className="chain-select-network">
            ({currentChain?.nickname})
          </span>
        </div>
        <IconComponent name="chevron-down" cls="base-text-color" />
      </div>
      <div
        style={{
          display: maskVisible ? 'flex' : 'none',
        }}
        onClick={() => setMaskVisible(false)}
        className="musk-wrap flexR"
      >
        <div
          className="mask-container flexCol"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="mask-container-header flexR">
            <span className="mask-container-title">Networks</span>
            <IconComponent
              name="close"
              cls="base-text-color"
              onClick={() => setMaskVisible(false)}
            />
          </div>
          <div className="mask-container-networks">
            {chains.map((chain: Provider) => (
              <div
                className="mask-container-chain flexR cursor"
                key={chain.chainId}
                onClick={() => {
                  setCurrentChain(chain);
                  props.handleChainSelect(chain);
                  setMaskVisible(false);
                }}
              >
                <img src={IdToChainLogoSVG(chain.id)} className="icon" />
                <span className="mask-container-chain-title">
                  {chain.nickname}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
