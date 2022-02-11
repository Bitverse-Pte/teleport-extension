import { Button, Space } from 'antd';
import React from 'react';

type IconButtonParameterType = {
  icon: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  size: number;
};

export function IconButton({ icon, size, onClick }: IconButtonParameterType) {
  return (
    <Button
      type="text"
      className="flex justify-center items-center"
      onClick={onClick}
    >
      <img src={icon} width={size} />
    </Button>
  );
}
