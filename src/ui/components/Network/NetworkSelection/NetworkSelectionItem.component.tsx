import { Modal } from 'antd';
import clsx from 'clsx';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Provider } from 'types/network';
import { IconButton } from 'ui/components/IconButton';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import IconTrash from 'assets/action-icon/trash.svg';
import IconEdit from 'assets/action-icon/edit.svg';
import { IconComponent } from 'ui/components/IconComponents';
import './style.less';

type NetworkProviderWithOptionalTag = Provider & { idx?: number };

interface NetworkSelectionItemProps {
  network: NetworkProviderWithOptionalTag;
}

export function NetworkSelectionItem({ network }: NetworkSelectionItemProps) {
  /**
   * Some data source hooks
   */
  const providerContext = useContext(NetworkProviderContext);
  const history = useHistory();
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
      // jump back previous page
      history.goBack();
    },
    [providerContext, history]
  );
  return (
    <div
      key={network.chainId}
      className={clsx('flex items-center network-item', {
        'network-item-active': isSelectedNetwork,
      })}
      onClick={() => selectProvider(network)}
    >
      <span className="network-name">{network.nickname}</span>
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
  const history = useHistory();

  const handleRemove = useCallback(
    (e: React.MouseEvent<any>) => {
      // stop the parent's onClick event
      e.stopPropagation();
      Modal.confirm({
        title: t('Do you want to delete this network?'),
        content: t('You might have to add this back, are you sure?'),
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
          history.push(`/network/edit/${network.idx}`);
        }}
      />
    </div>
  );
};
