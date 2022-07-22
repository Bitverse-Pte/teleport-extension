import React from 'react';
import { Ecosystem } from 'types/network';
import { CosmosTransactionsList } from './Cosmos';
import { EvmTransactionsList } from './EVM';
import { ActivitiesListParams } from './typing';

export type UniversalTxListForAsset = ActivitiesListParams & {
  ecosystem: Ecosystem;
};

export function TransactionListRouter({
  ecosystem,
  ...props
}: UniversalTxListForAsset) {
  switch (ecosystem) {
    case Ecosystem.EVM:
      return <EvmTransactionsList {...props} />;
    case Ecosystem.COSMOS:
      return <CosmosTransactionsList {...props} />;
    default:
      return (
        <div>
          <h1 className="title">Sorry</h1>
          <h2 className="subtitle">
            No Activity implementation for {ecosystem} right now. Please contact
            developer for help.
          </h2>
        </div>
      );
  }
}
