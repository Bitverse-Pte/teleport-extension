import React, { ReactNode } from 'react';
import cx from 'clsx';
import { Spin, SpinProps as AntdSpinProps } from 'antd';

interface SpinProps {
  children?: ReactNode;
  spinning?: boolean;
  className?: string;
  iconClassName?: string;
  size?: AntdSpinProps['size'];
}

export default ({
  children,
  spinning = true,
  className,
  size = 'default',
  iconClassName,
}: SpinProps) => {
  return (
    <Spin spinning={spinning} wrapperClassName={className} size={size}>
      {children}
    </Spin>
  );
};
