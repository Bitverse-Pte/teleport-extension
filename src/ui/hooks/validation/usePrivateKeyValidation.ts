import { useState, useEffect } from 'react';
import { isValidHexString } from 'utils/hex';

/**
 * output ERROR message if the input `privateKey` was exist and INVALID.
 * Keep it EMPTY or VALID will return `undefined`, meaning NO ERROR.
 * @param privateKey the privateKey of wallet (current support only for ETH's privateKey)
 * @returns the ERROR message key for i18n, you MUST use it with `t(ERROR_MSG_KEY)`
 */
export function usePrivateKeyValidation(privateKey?: string) {
  const [privateKeyError, setInputSecretError] = useState<string | undefined>(
    undefined
  );

  const validatePrivkeyFormat = (privkey: string) => {
    /**
     * we only use regex to validate is that a valid hexstr
     */
    if (!isValidHexString(privkey)) {
      return setInputSecretError('INPUT_SECRET_ERR_INVALID_HEXSTR');
    }

    /**
     * if all requirement are met, we reset error to `undefined`
     */
    setInputSecretError(undefined);
  };

  useEffect(() => {
    /** reset error status if empty */
    if (!privateKey) return setInputSecretError(undefined);
    /** run validation otherwise */
    validatePrivkeyFormat(privateKey);
  }, [privateKey]);

  return privateKeyError;
}
