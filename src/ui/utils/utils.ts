import punycode from 'punycode/punycode';
import abi from 'human-standard-token-abi';
import BigNumber from 'bignumber.js';
import * as ethUtil from 'ethereumjs-util';
// import { DateTime } from 'luxon';
// import { util } from '@metamask/controllers';
// import { addHexPrefix } from '../../../app/scripts/lib/util';
// import {
//   GOERLI_CHAIN_ID,
//   KOVAN_CHAIN_ID,
//   LOCALHOST_CHAIN_ID,
//   MAINNET_CHAIN_ID,
//   RINKEBY_CHAIN_ID,
//   ROPSTEN_CHAIN_ID,
// } from '../../../shared/constants/network';
import { toChecksumHexAddress } from '@metamask/controllers/dist/util';
import dayjs from 'dayjs';
import { addHexPrefix } from 'ethereumjs-util';
import relativeTime from 'dayjs/plugin/relativeTime';
// use relativeTime support
dayjs.extend(relativeTime);
// import { toChecksumHexAddress } from '../../../shared/modules/hexstring-utils';
// import {
//   TRUNCATED_ADDRESS_START_CHARS,
//   TRUNCATED_NAME_CHAR_LIMIT,
//   TRUNCATED_ADDRESS_END_CHARS,
// } from '../../../shared/constants/labels';
// The character limit on ENS names, nicknames and addresses before we truncate
export const TRUNCATED_NAME_CHAR_LIMIT = 11;

// The number of characters to slice from the beginning of an address for truncated format:
// `${TRUNCATED_ADDRESS_START_CHARS}...${TRUNCATED_ADDRESS_END_CHARS}`
export const TRUNCATED_ADDRESS_START_CHARS = 5;

// The number of characters to slice from the end of an address for truncated format:
// `${TRUNCATED_ADDRESS_START_CHARS}...${TRUNCATED_ADDRESS_END_CHARS}`
export const TRUNCATED_ADDRESS_END_CHARS = 4;

// formatData :: ( date: <Unix Timestamp> ) -> String
export function formatDate(
  date: string | number | Date,
  format = "M/d/y 'at' T"
) {
  if (!date) {
    return '';
  }
  return dayjs(date).format(format);
  //   return DateTime.fromMillis(date).toFormat(format);
}

export function formatDateWithYearContext(
  date: string | number | Date,
  formatThisYear = 'MMM D',
  fallback = 'MMM D, Y'
) {
  if (!date) {
    return '';
  }
  const dateTime = dayjs(date);
  const now = dayjs();
  return dateTime.format(
    now.year === dateTime.year ? formatThisYear : fallback
  );
}

export function formatDateWithWeekContext(
  date: string | number | Date,
  fallback = 'YYYY-MM-DD hh:mm:ss'
) {
  if (!date) {
    return '';
  }
  const dateTime = dayjs(date);
  const now = dayjs();
  const is7DaysAgo = dateTime.isBefore(now, 'week');
  if (is7DaysAgo) {
    return dateTime.format(fallback);
  } else {
    return dateTime.fromNow();
  }
}
/**
 * Determines if the provided chainId is a default MetaMask chain
 * @param {string} chainId - chainId to check
 */
// export function isDefaultMetaMaskChain(chainId: string) {
//   if (
//     !chainId ||
//     chainId === MAINNET_CHAIN_ID ||
//     chainId === ROPSTEN_CHAIN_ID ||
//     chainId === RINKEBY_CHAIN_ID ||
//     chainId === KOVAN_CHAIN_ID ||
//     chainId === GOERLI_CHAIN_ID ||
//     chainId === LOCALHOST_CHAIN_ID
//   ) {
//     return true;
//   }

//   return false;
// }

// Both inputs should be strings. This method is currently used to compare tokenAddress hex strings.
export function isEqualCaseInsensitive(value1: string, value2: string) {
  if (typeof value1 !== 'string' || typeof value2 !== 'string') return false;
  return value1.toLowerCase() === value2.toLowerCase();
}

