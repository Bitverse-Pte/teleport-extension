import React from 'react';
import noAssets from 'assets/noAssets.svg';
import './style.less';

export const NoContent = (props: { title: string; ext?: any }) => {
  return (
    <div className="home-no-assets-container flexCol">
      <img src={noAssets} className="home-no-assets" />
      <span className="no-assets-title">No {props.title}</span>
      {props.ext ? props.ext : null}
    </div>
  );
};
