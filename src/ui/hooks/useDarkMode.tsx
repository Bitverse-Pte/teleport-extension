import React, { useContext } from 'react';
import { useLocalStorage, useMedia } from 'react-use';

export type DarkModeSetting = 'light' | 'dark' | 'system';
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const DarkmodeContext = React.createContext<
  [DarkModeSetting | undefined, (val: DarkModeSetting) => void]
>([
  'system',
  () => console.error('DarkmodeContext::error: setter is not overrided'),
]);

type DarkmodeCxtProviderProps = {
  children: React.ReactNode;
};

export function DarkmodeCxtProvider({ children }: DarkmodeCxtProviderProps) {
  const [darkmodeSetting, setDarkmode] = useLocalStorage<DarkModeSetting>(
    'darkmode-setting',
    'system'
  );
  return (
    <DarkmodeContext.Provider value={[darkmodeSetting, setDarkmode]}>
      {children}
    </DarkmodeContext.Provider>
  );
}

export function useDarkmode() {
  /** Listening the system's dark mode setting */
  const isDarkInOS = useMedia(COLOR_SCHEME_QUERY);
  /**
   * We keep the setting in the UI's localstorage
   * allowed value are `'light' | 'dark' | 'system'`
   * we go `system` by default
   */
  const [darkmodeSetting, setDarkmode] = useContext(DarkmodeContext);
  /**
   * enable darkmode only when:
   * - the user set to dark manually
   * *OR*
   * - We follow the system's setting, and it's dark right now.
   */
  const isDarkMode =
    darkmodeSetting === 'dark' || (darkmodeSetting === 'system' && isDarkInOS);
  /** temp disable darkmode */
  // const isDarkMode = false;
  return { darkmodeSetting, isDarkMode, setDarkmode };
}
