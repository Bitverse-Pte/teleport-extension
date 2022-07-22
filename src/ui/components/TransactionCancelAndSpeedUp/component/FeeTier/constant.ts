import { PRIORITY_LEVELS } from 'constants/gas';

export const priorityLevelToI18nKey: Record<PRIORITY_LEVELS, string> = {
  tenPercentIncreased: 'addTenPercent',
  low: 'Low',
  medium: 'Market',
  high: 'Fast',
  custom: 'Custom',
  dappSuggested: 'dappSuggested',
};
