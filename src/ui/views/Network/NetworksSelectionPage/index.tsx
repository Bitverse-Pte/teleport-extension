import React, { Fragment, useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import '../style.less';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import GeneralHeader from 'ui/components/Header/GeneralHeader';
import { Button } from 'antd';
import { IconComponent } from 'ui/components/IconComponents';
import { NetworkSelectionItem } from './components/NetworkSelectionItem.component';
import { BetaIcon } from 'ui/components/Widgets';
import { ReactComponent as TLPText } from 'assets/teleportText.svg';
import skynet from 'utils/skynet';
import { useJumpToExpandedView } from 'ui/hooks/utils/useJumpToExpandedView';
import { ChainCategoryIcon } from './components/ChainCategoryIcon';
import { useProviderList } from './useProviderList';
const { sensors } = skynet;

const NetworksSelectionContainer = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const providerContext = useContext(NetworkProviderContext);
  const { networkList, currentSelectedCategory } = useProviderList();
  const toExpanedView = useJumpToExpandedView();

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
        onXButtonClick={() => history.push('/home')}
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
          toExpanedView('/network/add');
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
