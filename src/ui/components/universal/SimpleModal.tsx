import { Button } from 'antd';
import React from 'react';
import { IconComponent } from '../IconComponents';
import './SimpleModal.less';

interface SimpleModalProps {
  title: string | React.ReactNode;
  visible: boolean;
  onClose: () => void;
  children?: string | React.ReactNode;
}

/**
 * SimpleModal, for display some detail only
 * @returns
 */
export function SimpleModal({ title, children, ...props }: SimpleModalProps) {
  if (!props.visible) {
    return null;
  }

  return (
    <div className="simple-modal-mask overlay" onClick={props.onClose}>
      <div className="simple-modal" onClick={(e) => e.stopPropagation()}>
        <div className="simple-modal-header flex items-center justify-end w-full">
          <div className="title">{title}</div>
          <Button type="text" className="closeButton" onClick={props.onClose}>
            <IconComponent name="close" />
          </Button>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