export function valuesFor(obj: { [x: string]: any }) {
  if (!obj) {
    return [];
  }
  return Object.keys(obj).map(function (key) {
    return obj[key];
  });
}

export function addressSummary(
  address: string,
  firstSegLength = 10,
  lastSegLength = 4,
  includeHex = true
) {
  if (!address) {
    return '';
  }
  let checked = toChecksumHexAddress(address);
  if (!includeHex) {
    checked = ethUtil.stripHexPrefix(checked);
  }
  return checked
    ? `${checked.slice(0, firstSegLength)}...${checked.slice(
        checked.length - lastSegLength
      )}`
    : '...';
}

export function isValidDomainName(address: string) {
  const match = punycode
    .toASCII(address)
    .toLowerCase()
    // Checks that the domain consists of at least one valid domain pieces separated by periods, followed by a tld
    // Each piece of domain name has only the characters a-z, 0-9, and a hyphen (but not at the start or end of chunk)
    // A chunk has minimum length of 1, but minimum tld is set to 2 for now (no 1-character tlds exist yet)
    .match(
      /^(?:[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\.)+[a-z0-9][-a-z0-9]*[a-z0-9]$/u
    );
  return match !== null;
}

export function isOriginContractAddress(to: string, sendTokenAddress: string) {
  if (!to || !sendTokenAddress) {
    return false;
  }
  return to.toLowerCase() === sendTokenAddress.toLowerCase();
}

// Takes wei Hex, returns wei BN, even if input is null
export function numericBalance(balance: string) {
  if (!balance) {
    return new ethUtil.BN(0, 16);
  }
  const stripped = ethUtil.stripHexPrefix(balance);
  return new ethUtil.BN(stripped, 16);
}

// Takes  hex, returns [beforeDecimal, afterDecimal]
export function parseBalance(balance: string) {
  let afterDecimal: string;
  const wei = numericBalance(balance);
  const weiString = wei.toString();
  const trailingZeros = /0+$/u;

  const beforeDecimal =
    weiString.length > 18 ? weiString.slice(0, weiString.length - 18) : '0';
  afterDecimal = `000000000000000000${wei}`
    .slice(-18)
    .replace(trailingZeros, '');
  if (afterDecimal === '') {
    afterDecimal = '0';
  }
  return [beforeDecimal, afterDecimal];
}

// Takes wei hex, returns an object with three properties.
// Its "formatted" property is what we generally use to render values.
export function formatBalance(
  balance: string,
  decimalsToKeep: number | undefined,
  needsParse = true,
  ticker = 'ETH'
) {
  const parsed = needsParse ? parseBalance(balance) : balance.split('.');
  const beforeDecimal = parsed[0];
  let afterDecimal = parsed[1];
  let formatted = 'None';
  if (decimalsToKeep === undefined) {
    if (beforeDecimal === '0') {
      if (afterDecimal !== '0') {
        const sigFigs = afterDecimal.match(/^0*(.{2})/u); // default: grabs 2 most significant digits
        if (sigFigs) {
          afterDecimal = sigFigs[0];
        }
        formatted = `0.${afterDecimal} ${ticker}`;
      }
    } else {
      formatted = `${beforeDecimal}.${afterDecimal.slice(0, 3)} ${ticker}`;
    }
  } else {
    afterDecimal += Array(decimalsToKeep).join('0');
    formatted = `${beforeDecimal}.${afterDecimal.slice(
      0,
      decimalsToKeep
    )} ${ticker}`;
  }
  return formatted;
}

// export function getContractAtAddress(tokenAddress: any) {
//   return global.eth.contract(abi).at(tokenAddress);
// }

export function getRandomFileName() {
  let fileName = '';
  const charBank = [
    ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  ];
  const fileNameLength = Math.floor(Math.random() * 7 + 6);

  for (let i = 0; i < fileNameLength; i++) {
    fileName += charBank[Math.floor(Math.random() * charBank.length)];
  }

  return fileName;
}

export function exportAsFile(
  filename: string,
  data: BlobPart,
  type = 'text/csv'
) {
  // eslint-disable-next-line no-param-reassign
  filename = filename || getRandomFileName();
  // source: https://stackoverflow.com/a/33542499 by Ludovic Feltz
  const blob = new window.Blob([data], { type });
  if ((window.navigator as any).msSaveOrOpenBlob) {
    (window.navigator as any).msSaveBlob(blob, filename);
  } else {
    const elem = window.document.createElement('a');
    elem.target = '_blank';
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}

/**
 * Shortens an Ethereum address for display, preserving the beginning and end.
 * Returns the given address if it is no longer than 10 characters.
 * Shortened addresses are 13 characters long.
 *
 * Example output: 0xabcd...1234
 *
 * @param {string} address - The address to shorten.
 * @returns {string} The shortened address, or the original if it was no longer
 * than 10 characters.
 */
export function shortenAddress(address = ''): string {
  if (address.length < TRUNCATED_NAME_CHAR_LIMIT) {
    return address;
  }

  return `${address.slice(0, TRUNCATED_ADDRESS_START_CHARS)}...${address.slice(
    -TRUNCATED_ADDRESS_END_CHARS
  )}`;
}

export function getAccountByAddress(accounts = [], targetAddress: any) {
  return accounts.find(({ address }) => address === targetAddress);
}

/**
 * Strips the following schemes from URL strings:
 * - http
 * - https
 *
 * @param {string} urlString - The URL string to strip the scheme from.
 * @returns {string} The URL string, without the scheme, if it was stripped.
 */
export function stripHttpSchemes(urlString: string): string {
  return urlString.replace(/^https?:\/\//u, '');
}

/**
 * Strips the following schemes from URL strings:
 * - https
 *
 * @param {string} urlString - The URL string to strip the scheme from.
 * @returns {string} The URL string, without the scheme, if it was stripped.
 */
export function stripHttpsScheme(urlString: string): string {
  return urlString.replace(/^https:\/\//u, '');
}

/**
 * Strips `https` schemes from URL strings, if the URL does not have a port.
 * This is useful
 *
 * @param {string} urlString - The URL string to strip the scheme from.
 * @returns {string} The URL string, without the scheme, if it was stripped.
 */
export function stripHttpsSchemeWithoutPort(urlString: string): string {
  if (getURL(urlString)?.port) {
    return urlString;
  }

  return stripHttpsScheme(urlString);
}

/**
 * Checks whether a URL-like value (object or string) is an extension URL.
 *
 * @param {string | URL | object} urlLike - The URL-like value to test.
 * @returns {boolean} Whether the URL-like value is an extension URL.
 */
export function isExtensionUrl(
  urlLike: string | URL | Record<string, any>
): boolean {
  const EXT_PROTOCOLS = ['chrome-extension:', 'moz-extension:'];

  if (typeof urlLike === 'string') {
    for (const protocol of EXT_PROTOCOLS) {
      if (urlLike.startsWith(protocol)) {
        return true;
      }
    }
  } else if ('protocol' in urlLike && urlLike?.protocol) {
    return EXT_PROTOCOLS.includes(urlLike.protocol);
  }
  return false;
}

/**
 * Checks whether an address is in a passed list of objects with address properties. The check is performed on the
 * lowercased version of the addresses.
 *
 * @param {string} address - The hex address to check
 * @param {Array} list - The array of objects to check
 * @returns {boolean} Whether or not the address is in the list
 */
export function checkExistingAddresses(
  address: string,
  list: Array<any> = []
): boolean {
  if (!address) {
    return false;
  }

  const matchesAddress = (obj: { address: string }) => {
    return obj.address.toLowerCase() === address.toLowerCase();
  };

  return list.some(matchesAddress);
}

/**
 * Given a number and specified precision, returns that number in base 10 with a maximum of precision
 * significant digits, but without any trailing zeros after the decimal point To be used when wishing
 * to display only as much digits to the user as necessary
 *
 * @param {string | number | BigNumber} n - The number to format
 * @param {number} precision - The maximum number of significant digits in the return value
 * @returns {string} The number in decimal form, with <= precision significant digits and no decimal trailing zeros
 */
export function toPrecisionWithoutTrailingZeros(
  n: string | number | BigNumber,
  precision: number
): string {
  return new BigNumber(n)
    .toPrecision(precision)
    .replace(/(\.[0-9]*[1-9])0*|(\.0*)/u, '$1');
}

/**
 * Given and object where all values are strings, returns the same object with all values
 * now prefixed with '0x'
 */
export function addHexPrefixToObjectValues(obj: {
  [x: string]: any;
  data?: any;
  from?: any;
  value?: string;
  gas?: any;
  gasPrice?: any;
}) {
  return Object.keys(obj).reduce((newObj, key) => {
    return { ...newObj, [key]: addHexPrefix(obj[key]) };
  }, {});
}

/**
 * Given the standard set of information about a transaction, returns a transaction properly formatted for
 * publishing via JSON RPC and web3
 *
 * @param {boolean} [sendToken] - Indicates whether or not the transaciton is a token transaction
 * @param {string} data - A hex string containing the data to include in the transaction
 * @param {string} to - A hex address of the tx recipient address
 * @param {string} from - A hex address of the tx sender address
 * @param {string} gas - A hex representation of the gas value for the transaction
 * @param {string} gasPrice - A hex representation of the gas price for the transaction
 * @returns {Object} An object ready for submission to the blockchain, with all values appropriately hex prefixed
 */
export function constructTxParams({
  sendToken,
  data,
  to,
  amount,
  from,
  gas,
  gasPrice,
}: {
  sendToken: boolean;
  data: string;
  to: string;
  amount: string;
  from: string;
  gas: string;
  gasPrice: string;
}): Record<string, unknown> {
  const txParams: any = {
    data,
    from,
    value: '0',
    gas,
    gasPrice,
  };

  if (!sendToken) {
    txParams.value = amount;
    txParams.to = to;
  }
  return addHexPrefixToObjectValues(txParams);
}

export function bnGreaterThan(
  a: string | number | BigNumber | null | undefined,
  b: string | number | BigNumber | null | undefined
) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return null;
  }
  return new BigNumber(a, 10).gt(b, 10);
}

export function bnLessThan(
  a: string | number | BigNumber | null | undefined,
  b: string | number | BigNumber | null | undefined
) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return null;
  }
  return new BigNumber(a, 10).lt(b, 10);
}

