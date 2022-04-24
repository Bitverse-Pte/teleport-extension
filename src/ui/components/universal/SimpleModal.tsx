import { Button } from 'antd';
import clsx from 'clsx';
import React from 'react';
import { IconComponent } from '../IconComponents';
import './SimpleModal.less';

interface SimpleModalProps {
  title: string | React.ReactNode;
  visible: boolean;
  onClose: () => void;
  children?: string | React.ReactNode;
  className?: string;
  isTitleCentered?: boolean;
}

/**
 * SimpleModal, for display some detail only
 * @returns
 */
export function SimpleModal({
  title,
  children,
  isTitleCentered = true,
  ...props
}: SimpleModalProps) {
  if (!props.visible) {
    return null;
  }

  return (
    <div
      className={clsx('simple-modal-mask overlay', props.className)}
      onClick={props.onClose}
    >
      <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
        <div className="simple-modal-header flex items-center justify-end w-full">
          <div
            className={clsx('title', {
              'ml-auto': isTitleCentered,
            })}
          >
            {title}
          </div>
          <Button type="text" className="ml-auto" onClick={props.onClose}>
            <IconComponent name="close" />
          </Button>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
