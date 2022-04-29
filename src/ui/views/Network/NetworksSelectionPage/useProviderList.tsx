import { useMemo } from 'react';
import { NetworksCategories } from '../typing';
import { defaultNetworks } from 'constants/defaultNetwork';
import { categoryToIconSVG } from 'ui/utils/networkCategoryToIcon';
import { useSelector } from 'react-redux';
import { Ecosystem, Provider } from 'types/network';

export function useProviderList() {
  const { networks: customProviders, orderOfNetworks } = useSelector(
    (s) => s.customNetworks
  );
  const networkList: NetworksCategories = useMemo(() => {
    const category: NetworksCategories = {
      [Ecosystem.EVM]: {
        displayName: 'EVM Networks',
        icon: categoryToIconSVG('ETH'),
        networks: [],
      },
      [Ecosystem.COSMOS]: {
        displayName: 'Cosmos Networks',
        icon: categoryToIconSVG('BSC'),
        networks: [],
      },
      [Ecosystem.POLKADOT]: {
        displayName: 'Polkadot Networks',
        icon: categoryToIconSVG('POLYGON'),
        networks: [],
      },
    };

    const allProviders: Record<string, Provider> = {};

    [...Object.values(defaultNetworks), ...customProviders].forEach((p) => {
      allProviders[p.id] = p;
    });

    (Object.keys(category) as Ecosystem[]).map((key) => {
      category[key].networks = orderOfNetworks[key]
        .map((nId) => allProviders[nId])
        // filter undefined (maybe removed provider) element too
        .filter((p) => Boolean(p));
    });
    return category;
  }, [customProviders, orderOfNetworks]);

  const currentProviderId = useSelector((s) => s.network.provider.id);
  const currentSelectedCategory: string | undefined = useMemo(() => {
    const foundedInNetworks = Object.entries(networkList).filter(
      ([_, { networks }]) => {
        return networks.filter((n) => n.id === currentProviderId).length > 0;
      }
    );
    if (foundedInNetworks.length > 0) {
      const [name] = foundedInNetworks[0];
      return name;
    } else {
      return undefined;
    }
  }, [currentProviderId]);

  return { networkList, currentSelectedCategory, orderOfNetworks };
}
