import React from 'react';
import noAssets from 'assets/noAssets.svg';
import noAssetsDark from 'assets/noAssetDark.svg';
import './style.less';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';

export const NoContent = (props: { title: string; ext?: any }) => {
  const { isDarkMode } = useDarkmode();

  return (
    <div className="home-no-assets-container flexCol">
      <img
        src={isDarkMode ? noAssetsDark : noAssets}
        className="home-no-assets"
      />
      <span className="no-assets-title">No {props.title}</span>
      {props.ext ? props.ext : null}
    </div>
  );
};
