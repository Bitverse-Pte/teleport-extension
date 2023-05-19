import { AccountCreateType } from 'types/extend';

export const renderAccountCreateType = (accountCreateType) => {
  switch (accountCreateType) {
    case AccountCreateType.MPC:
      return 'MPC';
    case AccountCreateType.MNEMONIC:
      return 'HD';
    case AccountCreateType.PRIVATE_KEY:
      return 'Import';
    default:
      return 'other';
      break;
  }
};
