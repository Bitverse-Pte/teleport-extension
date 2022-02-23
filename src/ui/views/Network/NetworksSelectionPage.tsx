import React, { Fragment, useContext, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
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
  return networkList;
}

const NetworksSelectionContainer = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const providerContext = useContext(NetworkProviderContext);
  const networkList = useProviderList();

  if (!providerContext) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flexCol network-page-container">
      <GeneralHeader title="Teleport Wallet" extCls="network-list-header" />
      <div className="networkList">
        {Object.keys(networkList).map((key) => {
          const currentCategory = networkList[key];
          // hide if empty
          if (currentCategory.networks.length === 0) {
            return <Fragment key={key}></Fragment>;
          }
          return (
            <div className="networklist-category" key={key}>
              <div className="category-tag flex items-center">
                <ChainCategoryIcon src={currentCategory.icon} />
                <h2 className="category-name">{currentCategory.displayName}</h2>
              </div>
              {currentCategory.networks.map((network) => (
                <NetworkSelectionItem network={network} key={network.id} />
              ))}
            </div>
          );
        })}
      </div>
      <div
        className="cursor-pointer hover-to-highlight custom-network-card flex items-center"
        onClick={() => history.push('/network/add')}
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
