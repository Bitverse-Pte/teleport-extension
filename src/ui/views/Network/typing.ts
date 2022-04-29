import { Ecosystem, Provider } from 'types/network';

export type NetworksCategories = {
  [Ecosystem.EVM]: {
    displayName: string;
    // icon?: React.ReactNode;
    icon?: string;
    networks: Provider[];
  };
  [Ecosystem.COSMOS]: {
    displayName: string;
    // icon?: React.ReactNode;
    icon?: string;
    networks: Provider[];
  };
  [Ecosystem.POLKADOT]: {
    displayName: string;
    // icon?: React.ReactNode;
    icon?: string;
    networks: Provider[];
  };
};
