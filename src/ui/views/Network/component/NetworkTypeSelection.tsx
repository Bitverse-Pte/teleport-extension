import { Divider } from 'antd';
import React, { useState } from 'react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Ecosystem } from 'types/network';

export function useNetworkTypeSelectionComponent(isEdit: boolean) {
  const { t } = useTranslation();
  const [selectedNetworkType, setNetworkType] = useState<Ecosystem>(
    Ecosystem.EVM
  );

  const component = isEdit ? null : (
    <Fragment>
      <h1 className="flex required">
        {t('networkType')}
        <select
          className="networkType"
          name="networkType"
          id="networkType"
          onChange={(e) => setNetworkType(e.target.value as Ecosystem)}
          value={selectedNetworkType}
        >
          <option value={Ecosystem.EVM}>EVM Networks</option>
        </select>
      </h1>
      <Divider />
    </Fragment>
  );

  return { component, selectedNetworkType };
}
