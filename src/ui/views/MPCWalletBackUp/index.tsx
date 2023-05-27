import React, { useState } from 'react';
import { FC } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { getGoogleAuthToken } from 'ui/utils/auth2';

interface MPCWalletBackUpProps {}

const MPCWalletBackUp: FC<MPCWalletBackUpProps> = () => {
  const [authToken, setAuthToken] = useState('');
  const handleGoogleAuth = async () => {
    const token = await getGoogleAuthToken();
    setAuthToken(token);
  };
  async function createFileAndUpload(content) {
    const token = await getGoogleAuthToken();
    setAuthToken(token);
    const metadata = {
      name: 'walletid1233.x', // 文件名
      mimeType: 'text/plain', // 文件类型
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', new Blob([content], { type: 'text/plain' }));

    const result = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      }
    );
    const json = await result.json();
    return json;
  }

  // 上传按钮点击事件处理函数
  function handleUploadButtonClick() {
    const content = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjf6OVp0fzHU525LaZu+X
    7SRg4MeyBep4TgfY1Txq5HyGxp8XTiVavcOrQ08qTxR9jcVSKuzg84yhE85epdPm
    pljwhEJA87rn4knw9Uk45u9kaSj67Fbag9gKk+k84BRt9H/sk5O77ei5Zd43TcFE
    fnKP5aO97rhfERcaUi2dOpTJTR+iFgnkeSqgNcNPWJ9nMoHx00k6fggbL92uujf0
    GE7jJTTE+n92wgIQ7DYyanK8KrNRnu8DGHaeV36MoZm0jt8y6Bz85OR9YbHbrJng
    QtPhaeUICPV1N5K6WMYAxxSpNE3oUo6rl8UnOx6mHLKZh5D75w5xfMyDu/CQjgHM
    5QIDAQAB
    -----END PUBLIC KEY-----`; // 要上传的文本内容

    createFileAndUpload(content)
      .then((result) => {
        console.log('Text uploaded successfully!', result);
      })
      .catch((error) => {
        console.error('Error uploading text:', error);
      });
  }

  return (
    <div>
      <button
        onClick={handleUploadButtonClick}
        style={{ border: '1px solid red' }}
      >
        google auth
      </button>
      <p>authToken: {authToken}</p>
    </div>
  );
};

export default MPCWalletBackUp;
