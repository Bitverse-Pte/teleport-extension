import { CHAINS_ENUM } from 'constants/index';
import {
  permissionService,
  keyringService,
  preferenceService,
} from 'background/service';
import providerController from './controller';

const tabCheckin = ({
  data: {
    params: { origin, name, icon },
  },
  session,
}) => {
  session.setProp({ origin, name, icon });
};

const getProviderState = async (req) => {
  const {
    session: { origin },
  } = req;

  const chainEnum = permissionService.getWithoutUpdate(origin)?.chain;
  const isUnlocked = keyringService.getIsUnlocked();

  return {
    chainId: providerController.ethChainId(req),
    isUnlocked,
    accounts: isUnlocked ? await providerController.ethAccounts(req) : [],
    networkVersion: await providerController.netVersion(req),
  };
};

const isDefaultWallet = () => {
  return preferenceService.getIsDefaultWallet();
};

export default {
  tabCheckin,
  getProviderState,
  isDefaultWallet,
};
