import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Space } from 'antd';
import { transferAddress2Display, toChecksumHexAddress } from 'ui/utils';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import IconArrowRight from 'assets/to.png';
import './index.less';

const onCopy = () => {
  message.success('Copied');
};

function Address({ checksummedAddress, name }) {
  const { t } = useTranslation();
  return (
    <div
      className="sender"
      onClick={() => {
        // alert('from address copied');
      }}
    >
      <Space>
        <Jazzicon
          seed={Number(checksummedAddress?.substr(0, 8) || 0)}
          diameter={24}
        />
        <div className="name">{name}</div>
      </Space>
      <CopyToClipboard text={checksummedAddress} onCopy={onCopy}>
        <div className="address">
          <span>{transferAddress2Display(checksummedAddress)}</span>
        </div>
      </CopyToClipboard>
    </div>
  );
}

function Arrow() {
  return (
    <div className="arrow-circle">
      <img src={IconArrowRight} alt="" />
    </div>
  );
}

const SenderToRecipient = ({
  senderAddress,
  senderName,
  recipientName,
  recipientAddress,
}) => {
  const checksummedSenderAddress = toChecksumHexAddress(senderAddress);
  const checksummedRecipientAddress = toChecksumHexAddress(recipientAddress);

  return (
    <div className="sender-to-recipient flexR">
      <Address
        checksummedAddress={checksummedSenderAddress}
        name={senderName}
      />
      <Arrow />
      <Address
        checksummedAddress={checksummedRecipientAddress}
        name={recipientName}
      />
    </div>
  );
};

export default SenderToRecipient;