export function bnGreaterThanEqualTo(
  a: string | number | BigNumber | null | undefined,
  b: string | number | BigNumber | null | undefined
) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return null;
  }
  return new BigNumber(a, 10).gte(b, 10);
}

export function bnLessThanEqualTo(
  a: string | number | BigNumber | null | undefined,
  b: string | number | BigNumber | null | undefined
) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return null;
  }
  return new BigNumber(a, 10).lte(b, 10);
}

export function getURL(url: string | URL) {
  try {
    return new URL(url);
  } catch (err) {
    return undefined;
  }
}

export function getURLHost(url: any) {
  return getURL(url)?.host || '';
}

export function getURLHostName(url: any) {
  return getURL(url)?.hostname || '';
}

// Once we reach this threshold, we switch to higher unit
const MINUTE_CUTOFF = 90 * 60;
const SECOND_CUTOFF = 90;

export const toHumanReadableTime = (
  t: (arg0: string, arg1: number[]) => any,
  milliseconds: number | null | undefined
) => {
  if (milliseconds === undefined || milliseconds === null) return '';
  const seconds = Math.ceil(milliseconds / 1000);
  if (seconds <= SECOND_CUTOFF) {
    return t('gasTimingSecondsShort', [seconds]);
  }
  if (seconds <= MINUTE_CUTOFF) {
    return t('gasTimingMinutesShort', [Math.ceil(seconds / 60)]);
  }
  return t('gasTimingHoursShort', [Math.ceil(seconds / 3600)]);
};

