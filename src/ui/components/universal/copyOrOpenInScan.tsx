import React, { HTMLAttributes } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { message } from 'antd';
import { IconComponent } from 'ui/components/IconComponents';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import sensors from 'sa-sdk-javascript';
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';

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
  const location = useLocation();
  const ClickToCloseMessage = useStyledMessage();

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
          sensors.track('teleport_activity_copy', { page: location.pathname });
          ClickToCloseMessage('success')(t('copied_to_clipboard'));
        }}
      >
        <IconComponent
          name="copy"
          cls="some-padding"
          style={{ width: '12px', height: '12px', fill: '#56FAA5' }}
        />
      </CopyToClipboard>
      <IconComponent
        name="external-link"
        cls="explorer some-padding"
        style={{ width: '12px', height: '12px', fill: '#56FAA5' }}
        onClick={handleExplorerClick}
      />
    </div>
  );
}
