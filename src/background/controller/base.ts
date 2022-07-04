import cloneDeep from 'lodash/cloneDeep';
import { preferenceService, keyringService } from 'background/service';
import { BaseAccount } from 'types/extend';

class BaseController {
  getCurrentAccount = (): BaseAccount | undefined | null => {
    let account: BaseAccount | undefined | null =
      preferenceService.getCurrentAccount();
    const accounts = this.getAccounts();
    if (
      accounts?.length &&
      (!account ||
        accounts.every((a: BaseAccount) => a.address !== account!.address))
    ) {
      account = accounts[0];
      preferenceService.setCurrentAccount(account);
    } else if (accounts.length && account) {
      account = accounts.find(
        (a: BaseAccount) =>
          a.hdWalletId === account!.hdWalletId && a.address === account!.address
      );
    } else if (!accounts.length) {
      account = null;
    }
    return cloneDeep(account);
  };

  getAccounts = (): BaseAccount[] => {
    return keyringService.getAccountAllList();
  };
}

export default BaseController;