export function clearClipboard() {
  window.navigator.clipboard.writeText('');
}

const solidityTypes = () => {
  const types = [
    'bool',
    'address',
    'string',
    'bytes',
    'int',
    'uint',
    'fixed',
    'ufixed',
  ];

  const ints = Array.from(new Array(32)).map(
    (_, index) => `int${(index + 1) * 8}`
  );
  const uints = Array.from(new Array(32)).map(
    (_, index) => `uint${(index + 1) * 8}`
  );
  const bytes = Array.from(new Array(32)).map(
    (_, index) => `bytes${index + 1}`
  );

  /**
   * fixed and ufixed
   * This value type also can be declared keywords such as ufixedMxN and fixedMxN.
   * The M represents the amount of bits that the type takes,
   * with N representing the number of decimal points that are available.
   *  M has to be divisible by 8, and a number from 8 to 256.
   * N has to be a value between 0 and 80, also being inclusive.
   */
  const fixedM = Array.from(new Array(32)).map(
    (_, index) => `fixed${(index + 1) * 8}`
  );
  const ufixedM = Array.from(new Array(32)).map(
    (_, index) => `ufixed${(index + 1) * 8}`
  );
  const fixed = Array.from(new Array(80)).map((_, index) =>
    fixedM.map((aFixedM) => `${aFixedM}x${index + 1}`)
  );
  const ufixed = Array.from(new Array(80)).map((_, index) =>
    ufixedM.map((auFixedM) => `${auFixedM}x${index + 1}`)
  );

  return [
    ...types,
    ...ints,
    ...uints,
    ...bytes,
    // @todo: need ts target to es2019 or higher
    ...fixed.flat(),
    ...ufixed.flat(),
  ];
};

