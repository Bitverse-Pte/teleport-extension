import './style.less';
import React, { useState } from 'react';
import { useAsyncEffect, useWallet } from 'ui/utils';
import { CoinType, Provider } from 'types/network';
import { PresetNetworkId } from 'constants/defaultNetwork';
import { IdToChainLogoSVG } from 'ui/utils/networkCategoryToIcon';

export interface ChainIconsProps {
  coinType: CoinType;
}

const ChainIcons: React.FC<ChainIconsProps> = (props: ChainIconsProps) => {
  const wallet = useWallet();
  const [chainCustomIds, setChainCustomIds] = useState<
    (PresetNetworkId | string)[]
  >([]);

  useAsyncEffect(async () => {
    const chains: Provider[] = await wallet.getSameChainsByCoinType(
      props.coinType
    );
    if (chains?.length) {
      setChainCustomIds(chains.map((c: Provider) => c.id));
    }
  }, []);

  return (
    <div className="chain-icons">
      {chainCustomIds?.length &&
        chainCustomIds
          .slice(0, 3)
          .map((c: PresetNetworkId | string, i: number) => (
            <img
              key={i}
              src={IdToChainLogoSVG(c)}
              className="icon-icons-item"
              style={{
                zIndex: i,
                right: `${6 * i}px`,
              }}
            />
          ))}
      <span
        className="badge-wrap flexR"
        style={{ display: chainCustomIds?.length > 0 ? 'flex' : 'none' }}
      >
        <span className="badge">{chainCustomIds?.length}</span>
      </span>
    </div>
  );
};

export default ChainIcons;
