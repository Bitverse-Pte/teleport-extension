import { Button, Modal, Tooltip } from 'antd';
import clsx from 'clsx';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Provider } from 'types/network';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
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
  const history = useHistory();
  const location = useLocation();
  const currentProviderId = useSelector((s) => s.network.provider.id);
  const isSelectedNetwork = useMemo(
    () => network.id === currentProviderId,
    [network, currentProviderId]
  );

  const selectProvider = useCallback(
    (network: Provider) => {
      console.debug(`Selected Chain ${network.chainId}`);
      if (network.type === 'rpc') {
        providerContext?.useCustomProvider(network.id);
      } else {
        providerContext?.usePresetProvider(network.type);
      }
      sensors.track('teleport_network_selected', {
        page: location.pathname,
        chainId: network.chainId,
        chainName: network.chainName,
      });
      // jump back previous page
      history.goBack();
    },
    [providerContext, history]
  );
  return (
    <div
      {...props.draggableProps}
      ref={innerRef}
      key={network.chainId}
      className={clsx('flex items-center network-item', {
        'network-item-active': isSelectedNetwork,
        'is-dragging': props.isDragging,
      })}
      onClick={() => selectProvider(network)}
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
      <Tooltip title={network.nickname}>
        <span className="network-name">{network.nickname}</span>
      </Tooltip>
      <NetworkActions network={network} />
    </div>
  );
}

const NetworkActions = ({ network }: { network: Provider }) => {
  const currentProviderId = useSelector((s) => s.network.provider.id);
  const jumpToExpandedView = useJumpToExpandedView();
  const providerContext = useContext(NetworkProviderContext);
  const { t } = useTranslation();
  const isSelectedNetwork = useMemo(() => {
    return network.id === currentProviderId;
  }, [network, currentProviderId]);

  const handleRemove = useCallback(
    (e: React.MouseEvent<any>) => {
      // stop the parent's onClick event
      e.stopPropagation();
      Modal.confirm({
        title: t('Delete_Provider_Ask_Title'),
        content: t('Delete_Provider_Ask_Content'),
        onOk: async () => {
          await providerContext?.removeCustomProvider(network.id);
          ClickToCloseMessage.success(t('remove_custom_provider_success'));
        },
        onCancel: () => {
          ClickToCloseMessage.info(t('remove_custom_provider_cancel'));
        },
      });
    },
    [providerContext]
  );

  const hoverToDisplayProperties = {
    hidden: network.type !== 'rpc',
    'display-on-hover': !isSelectedNetwork,
  };

  return (
    <span className="actions flex">
      <div className="flex justify-center items-center">
        <Button
          className={clsx(hoverToDisplayProperties, 'narrow-padding')}
          onClick={handleRemove}
          disabled={isSelectedNetwork}
          type="text"
        >
          <IconTrash width={16} fill={isSelectedNetwork ? '#5E6C8A' : '#000'} />
        </Button>

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
        <Button
          className={clsx('narrow-padding', !isSelectedNetwork && 'hidden')}
          type="text"
        >
          <CheckIcon width={16} />
        </Button>
      </div>
    </span>
  );
};
