import { Button, Modal, Tooltip } from 'antd';
import clsx from 'clsx';
import React, {
  Fragment,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Ecosystem, Provider } from 'types/network';
import {
  NetworkErrorCodeToMessageKey,
  NetworkProviderContext,
} from 'ui/context/NetworkProvider';
import { ReactComponent as IconTrash } from 'assets/action-icon/trash.svg';
import { ReactComponent as IconEdit } from 'assets/action-icon/edit.svg';
import { ReactComponent as CheckIcon } from 'assets/action-icon/check.svg';
import './style.less';
import skynet from 'utils/skynet';
import { useJumpToExpandedView } from 'ui/hooks/utils/useJumpToExpandedView';
import { ReactComponent as DragHandleIcon } from 'assets/action-icon/drag-handle.svg';
import type {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from 'react-beautiful-dnd';
import { useWallet } from 'ui/utils';
import { UnlockModal } from 'ui/components/UnlockModal';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';
const { sensors } = skynet;

interface NetworkSelectionItemProps {
  network: Provider;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  innerRef: any;
  isDragging?: boolean;
}

export function NetworkSelectionItem({
  network,
  innerRef,
  ...props
}: NetworkSelectionItemProps) {
  /**
   * Some data source hooks
   */
  const providerContext = useContext(NetworkProviderContext);
  const { t } = useTranslation();
  const wallet = useWallet();
  const history = useHistory();
  const location = useLocation();
  const ClickToCloseMessage = useStyledMessage();
  const currentProviderId = useSelector((s) => s.network.provider.id);
  const isSelectedNetwork = useMemo(
    () => network.id === currentProviderId,
    [network, currentProviderId]
  );
  const { isDarkMode } = useDarkmode();
  const selectProvider = async () => {
    console.debug(`Selected Chain ${network.chainId}`);
    const currentProvider = await wallet.getCurrentChain();
    const currentEcosystem = currentProvider.ecosystem;
    try {
      await providerContext?.useProviderById(network.id);
    } catch (error: any) {
      if (error?.code) {
        ClickToCloseMessage('info')(
          t(NetworkErrorCodeToMessageKey(error.code), {
            replace: {
              ecosystem_name: currentEcosystem,
            },
          })
        );
      }
    }
    sensors.track('teleport_network_selected', {
      page: location.pathname,
      chainId: network.chainId,
      chainName: network.chainName,
    });
    // jump back previous page
    history.goBack();
  };
  return (
    <div
      {...props.draggableProps}
      ref={innerRef}
      key={network.chainId}
      className={clsx('flex items-center network-item', {
        'network-item-active': isSelectedNetwork,
        'is-dragging': props.isDragging,
        dark: isDarkMode,
      })}
      onClick={selectProvider}
    >
      <div
        className={clsx('drag-handle', {
          'is-dragging': props.isDragging,
        })}
        {...props.dragHandleProps}
        onClick={(e) => e.stopPropagation()}
      >
        <DragHandleIcon />
      </div>
      <span className="network-name">{network.nickname}</span>
      <NetworkActions network={network} />
    </div>
  );
}

const NetworkActions = ({ network }: { network: Provider }) => {
  const currentProviderId = useSelector((s) => s.network.provider.id);
  const jumpToExpandedView = useJumpToExpandedView();
  const providerContext = useContext(NetworkProviderContext);
  const { t } = useTranslation();
  const wallet = useWallet();
  const [unlockPopupVisible, setUnlockPopupVisible] = useState(false);
  const isSelectedNetwork = useMemo(() => {
    return network.id === currentProviderId;
  }, [network, currentProviderId]);
  const ClickToCloseMessage = useStyledMessage();

  const removeProvider = async () => {
    await providerContext?.removeCustomProvider(network.id);
    ClickToCloseMessage('success')(t('remove_custom_provider_success'));
  };

  const handleRemove = useCallback(
    async (e: React.MouseEvent<any>) => {
      // stop the parent's onClick event
      e.stopPropagation();
      e.preventDefault();
      const isCosmosProvider = network.ecosystem === Ecosystem.COSMOS;
      const isUnlocked = await wallet.isUnlocked();
      // unlock first
      if (isCosmosProvider && !isUnlocked) {
        setUnlockPopupVisible(true);
        return;
      }
      Modal.confirm({
        title: t('Delete_Provider_Ask_Title'),
        content: t('Delete_Provider_Ask_Content'),
        onOk: removeProvider,
        onCancel: () => {
          ClickToCloseMessage('info')(t('remove_custom_provider_cancel'));
        },
      });
    },
    [providerContext]
  );

  const hoverToDisplayProperties = {
    hidden: network.type !== 'rpc',
    'display-on-hover': !isSelectedNetwork,
  };

  /**
   * Current only support editing EVM network provider
   */
  const isProviderEditable = [Ecosystem.EVM].includes(network.ecosystem);

  return (
    <span className="actions flex" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-center items-center">
        <Button
          className={clsx(hoverToDisplayProperties, 'narrow-padding')}
          onClick={handleRemove}
          disabled={isSelectedNetwork}
          type="text"
        >
          <IconTrash width={16} fill={isSelectedNetwork ? '#5E6C8A' : '#000'} />
        </Button>

        {isProviderEditable && (
          <Button
            className={clsx(hoverToDisplayProperties, 'narrow-padding')}
            type="text"
            onClick={(e) => {
              // stop the parent's onClick event
              e.stopPropagation();
              jumpToExpandedView(`/network/edit/${network.id}`);
            }}
          >
            <IconEdit width={16} />
          </Button>
        )}
        <Button
          className={clsx('narrow-padding', !isSelectedNetwork && 'hidden')}
          type="text"
        >
          <CheckIcon width={16} />
        </Button>
      </div>
      <UnlockModal
        title="Unlock Wallet to continue"
        visible={unlockPopupVisible}
        setVisible={(v) => {
          setUnlockPopupVisible(v);
        }}
        unlocked={removeProvider}
      />
    </span>
  );
};
