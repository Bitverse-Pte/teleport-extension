export const HumanStandardTokenABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    type: 'function',
  },
  // ERC20 / ERC721 safeTransfer
  {
    constant: false,
    inputs: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'safeTransferFrom',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    type: 'function',
  },
  /**
   * ERC721 safeTransferFrom with data
   */
  {
    constant: false,
    inputs: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    payable: true,
    type: 'function',
  },
  /**
   * ERC1155 safeTransferFrom
   */
  {
    constant: false,
    inputs: [
      {
        name: 'from',
        type: 'address',
      },
      {
        name: 'to',
        type: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
      },
      {
        name: 'value',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'safeTransferFrom',
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'version',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
      {
        name: '_extraData',
        type: 'bytes',
      },
    ],
    name: 'approveAndCall',
    outputs: [
      {
        name: 'success',
        type: 'bool',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: 'remaining',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    inputs: [
      {
        name: '_initialAmount',
        type: 'uint256',
      },
      {
        name: '_tokenName',
        type: 'string',
      },
      {
        name: '_decimalUnits',
        type: 'uint8',
      },
      {
        name: '_tokenSymbol',
        type: 'string',
      },
    ],
    type: 'constructor',
  },
  {
    payable: false,
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_from',
        type: 'address',
      },
      {
        indexed: true,
        name: '_to',
        type: 'address',
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_owner',
        type: 'address',
      },
      {
        indexed: true,
        name: '_spender',
        type: 'address',
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
];

export default HumanStandardTokenABI;
