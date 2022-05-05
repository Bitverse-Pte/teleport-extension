import React from 'react';
import DefaulutIcon from 'assets/tokens/default.svg';

export const ChainCategoryIcon = ({ src = DefaulutIcon }: { src?: string }) => (
  <img
    style={{
      width: '24px',
      height: '24px',
      borderRadius: '100%',
      // padding: '4px',
      marginRight: '12px',
    }}
    src={src}
  />
);
