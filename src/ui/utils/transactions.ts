import { MethodRegistry } from 'eth-method-registry';
// import abi from 'utils/human-standard-token-abi-extended';
import StreamProvider from 'web3-stream-provider';
import { ethers } from 'ethers';
import log from 'loglevel';
// import { addCurrencies } from '../../../shared/modules/conversion.utils';
import fetchWithCache from './fetch-with-cache';
import { addHexPrefix } from 'ethereumjs-util';
import {
  Transaction,
  TransactionGroupStatuses,
  TransactionStatuses,
  TransactionTypes,
} from 'constants/transaction';
import { TOKEN_TRANSFER_FUNCTION_SIGNATURE } from 'ui/context/send.constants';
import { addCurrencies, multiplyCurrencies } from './conversion';
import { conversionGreaterThan, conversionLessThan } from 'utils/conversion';
import abi from 'utils/human-standard-token-abi-extended';

const hstInterface = new ethers.utils.Interface(abi);

export function getTokenData(
  data: string
): ethers.utils.TransactionDescription | undefined {
  try {
    return hstInterface.parseTransaction({ data });
  } catch (error) {
    log.debug('Failed to parse transaction data.', error, data);
    return undefined;
  }
}

type fourByteDirectoryResponse = {
  count: number;
  next: null;
  previous: null;
  results: [
    {
      id: number;
      created_at: string;
      text_signature: string;
      hex_signature: string;
      bytes_signature: string;
    }
  ];
};

async function getMethodFrom4Byte(fourBytePrefix: string) {
  const fourByteResponse: fourByteDirectoryResponse = await fetchWithCache(
    `https://www.4byte.directory/api/v1/signatures/?hex_signature=${fourBytePrefix}`,
    {
      referrerPolicy: 'no-referrer-when-downgrade',
      body: null,
      method: 'GET',
      mode: 'cors',
    }
  );

  if (fourByteResponse.count === 1) {
    return fourByteResponse.results[0].text_signature;
  }
  return null;
}
let registry: MethodRegistry | undefined;

/**
 * Attempts to return the method data from the MethodRegistry library, the message registry library and the token abi, in that order of preference
 * @param {string} fourBytePrefix - The prefix from the method code associated with the data
 * @returns {Object}
 */
export async function getMethodDataAsync(
  fourBytePrefix: string,
  provider: any
): Promise<Record<string, any>> {
  try {
    const fourByteSig = getMethodFrom4Byte(fourBytePrefix).catch((e) => {
      log.error(e);
      return null;
    });

    registry = new MethodRegistry({ provider, network: '1' });

    // if (!registry) {
    //   // @todo: we need the `global.ethereumProvider`
    //   // registry = new MethodRegistry({ provider: global.ethereumProvider });
    //   // network is for lookup, use ETH mainnet here
    // registry = new MethodRegistry({ provider, network: '1' });
    // }

    // let sig: string | undefined | null = await registry.lookup(fourBytePrefix);
    const sig = await fourByteSig;
    // if (!sig) {
    //   sig = await fourByteSig;
    // }

    if (!sig) {
      return {};
    }

    const parsedResult = registry.parse(sig);

    return {
      name: parsedResult.name,
      params: parsedResult.args,
    };
  } catch (error) {
    log.error(error);
    return {};
  }
}

/**
 * Returns four-byte method signature from data
 *
 * @param data - The hex data (@code txParams.data) of a transaction
 * @returns The four-byte method signature
 */
export function getFourBytePrefix(data = '') {
  const prefixedData = addHexPrefix(data);
  const fourBytePrefix = prefixedData.slice(0, 10);
  return fourBytePrefix;
}

/**
 * Given an transaction category, returns a boolean which indicates whether the transaction is calling an erc20 token method
 *
 * @param {TransactionTypes} type - The type of transaction being evaluated
 * @returns {boolean} whether the transaction is calling an erc20 token method
 */
export function isTokenMethodAction(type: TransactionTypes): boolean {
  return [
    TransactionTypes.TOKEN_METHOD_TRANSFER,
    TransactionTypes.TOKEN_METHOD_APPROVE,
    TransactionTypes.TOKEN_METHOD_TRANSFER_FROM,
  ].includes(type);
}

export function getLatestSubmittedTxWithNonce(
  transactions: Transaction[] = [],
  nonce = '0x0'
): Transaction | undefined {
  if (!transactions.length) {
    return undefined;
  }

  return transactions.reduce<Transaction>((acc, current) => {
    const { submittedTime, txParams: { nonce: currentNonce } = {} } = current;

    if (currentNonce === nonce) {
      if (!acc.submittedTime) {
        return current;
      }
      if (
        submittedTime &&
        acc.submittedTime &&
        submittedTime > acc.submittedTime
      ) {
        return current;
      } else {
        return acc;
      }
    }
    return acc;
  }, transactions[0]);
}

// export async function isSmartContractAddress(address: string) {
//   const code = await global.eth.getCode(address);
//   // Geth will return '0x', and ganache-core v2.2.1 will return '0x0'
//   const codeIsEmpty = !code || code === '0x' || code === '0x0';
//   return !codeIsEmpty;
// }

