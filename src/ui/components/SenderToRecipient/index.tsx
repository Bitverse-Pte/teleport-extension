/* eslint-disable no-empty */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Space } from 'antd';
import { transferAddress2Display, toChecksumHexAddress } from 'ui/utils';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { getUnit10ByAddress } from 'background/utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './index.less';
import { IconComponent } from '../IconComponents';
import clsx from 'clsx';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';
import { ethers } from 'ethers';
export const erc20 = [
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
    stateMutability: 'view',
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
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
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
    stateMutability: 'view',
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
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
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
    stateMutability: 'view',
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
    stateMutability: 'view',
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
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
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
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
];

// 解码数据参数
const iface = new ethers.utils.Interface(erc20);

function Address({ checksummedAddress, name }) {
  const { t } = useTranslation();
  const ClickToCloseMessage = useStyledMessage();
  const onCopy = () => {
    ClickToCloseMessage('success')('Copied');
  };
  return (
    <div
      className="sender"
      onClick={() => {
        // alert('from address copied');
      }}
    >
      <div className="sender-icon-and-name flex">
        <Jazzicon seed={getUnit10ByAddress(checksummedAddress)} diameter={16} />
        <div className="name">{name}</div>
      </div>
      <CopyToClipboard text={checksummedAddress} onCopy={onCopy}>
        <div className="address">
          <span>{transferAddress2Display(checksummedAddress)}</span>
        </div>
      </CopyToClipboard>
    </div>
  );
}

const SenderToRecipient = ({
  senderAddress,
  senderName,
  recipientName,
  recipientAddress,
  needChecksum = true,
  tx,
}) => {
  const { isDarkMode } = useDarkmode();
  const [address, setAddress] = useState('');
  let decodedData: any = [];
  if (tx && tx.data) {
    try {
      decodedData = iface.decodeFunctionData('transfer', tx.data);
    } catch (error) {}
  }

  let checksummedRecipientAddress = '';
  if (decodedData[0] && decodedData[0].includes('0x')) {
    checksummedRecipientAddress = decodedData[0];
  } else {
    checksummedRecipientAddress = needChecksum
      ? toChecksumHexAddress(recipientAddress)
      : recipientAddress;
  }

  const checksummedSenderAddress = needChecksum
    ? toChecksumHexAddress(senderAddress)
    : senderAddress;

  return (
    <div className={clsx('sender-to-recipient flexR', { dark: isDarkMode })}>
      <Address
        checksummedAddress={checksummedSenderAddress}
        name={senderName}
      />
      <IconComponent name="arrow-right" cls="to-icon" />
      <Address
        checksummedAddress={address || checksummedRecipientAddress}
        name={recipientName}
      />
    </div>
  );
};

export default SenderToRecipient;
