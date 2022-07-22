import { BigNumber } from 'ethers';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Network } from 'types/network';
import { SimpleModal } from '../universal/SimpleModal';

function Item({ name, value }: { name: string; value: string }) {
  return (
    <div className="addChain-showchain-detail-item">
      <span className="addChain-showchain-detail-item-name with-semicolon-after">
        {name}
      </span>
      <span className="addChain-showchain-detail-item-value">{value}</span>
    </div>
  );
}

export function AddChainDetailCard({ showChain }: { showChain?: Network }) {
  const { t } = useTranslation();
  const [detailPopupVisible, setPopupVisible] = useState(false);

  if (!showChain) {
    return <p>Loading...</p>;
  }

  return (
    <div className="addChain-showchain-detail-card">
      <Item name={t('name')} value={showChain?.nickname} />
      <Item name={t('RPC URL')} value={showChain?.rpcUrl} />
      <Item
        name={t('Chain ID')}
        value={BigNumber.from(showChain?.chainId).toString()}
      />
      <a onClick={() => setPopupVisible(true)}>{t('View All Details')}</a>
      <SimpleModal
        title={t('Network Details')}
        visible={detailPopupVisible}
        onClose={() => setPopupVisible(false)}
      >
        <Item name={t('name')} value={showChain?.nickname} />
        <Item name={t('RPC URL')} value={showChain?.rpcUrl} />
        <Item name={t('Chain ID')} value={showChain?.chainId} />
        {showChain?.ticker && (
          <Item name={t('Currency Symbol')} value={showChain?.ticker} />
        )}
        {showChain?.rpcPrefs.blockExplorerUrl && (
          <Item
            name={t('Blockchain Browser')}
            value={showChain?.rpcPrefs.blockExplorerUrl}
          />
        )}
      </SimpleModal>
    </div>
  );
}

export function AddCosmosChainDetailCard({
  showChain,
}: {
  showChain?: Network;
}) {
  const { t } = useTranslation();

  if (!showChain) {
    return <p>Loading...</p>;
  }

  return (
    <div className="addChain-showchain-detail-card">
      <Item name={t('name')} value={showChain?.nickname} />
      <Item name={t('RPC URL')} value={showChain?.rpcUrl} />
      <Item name={t('Chain ID')} value={showChain?.chainId} />
    </div>
  );
}
