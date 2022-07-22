import React, { useState, useMemo } from 'react';
import { CoinType, Ecosystem, Provider } from 'types/network';
import { IdToChainLogoSVG } from 'ui/utils/networkCategoryToIcon';
import { IconComponent } from '../IconComponents';
import { useAsyncEffect, useWallet } from 'ui/utils';

import './style.less';
import { PresetNetworkId } from 'constants/defaultNetwork';
interface EcosystemSelectProps {
  handleEcosystemSelect(
    chains: Provider[],
    originChainId: PresetNetworkId | string
  ): void;
  style?: Record<string, any>;
}

interface EcosystemChains {
  originChainId: PresetNetworkId | string;
  chains: Provider[];
  name: string;
  ecosystem: Ecosystem;
}

export default (props: EcosystemSelectProps) => {
  const wallet = useWallet();
  const [currentChain, setCurrentChain] = useState<Provider>();
  const [maskVisible, setMaskVisible] = useState(false);
  const [chains, setChains] = useState<Provider[]>([]);
  const [ecosystems, setEcosystems] = useState<EcosystemChains[]>([]);

  const getCurrentChain = async () => {
    const chain = await wallet.getCurrentChain().catch((e) => {
      console.error(e);
    });

    if (chain) {
      setCurrentChain(chain);
    }
  };
  const fetchChains = async () => {
    const chainList = await wallet.getAllProviders().catch((e) => {
      console.error(e);
    });
    console.log('chain list', chainList);
    if (chainList && chainList.length > 0) {
      setChains(chainList);
      const ecos: EcosystemChains[] = [];
      chainList.forEach((c: Provider) => {
        if (!ecos.some((e: EcosystemChains) => e.ecosystem === c.ecosystem)) {
          const tempEco: EcosystemChains = {
            originChainId: '',
            chains: [c],
            name: c.ecosystem,
            ecosystem: c.ecosystem,
          };
          if (c.ecosystem === Ecosystem.EVM) {
            tempEco.originChainId = PresetNetworkId.ETHEREUM;
          } else {
            switch (c.id) {
              case PresetNetworkId.COSMOS_HUB:
                tempEco.originChainId = PresetNetworkId.COSMOS_HUB;
            }
          }
          ecos.push(tempEco);
        } else {
          //Only need one time for EVM
          if (
            ecos.some((e: EcosystemChains) => e.ecosystem === Ecosystem.EVM) &&
            c.ecosystem === Ecosystem.EVM
          )
            return;
          const selectEco = ecos.find(
            (e: EcosystemChains) => e.ecosystem === c.ecosystem
          );
          if (selectEco) {
            selectEco?.chains.push(c);
            switch (c.id) {
              case PresetNetworkId.COSMOS_HUB:
                selectEco.originChainId = PresetNetworkId.COSMOS_HUB;
            }
          }
        }
      });
      console.log('ecosystems', ecos);
      setEcosystems(ecos);
    }
  };

  const currentEcosystem = useMemo(() => {
    const eco = ecosystems.find((e: EcosystemChains) =>
      currentChain
        ? e.ecosystem === currentChain?.ecosystem
        : chains.find((c: Provider) => c.id === PresetNetworkId.ETHEREUM)
    );
    if (eco) {
      props.handleEcosystemSelect(eco.chains, eco.originChainId);
    }
    return eco;
  }, [currentChain, ecosystems, chains]);

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
          {currentEcosystem && (
            <img
              src={IdToChainLogoSVG((currentEcosystem as any).originChainId)}
              className="icon"
            />
          )}
          <span className="token">{(currentEcosystem as any)?.name}</span>
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
            <span className="mask-container-title">Chain Type</span>
            <IconComponent
              name="close"
              cls="base-text-color"
              onClick={() => setMaskVisible(false)}
            />
          </div>
          <div className="mask-container-networks">
            {ecosystems.map((ecosystem: EcosystemChains) => (
              <div
                className="mask-container-chain flexR cursor"
                key={ecosystem.originChainId}
                onClick={() => {
                  const chain = chains.find(
                    (c: Provider) => c.id === ecosystem.originChainId
                  );
                  setCurrentChain(chain);
                  props.handleEcosystemSelect(
                    ecosystem.chains,
                    ecosystem.originChainId
                  );
                  setMaskVisible(false);
                }}
              >
                <img
                  src={IdToChainLogoSVG(ecosystem.originChainId)}
                  className="icon"
                />
                <span className="mask-container-chain-title">
                  {ecosystem.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
