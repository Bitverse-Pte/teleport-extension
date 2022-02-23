import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import { NetworksCategories } from './typing';
import IconCheck from 'assets/action-icon/check.svg';
import IconTrash from 'assets/action-icon/trash.svg';
import IconEdit from 'assets/action-icon/edit.svg';
import DefaulutIcon from 'assets/tokens/default.svg';
import './style.less';
import { IconButton } from 'ui/components/IconButton';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { defaultNetworks, PresetNetworkId } from 'constants/defaultNetwork';

import GeneralHeader from 'ui/components/Header/GeneralHeader';
import { Provider } from 'types/network';
import { BigNumber } from '@ethersproject/bignumber';
import { Modal, message, Button } from 'antd';
import { categoryToIconSVG } from 'ui/utils/networkCategoryToIcon';
import { useSelector } from 'react-redux';
import { IconComponent } from 'ui/components/IconComponents';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import clsx from 'clsx';

const Icon = (src: string) => (
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

type NetworkProviderWithOptionalTag = Provider & { idx?: number };

const RpcNetworkOptions = ({
  network,
}: {
  network: NetworkProviderWithOptionalTag;
}) => {
  const providerContext = useContext(NetworkProviderContext);
  const { t } = useTranslation();
  const history = useHistory();

  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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
    return <p>Loading</p>;
  }

  if (network.type !== 'rpc') {
    // Only `rpc` type are editable
    // other type was preset that cannot edit
    return null;
  }

  return (
    <div className="flex justify-center items-center">
      <IconButton icon={IconTrash} size={12} onClick={handleRemove} />
      <IconButton
        icon={IconEdit}
        size={12}
        onClick={(e) => {
          // stop the parent's onClick event
          e.stopPropagation();
          history.push(`/network/edit/${network.idx}`);
        }}
      />
    </div>
  );
};

const NetworkActions = ({
  network,
}: {
  network: NetworkProviderWithOptionalTag;
}) => {
  const currentNetworkController = useSelector((state) => state.network);
  const isSelectedNetwork = useMemo(() => {
    return BigNumber.from(network.chainId).eq(
      currentNetworkController?.provider.chainId || '0'
    );
  }, [network, currentNetworkController]);
  return (
    <span className="actions flex justify-center items-center">
      {isSelectedNetwork ? (
        <IconButton icon={IconCheck} size={12} />
      ) : (
        <div className="actions-not-selected">
          <RpcNetworkOptions network={network} />
        </div>
      )}
    </span>
  );
};

const NetworksSelectionContainer = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const providerContext = useContext(NetworkProviderContext);

  const networkList = useProviderList();

  useEffect(() => {
    if (providerContext)
      console.debug(
        'providerContext.currentNetworkController:',
        providerContext.currentNetworkController
      );
  }, [providerContext]);

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
                {Icon(currentCategory.icon || DefaulutIcon)}
                <h2 className="category-name">{currentCategory.displayName}</h2>
              </div>
              {currentCategory.networks.map((network, idx) => {
                // @todo: deal with it later
                const isSelectedNetwork = true;
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
              })}
            </div>
          );
        })}
      </div>
      <div
        key="customize"
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
