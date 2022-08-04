import { createCTCMessage } from 'ui/components/universal/ClickToCloseMessage';
import { useDarkmode } from '../useDarkMode';

export function useStyledMessage() {
  const { isDarkMode } = useDarkmode();

  return (name: 'info' | 'success' | 'error' | 'warning' | 'loading') => {
    return createCTCMessage(name, isDarkMode);
  };
}
