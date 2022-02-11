import React, { SVGProps } from 'react';
import './style.less';

/**
 * use `cls` instead
 */
type DeletedProps = 'className';
interface IconComponentProps
  extends Omit<SVGProps<SVGSVGElement>, DeletedProps> {
  cls?: string;
  name: string;
}

export const IconComponent = ({ cls, name, ...props }: IconComponentProps) => {
  return (
    <svg
      className={`cursor icon svg-icon ${cls ? cls : ''}`}
      aria-hidden="true"
      {...props}
    >
      <use xlinkHref={`#icon-${name}`}></use>
    </svg>
  );
};
