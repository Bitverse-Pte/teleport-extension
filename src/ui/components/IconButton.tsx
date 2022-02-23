import { Button, Space } from 'antd';
import clsx from 'clsx';
import React from 'react';

type IconButtonParameterType = {
  icon: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  size: number;
  className?: string;
};

export function IconButton({
  icon,
  size,
  onClick,
  className,
}: IconButtonParameterType) {
  return (
    <Button
      type="text"
      className={clsx('flex justify-center items-center', className)}
      onClick={onClick}
    >
      <img src={icon} width={size} />
    </Button>
  );
}
