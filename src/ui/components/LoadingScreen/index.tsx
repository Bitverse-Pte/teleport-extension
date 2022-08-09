import { Spin } from 'antd';
import React from 'react';
import './style.less';
import clsx from 'clsx';
import { useDarkmode } from 'ui/hooks/useDarkMode';

// eslint-disable-next-line prettier/prettier
export function LoadingScreen({ loadingMessage: any }) {
  const { isDarkMode } = useDarkmode();

  return (
    <div
      className={clsx('loading-overlay flexCol', {
        dark: isDarkMode,
      })}
    >
      <div className="loading-overlay-container">
        <Spin tip="Loading..." size="large" />
      </div>
    </div>
  );
}
