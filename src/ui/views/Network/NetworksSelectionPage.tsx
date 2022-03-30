import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useHistory, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { NetworksCategories } from './typing';
import DefaulutIcon from 'assets/tokens/default.svg';
import './style.less';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { defaultNetworks } from 'constants/defaultNetwork';
import GeneralHeader from 'ui/components/Header/GeneralHeader';
import { Button } from 'antd';
import { categoryToIconSVG } from 'ui/utils/networkCategoryToIcon';
import { useSelector } from 'react-redux';
import { IconComponent } from 'ui/components/IconComponents';
import { NetworkSelectionItem } from 'ui/components/Network/NetworkSelection/NetworkSelectionItem.component';
import { BetaIcon } from 'ui/components/Widgets';
import { ReactComponent as TLPText } from 'assets/teleportText.svg';
import skynet from 'utils/skynet';
const { sensors } = skynet;

const ChainCategoryIcon = ({ src = DefaulutIcon }: { src?: string }) => (
  <img
    style={{
      width: '24px',
      height: '24px',
      borderRadius: '100%',
      // padding: '4px',
      marginRight: '12px',
    }}
    src={src}
  />
);

function useProviderList() {
  const customProviders = useSelector((s) => s.customNetworks);
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

const NetworksSelectionContainer = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const providerContext = useContext(NetworkProviderContext);
  const { networkList, currentSelectedCategory } = useProviderList();

  useEffect(() => {
    if (currentSelectedCategory)
      setActiveKeys({
        [currentSelectedCategory]: true,
      });
  }, []);

  if (!providerContext) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flexCol network-page-container">
      <GeneralHeader
        title={
          <span className="title flex">
            <TLPText style={{ marginRight: 4 }} />
            <BetaIcon />
          </span>
        }
        extCls="network-list-header"
      />
      <div className="networkList">
        {Object.keys(networkList).map((key) => {
          const currentCategory = networkList[key];
          // hide if empty
          if (currentCategory.networks.length === 0) {
            return <Fragment key={key}></Fragment>;
          }
          return (
            <div className="networklist-category" key={key}>
              <div
                className="category-tag flex items-center cursor-pointer"
                onClick={() => {
                  setActiveKeys({
                    ...activeKeys,
                    [key]: !activeKeys[key],
                  });
                }}
              >
                <ChainCategoryIcon src={currentCategory.icon} />
                <h2 className="category-name">{currentCategory.displayName}</h2>
                <IconComponent
                  name={`chevron-${!activeKeys[key] ? 'down' : 'up'}`}
                  cls="ml-auto"
                />
              </div>
              {activeKeys[key] &&
                currentCategory.networks.map((network) => (
                  <NetworkSelectionItem network={network} key={network.id} />
                ))}
            </div>
          );
        })}
      </div>
      <div
        className="cursor-pointer hover-to-highlight custom-network-card flex items-center"
        onClick={() => {
          sensors.track('teleport_network_customize', {
            page: location.pathname,
          });
          history.push('/network/add');
        }}
      >
        <h2 className="category-name">{t('CustomizeNetwork')}</h2>
        <div className="actions" style={{ marginLeft: 'auto' }}>
          <Button type="text">
            <IconComponent
              name="chevron-right"
              cls="base-text-color"
              style={{ padding: '1px' }}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NetworksSelectionContainer;
