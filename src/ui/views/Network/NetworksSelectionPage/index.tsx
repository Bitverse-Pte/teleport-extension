import React, { Fragment, useContext, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import '../style.less';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import GeneralHeader from 'ui/components/Header/GeneralHeader';
import { Button } from 'antd';
import { IconComponent } from 'ui/components/IconComponents';
import { NetworkSelectionItem } from './components/NetworkSelectionItem.component';
import { ReactComponent as TLPText } from 'assets/teleportText.svg';
import skynet from 'utils/skynet';
import { useJumpToExpandedView } from 'ui/hooks/utils/useJumpToExpandedView';
import { ChainCategoryIcon } from './components/ChainCategoryIcon';
import { useProviderList } from './useProviderList';
import {
  DragDropContext,
  DragDropContextProps as DDCP,
  Draggable,
  Droppable,
} from 'react-beautiful-dnd';
import { Ecosystem } from 'types/network';
import { useWallet } from 'ui/utils';
import clsx from 'clsx';
import { useDarkmode } from 'ui/hooks/useDarkMode';
const { sensors } = skynet;

const NetworksSelectionContainer = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const wallet = useWallet();
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});
  const toggleForCategory = (key: string) =>
    setActiveKeys((prevActiveKeys) => ({
      ...prevActiveKeys,
      [key]: !activeKeys[key],
    }));
  const providerContext = useContext(NetworkProviderContext);
  const { networkList, currentSelectedCategory } = useProviderList();
  const toExpanedView = useJumpToExpandedView();

  useEffect(() => {
    if (currentSelectedCategory)
      setActiveKeys({
        [currentSelectedCategory]: true,
      });
  }, []);

  const onNetworkItemDragEnd: DDCP['onDragEnd'] = async (res, provided) => {
    console.debug('onNetworkItemDragEnd::res', res);
    console.debug('onNetworkItemDragEnd::provided', provided);
    const { destination, source } = res;
    /** ignore if destination not exist */
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      /**
       * ignore if item is not moving
       */
      return;
    }
    if (source.droppableId !== destination.droppableId) {
      console.error('Error: You can not drag into another network category.');
    }
    const sourceNetwork =
      networkList[source.droppableId as Ecosystem].networks[source.index];
    sensors.track('teleport_network_onDrag', {
      page: location.pathname,
      chainId: sourceNetwork.chainId,
      chainName: sourceNetwork.chainName,
      toIndex: destination.index,
    });

    await wallet.moveNetwork(
      source.droppableId,
      source.index,
      destination.index
    );
  };

  const { isDarkMode } = useDarkmode();

  if (!providerContext) {
    return <p>Loading...</p>;
  }

  return (
    <DragDropContext onDragEnd={onNetworkItemDragEnd}>
      <div
        className={clsx('flexCol network-page-container', {
          dark: isDarkMode,
        })}
      >
        <GeneralHeader
          title={
            <span className="title flex">
              <TLPText style={{ marginRight: 4 }} />
            </span>
          }
          onXButtonClick={() => history.push('/home')}
          extCls="network-list-header"
        />
        <div className="networkList">
          {(Object.keys(networkList) as Ecosystem[]).map((key) => {
            const { networks, icon, displayName } = networkList[key];
            const isCategoryActive = activeKeys[key];
            // hide if empty
            if (networks.length === 0) {
              return <Fragment key={key}></Fragment>;
            }

            const networksBelongToThisCategory =
              isCategoryActive &&
              networks.map((network, idx) => (
                <Draggable
                  draggableId={network.id}
                  index={idx}
                  key={network.id}
                >
                  {(provided, snapshot) => (
                    <NetworkSelectionItem
                      network={network}
                      draggableProps={provided.draggableProps}
                      dragHandleProps={provided.dragHandleProps}
                      innerRef={provided.innerRef}
                      isDragging={snapshot.isDragging}
                    />
                  )}
                </Draggable>
              ));
            return (
              <div className="networklist-category" key={key}>
                <div
                  className="category-tag flex items-center cursor-pointer"
                  onClick={() => toggleForCategory(key)}
                >
                  <ChainCategoryIcon src={icon} />
                  <h2 className="category-name">{displayName}</h2>
                  <IconComponent
                    name={`chevron-${isCategoryActive ? 'up' : 'down'}`}
                    cls="ml-auto chevron-icon"
                  />
                </div>
                <Droppable droppableId={key}>
                  {(provided) => {
                    return (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {networksBelongToThisCategory}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
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
    </DragDropContext>
  );
};

export default NetworksSelectionContainer;
