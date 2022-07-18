import { Button } from 'antd';
import clsx from 'clsx';
import React from 'react';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import './style.less';

export function DarkModeTest() {
  const { isDarkMode, setDarkmode } = useDarkmode();
  return (
    <div
      className={clsx('darkmode-test', {
        dark: isDarkMode,
      })}
    >
      <Button onClick={() => setDarkmode('light')}>Light Mode</Button>
      <Button onClick={() => setDarkmode('dark')}>Dark Mode</Button>
      <Button onClick={() => setDarkmode('system')}>follow the system</Button>
    </div>
  );
}