export const sanitizeMessage = (
  msg: { [x: string]: any },
  baseType: string | number,
  types: { [x: string]: any }
) => {
  if (!types) {
    throw new Error('Invalid types definition');
  }

  const baseTypeDefinitions = types[baseType];
  if (!baseTypeDefinitions) {
    throw new Error('Invalid primary type definition');
  }

  const sanitizedMessage = {};
  const msgKeys = Object.keys(msg);
  msgKeys.forEach((msgKey) => {
    const definedType: any = Object.values(baseTypeDefinitions).find(
      (baseTypeDefinition: any) => baseTypeDefinition.name === msgKey
    );

    if (!definedType) {
      return;
    }

    // key has a type. check if the definedType is also a type
    const nestedType = definedType.type.replace(/\[\]$/u, '');
    const nestedTypeDefinition = types[nestedType];

    if (nestedTypeDefinition) {
      if (definedType.type.endsWith('[]') > 0) {
        // nested array
        sanitizedMessage[msgKey] = msg[msgKey].map((value: any) =>
          sanitizeMessage(value, nestedType, types)
        );
      } else {
        // nested object
        sanitizedMessage[msgKey] = sanitizeMessage(
          msg[msgKey],
          definedType.type,
          types
        );
      }
    } else {
      // check if it's a valid solidity type
      const isSolidityType = solidityTypes().includes(nestedType);
      if (isSolidityType) {
        sanitizedMessage[msgKey] = msg[msgKey];
      }
    }
  });
  return sanitizedMessage;
};

// export function getAssetImageURL(image: string, ipfsGateway: any) {
//   if (!image || !ipfsGateway || typeof image !== 'string') {
//     return '';
//   }

//   if (image.startsWith('ipfs://')) {
//     return util.getFormattedIpfsUrl(ipfsGateway, image, true);
//   }
//   return image;
// }
