import { Provider } from 'types/network';

type ProviderWithOptionalTag = Provider & {
  idx?: number;
};

export type NetworksCategories = {
  [x: string]: {
    displayName: string;
    // icon?: React.ReactNode;
    icon?: string;
    networks: ProviderWithOptionalTag[];
  };
};
