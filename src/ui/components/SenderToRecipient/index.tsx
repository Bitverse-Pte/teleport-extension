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
}) => {
  const { isDarkMode } = useDarkmode();
  const checksummedSenderAddress = needChecksum
    ? toChecksumHexAddress(senderAddress)
    : senderAddress;
  const checksummedRecipientAddress = needChecksum
    ? toChecksumHexAddress(recipientAddress)
    : recipientAddress;
  return (
    <div className={clsx('sender-to-recipient flexR', { dark: isDarkMode })}>
      <Address
        checksummedAddress={checksummedSenderAddress}
        name={senderName}
      />
      <IconComponent name="arrow-right" cls="to-icon" />
      <Address
        checksummedAddress={checksummedRecipientAddress}
        name={recipientName}
      />
    </div>
  );
};

export default SenderToRecipient;
