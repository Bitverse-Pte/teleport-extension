import { Button, Modal, Tooltip } from 'antd';
import clsx from 'clsx';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Provider } from 'types/network';
import { IconButton } from 'ui/components/IconButton';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import IconTrash from 'assets/action-icon/trash.svg';
import IconEdit from 'assets/action-icon/edit.svg';
import { IconComponent } from 'ui/components/IconComponents';
import './style.less';
import skynet from 'utils/skynet';
import { useJumpToExpandedView } from 'ui/hooks/utils/useJumpToExpandedView';
import { ReactComponent as DragHandleIcon } from 'assets/action-icon/drag-handle.svg';
import type {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from 'react-beautiful-dnd';
const { sensors } = skynet;

type NetworkProviderWithOptionalTag = Provider & { idx?: number };

interface NetworkSelectionItemProps {
  network: NetworkProviderWithOptionalTag;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  innerRef: any;
}

export function NetworkSelectionItem({
  network,
  draggableProps,
  dragHandleProps,
  innerRef,
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
    (network: NetworkProviderWithOptionalTag) => {
      console.debug(`Selected Chain ${network.chainId}`);
      if (network.type === 'rpc') {
        providerContext?.useCustomProvider(network.idx as number);
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
      {...draggableProps}
      ref={innerRef}
      key={network.chainId}
      className={clsx('flex items-center network-item', {
        'network-item-active': isSelectedNetwork,
      })}
      onClick={() => selectProvider(network)}
    >
      <div
        className="drag-handle"
        {...dragHandleProps}
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

const NetworkActions = ({
  network,
}: {
  network: NetworkProviderWithOptionalTag;
}) => {
  const currentProviderId = useSelector((s) => s.network.provider.id);
  const isSelectedNetwork = useMemo(() => {
    return network.id === currentProviderId;
  }, [network, currentProviderId]);
  return (
    <span className="actions flex justify-center items-center">
      {isSelectedNetwork ? (
        <IconComponent name="check" />
      ) : (
        <div className="actions-not-selected">
          <RpcNetworkOptions network={network} />
        </div>
      )}
    </span>
  );
};

const RpcNetworkOptions = ({
  network,
}: {
  network: NetworkProviderWithOptionalTag;
}) => {
  const providerContext = useContext(NetworkProviderContext);
  const { t } = useTranslation();
  const jumpToExpandedView = useJumpToExpandedView();

  const handleRemove = useCallback(
    (e: React.MouseEvent<any>) => {
      // stop the parent's onClick event
      e.stopPropagation();
      Modal.confirm({
        title: t('Delete_Provider_Ask_Title'),
        content: t('Delete_Provider_Ask_Content'),
        onOk: async () => {
          await providerContext?.removeCustomProvider(network.idx as number);
          ClickToCloseMessage.success(t('remove_custom_provider_success'));
        },
        onCancel: () => {
          ClickToCloseMessage.info(t('remove_custom_provider_cancel'));
        },
      });
    },
    [providerContext]
  );

  if (!providerContext) {
    return <p>{t('loading')}</p>;
  }

  if (network.type !== 'rpc') {
    // Only `rpc` type are editable
    // other type was preset that cannot edit
    return null;
  }

  return (
    <div className="flex justify-center items-center">
      <IconButton
        icon={IconTrash}
        className="narrow-padding"
        size={16}
        onClick={handleRemove}
      />
      <IconButton
        icon={IconEdit}
        size={16}
        className="narrow-padding"
        onClick={(e) => {
          // stop the parent's onClick event
          e.stopPropagation();
          jumpToExpandedView(`/network/edit/${network.idx}`);
        }}
      />
    </div>
  );
};
