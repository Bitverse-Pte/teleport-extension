import React from 'react';
import qrCode from 'qrcode-generator';
import { isHexPrefixed } from 'ethereumjs-util';
import { toChecksumHexAddress } from 'ui/utils';

interface QRCodeViewProps {
  data: string;
  color?: string;
  margin?: number;
}

function QrCodeView({ data, color = '#000000', margin }: QRCodeViewProps) {
  const address = `${
    isHexPrefixed(data) ? 'ethereum:' : ''
  }${toChecksumHexAddress(data)}`;
  const qrImage = qrCode(4, 'M');
  qrImage.addData(address);
  qrImage.make();

  return (
    <div className="qr-code">
      <div
        className="qr-code__wrapper"
        dangerouslySetInnerHTML={{
          __html: qrImage
            .createTableTag(4, margin)
            .replaceAll(
              'background-color: #000000;',
              `background-color: ${color}`
            ),
        }}
      />
    </div>
  );
}

export default QrCodeView;
