import { useState, useEffect } from 'react';
import { utils } from 'ethers';

/**
 * output ERROR message if the input `seedPhrase` was exist and INVALID.
 * Keep it EMPTY or VALID will return `undefined`, meaning NO ERROR.
 * @param seedPhrase the mnemonic of wallet, it MUST be COMPLY with BIP39. (BTC / ETH / etc.)
 * @returns the ERROR message key for i18n, you MUST use it with `t(ERROR_MSG_KEY)`
 */
export function useSeedPhraseValidation(seedPhrase?: string) {
  const [seedPhraseERROR, setInputSecretERROR] = useState<string | undefined>(
    undefined
  );

  const validateSeedPhraseFormat = (seedPhrase: string) => {
    const trimmedSeedPhrase = seedPhrase.trim();
    // `/\s/u` is regex for space
    const phrases = trimmedSeedPhrase.split(/\s/u);
    if (phrases.length % 3 != 0 || phrases.length < 12 || phrases.length > 24) {
      return setInputSecretERROR('INPUT_SEED_PHRASE_BAD_LENGTH');
    }
    if (!utils.isValidMnemonic(trimmedSeedPhrase)) {
      return setInputSecretERROR('INPUT_SEED_PHRASE_INVALID');
    }

    /**
     * if all requirement are met, we reset ERROR to `undefined`
     */
    setInputSecretERROR(undefined);
  };

  useEffect(() => {
    /** reset ERROR status if empty */
    if (!seedPhrase) return setInputSecretERROR(undefined);
    /** run validation otherwise */
    validateSeedPhraseFormat(seedPhrase);
  }, [seedPhrase]);

  return seedPhraseERROR;
}
