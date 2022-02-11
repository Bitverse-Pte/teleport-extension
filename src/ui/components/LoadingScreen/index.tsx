import { Spin } from 'antd';
import React from 'react';
import './style.less';

// eslint-disable-next-line prettier/prettier
export function LoadingScreen({loadingMessage: any}) {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-container">
        <Spin tip="Loading..." size="large" />
      </div>
    </div>
  );
}
