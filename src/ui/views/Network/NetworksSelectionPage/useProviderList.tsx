import { useMemo } from 'react';
import { NetworksCategories } from '../typing';
import { defaultNetworks } from 'constants/defaultNetwork';
import { categoryToIconSVG } from 'ui/utils/networkCategoryToIcon';
import { useSelector } from 'react-redux';

export function useProviderList() {
  const { providers: customProviders } = useSelector((s) => s.customNetworks);
  const networkList: NetworksCategories = useMemo(() => {
    const category: NetworksCategories = {
      EVM: {
        displayName: 'EVM Networks',
        icon: categoryToIconSVG('ETH'),
        networks: [],
      },
      COSMOS: {
        displayName: 'Cosmos Networks',
        icon: categoryToIconSVG('BSC'),
        networks: [],
      },
      POLKADOT: {
        displayName: 'Polkadot Networks',
        icon: categoryToIconSVG('POLYGON'),
        networks: [],
      },
    };
    // inject preset providers
    Object.values(defaultNetworks)
      .filter((v) => Boolean(v))
      .forEach((val) => {
        category['EVM'].networks.push(val);
      });
    customProviders.forEach((_pro, idx) => {
      const withIdx = { ..._pro, idx };
      category['EVM'].networks.push(withIdx);
    });
    return category;
  }, [customProviders]);

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

  return { networkList, currentSelectedCategory };
}
