import BigNumber from 'bignumber.js';
import { browser } from 'webextension-polyfill-ts';
import { isUndefined } from 'lodash';

import BroadcastChannelMessage from './message/broadcastChannelMessage';
import PortMessage from './message/portMessage';

const Message = {
  BroadcastChannelMessage,
  PortMessage,
};

declare global {
  const langLocales: Record<string, Record<'message', string>>;
}

const t = (name) => browser.i18n.getMessage(name);

const format = (str, ...args) => {
  return args.reduce((m, n) => m.replace('_s_', n), str);
};

export const getTotalPricesByAmountAndPrice = (
  amount: number | string,
  decimal: number | string,
  price: number | string
): string => {
  if (!isUndefined(amount) && !isUndefined(decimal) && !isUndefined(price)) {
    const pow = Math.pow(10, Number(decimal));
    const formats = new BigNumber(amount).div(pow);
    const prices = new BigNumber(formats).times(price);
    return new BigNumber(prices.toFixed(2, 1)).toFormat();
  }
  return '';
};

export { Message, t, format };
