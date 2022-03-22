import React, { HTMLAttributes } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message } from 'antd';
import { IconComponent } from 'ui/components/IconComponents';
import clsx from 'clsx';
import { ClickToCloseMessage } from './ClickToCloseMessage';
import { useTranslation } from 'react-i18next';

interface CopyOrOpenInScanParameter extends HTMLAttributes<HTMLDivElement> {
  handleExplorerClick: (...args: any[]) => void;
  textToBeCopy: string;
}

export default function CopyOrOpenInScan({
  handleExplorerClick,
  textToBeCopy,
  className,
  ...otherDivProps
}: CopyOrOpenInScanParameter) {
  const { t } = useTranslation();
  return (
    <div
      className={clsx(
        className,
        'copyOrOpenInScan-action flex items-center justify-center'
      )}
      {...otherDivProps}
    >
      <CopyToClipboard
        text={textToBeCopy}
        onCopy={() => {
          ClickToCloseMessage.success(t('copied_to_clipboard'));
        }}
      >
        <IconComponent
          name="copy"
          cls="blue some-padding"
          style={{ width: '12px', height: '12px' }}
        />
      </CopyToClipboard>
      <IconComponent
        name="external-link"
        cls="explorer blue some-padding"
        style={{ width: '12px', height: '12px' }}
        onClick={handleExplorerClick}
      />
    </div>
  );
}