// export function sumHexes(...args) {
//   const total = args.reduce((acc, hexAmount) => {
//     return addCurrencies(acc, hexAmount, {
//       toNumericBase: 'hex',
//       aBase: 16,
//       bBase: 16,
//     });
//   });

//   return addHexPrefix(total);
// }

/**
 * Returns a status key for a transaction. Requires parsing the txMeta.txReceipt on top of
 * txMeta.status because txMeta.status does not reflect on-chain errors.
 * @param {Object} transaction - The txMeta object of a transaction.
 * @param {Object} transaction.txReceipt - The transaction receipt.
 * @returns
 */
export function getStatusKey(
  transaction: Transaction
): TransactionStatuses | 'cancelled' {
  const {
    txReceipt: { status: receiptStatus } = {},
    type,
    status,
  } = transaction;

  // There was an on-chain failure
  if (receiptStatus === '0x0') {
    return TransactionStatuses.FAILED;
  }

  if (
    status === TransactionStatuses.CONFIRMED &&
    type === TransactionTypes.CANCEL
  ) {
    return TransactionGroupStatuses.CANCELLED;
  }

  return transaction.status;
}

/**
 * Returns a title for the given transaction category.
 *
 * This will throw an error if the transaction category is unrecognized and no default is provided.
 * @param {function} t - The translation function
 * @param {TransactionTypes} type - The transaction type constant
 * @param {string} nativeCurrency - The native currency of the currently selected network
 * @returns {string} The transaction category title
 */
export function getTransactionTypeTitle(
  t: (...args: any[]) => string,
  type: TransactionTypes,
  nativeCurrency = 'ETH'
): string {
  switch (type) {
    case TransactionTypes.TOKEN_METHOD_TRANSFER: {
      return t('transfer');
    }
    case TransactionTypes.TOKEN_METHOD_TRANSFER_FROM: {
      return t('transferFrom');
    }
    case TransactionTypes.TOKEN_METHOD_APPROVE: {
      return t('approve');
    }
    case TransactionTypes.SIMPLE_SEND: {
      return t('sendingNativeAsset', [nativeCurrency]);
    }
    case TransactionTypes.CONTRACT_INTERACTION: {
      return t('contractInteraction');
    }
    case TransactionTypes.DEPLOY_CONTRACT: {
      return t('contractDeployment');
    }
    case TransactionTypes.SWAP: {
      return t('swap');
    }
    case TransactionTypes.SWAP_APPROVAL: {
      return t('swapApproval');
    }
    default: {
      throw new Error(`Unrecognized transaction type: ${type}`);
    }
  }
}

export function sumHexes(...args) {
  const total = args.reduce((acc, hexAmount) => {
    return addCurrencies(acc, hexAmount, {
      toNumericBase: 'hex',
      aBase: 16,
      bBase: 16,
    });
  });

  return addHexPrefix(total);
}

export function getHexGasTotal({
  gasLimit,
  gasPrice,
}: {
  gasLimit: string;
  gasPrice: string;
}) {
  return addHexPrefix(
    multiplyCurrencies(gasLimit || '0x0', gasPrice || '0x0', {
      toNumericBase: 'hex',
      multiplicandBase: 16,
      multiplierBase: 16,
    })
  );
}

export const readAddressAsContract = async (ethQuery, address) => {
  let contractCode;
  try {
    contractCode = await ethQuery.getCode(address);
  } catch (e) {
    contractCode = null;
  }

  const isContractAddress =
    contractCode && contractCode !== '0x' && contractCode !== '0x0';
  return { contractCode, isContractAddress };
};

function addGasBuffer(
  initialGasLimitHex,
  blockGasLimitHex,
  bufferMultiplier = 1.5
) {
  const upperGasLimit = multiplyCurrencies(blockGasLimitHex, 0.9, {
    toNumericBase: 'hex',
    multiplicandBase: 16,
    multiplierBase: 10,
    numberOfDecimals: '0',
  });
  const bufferedGasLimit = multiplyCurrencies(
    initialGasLimitHex,
    bufferMultiplier,
    {
      toNumericBase: 'hex',
      multiplicandBase: 16,
      multiplierBase: 10,
      numberOfDecimals: '0',
    }
  );

  // if initialGasLimit is above blockGasLimit, dont modify it
  if (
    conversionGreaterThan(
      { value: initialGasLimitHex, fromNumericBase: 'hex' },
      { value: upperGasLimit, fromNumericBase: 'hex' }
    )
  ) {
    return initialGasLimitHex;
  }
  // if bufferedGasLimit is below blockGasLimit, use bufferedGasLimit
  if (
    conversionLessThan(
      { value: bufferedGasLimit, fromNumericBase: 'hex' },
      { value: upperGasLimit, fromNumericBase: 'hex' }
    )
  ) {
    return bufferedGasLimit;
  }
  // otherwise use blockGasLimit
  return upperGasLimit;
}
