/*import { IS_CHROME, CHECK_METAMASK_INSTALLED_URL } from 'constants/index';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};*/

export * from './WalletContext';
export * from './hooks';
export * from 'utils';
import { isHexString, addHexPrefix, toChecksumAddress } from 'ethereumjs-util';
import { utils } from 'ethers';
import BigNumber from 'bignumber.js';
import * as _ from 'lodash';

BigNumber.config({
  FORMAT: {
    /** the decimal separator */
    decimalSeparator: '.',
    /** the grouping separator of the integer part */
    groupSeparator: ',',
    /** the primary grouping size of the integer part */
    groupSize: 3,
  },
});

const UI_TYPE = {
  Tab: 'index',
  Pop: 'popup',
  Notification: 'notification',
};
type UiTypeCheck = {
  isTab: boolean;
  isNotification: boolean;
  isPop: boolean;
};
export const getUiType = (): UiTypeCheck => {
  const { pathname } = window.location;
  return Object.entries(UI_TYPE).reduce((m, [key, value]) => {
    m[`is${key}`] = pathname === `/${value}.html`;

    return m;
  }, {} as UiTypeCheck);
};
export const getUITypeName = (): string => {
  const UIType = getUiType();

  if (UIType.isPop) return 'popup';
  if (UIType.isNotification) return 'notification';
  if (UIType.isTab) return 'tab';

  return '';
};

export const transferAddress2Display = (address: string | undefined) => {
  if (address && address.length >= 40) {
    return `${address.substr(0, 6)}...${address.substr(address.length - 6, 6)}`;
  } else {
    return '';
  }
};

export function denom2SymbolRatio(
  number: string | number,
  decimal: number | string
) {
  return new BigNumber(
    new BigNumber(utils.formatUnits(number, decimal)).toFixed(2, 1)
  ).toFormat();
}

export const getOriginName = (origin: string) => {
  const matches = origin.replace(/https?:\/\//, '').match(/^([^.]+\.)?(\S+)\./);

  return matches ? matches[2] || origin : origin;
};

export const hashCode = (str: string) => {
  if (!str) return 0;
  let hash = 0,
    i,
    chr,
    len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const ellipsisOverflowedText = (
  str: string,
  length = 5,
  removeLastComma = false
) => {
  if (str.length <= length) return str;
  let cut = str.substring(0, length);
  if (removeLastComma) {
    if (cut.endsWith(',')) {
      cut = cut.substring(0, length - 1);
    }
  }
  return `${cut}...`;
};

export function toChecksumHexAddress(address) {
  if (!address) {
    // our internal checksumAddress function that this method replaces would
    // return an empty string for nullish input. If any direct usages of
    // ethereumjs-util.toChecksumAddress were called with nullish input it
    // would have resulted in an error on version 5.1.
    return '';
  }
  const hexPrefixed = addHexPrefix(address);
  if (!isHexString(hexPrefixed)) {
    // Version 5.1 of ethereumjs-utils would have returned '0xY' for input 'y'
    // but we shouldn't waste effort trying to change case on a clearly invalid
    // string. Instead just return the hex prefixed original string which most
    // closely mimics the original behavior.
    return hexPrefixed;
  }
  return toChecksumAddress(addHexPrefix(address));
}

export * from './number';

/*export * from './WindowContext';

export * from './hooks';

export * from './webapi';

export * from './time';

export * from './number';

const UI_TYPE = {
    Tab: 'index',
    Pop: 'popup',
    Notification: 'notification',
};

type UiTypeCheck = {
    isTab: boolean;
    isNotification: boolean;
    isPop: boolean;
};

export const getUiType = (): UiTypeCheck => {
    const { pathname } = window.location;
    return Object.entries(UI_TYPE).reduce((m, [key, value]) => {
        m[`is${key}`] = pathname === `/${value}.html`;

        return m;
    }, {} as UiTypeCheck);
};

export const hex2Text = (hex: string) => {
    try {
        return hex.startsWith('0x')
            ? decodeURIComponent(
                hex.replace(/^0x/, '').replace(/[0-9a-f]{2}/g, '%$&')
            )
            : hex;
    } catch {
        return hex;
    }
};

export const getUITypeName = (): string => {
    const UIType = getUiType();

    if (UIType.isPop) return 'popup';
    if (UIType.isNotification) return 'notification';
    if (UIType.isTab) return 'tab';

    return '';
};

/!**
 *
 * @param origin (exchange.pancakeswap.finance)
 * @returns (pancakeswap)
 *!/
export const getOriginName = (origin: string) => {
    const matches = origin.replace(/https?:\/\//, '').match(/^([^.]+\.)?(\S+)\./);

    return matches ? matches[2] || origin : origin;
};

export const hashCode = (str: string) => {
    if (!str) return 0;
    let hash = 0,
        i,
        chr,
        len;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

export const isMetaMaskActive = async () => {
    let url = '';

    if (IS_CHROME) {
        url = CHECK_METAMASK_INSTALLED_URL.Chrome;
    }

    if (!url) return false;

    try {
        const res = await window.fetch(url);
        await res.text();

        return true;
    } catch (e) {
        return false;
    }
};

export const ellipsisOverflowedText = (
    str: string,
    length = 5,
    removeLastComma = false
) => {
    if (str.length <= length) return str;
    let cut = str.substring(0, length);
    if (removeLastComma) {
        if (cut.endsWith(',')) {
            cut = cut.substring(0, length - 1);
        }
    }
    return `${cut}...`;
};

export const isSameAddress = (a: string, b: string) => {
    if (!a || !b) return false;
    return a.toLowerCase() === b.toLowerCase();
};*/
