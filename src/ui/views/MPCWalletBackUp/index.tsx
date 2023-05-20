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
  return (
    <div>
      <button onClick={handleGoogleAuth} style={{ border: '1px solid red' }}>
        google auth
      </button>
      <p>authToken: {authToken}</p>
    </div>
  );
};

export default MPCWalletBackUp;
