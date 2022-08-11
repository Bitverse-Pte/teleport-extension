import { Button } from 'antd';
import clsx from 'clsx';
import React from 'react';
import { IconComponent } from '../IconComponents';
import './SimpleModal.less';
import { useDarkmode } from 'ui/hooks/useDarkMode';

interface SimpleModalProps {
  title: string | React.ReactNode;
  visible: boolean;
  onClose: () => void;
  children?: string | React.ReactNode;
  className?: string;
  isTitleCentered?: boolean;

  modalCustomStyle?: React.CSSProperties;
}

/**
 * SimpleModal, for display some detail only
 * @returns
 */
export function SimpleModal({
  title,
  children,
  isTitleCentered = true,
  modalCustomStyle = {},
  ...props
}: SimpleModalProps) {
  const { isDarkMode } = useDarkmode();
  if (!props.visible) {
    return null;
  }

  return (
    <div
      className={clsx('simple-modal-mask overlay', props.className, {
        dark: isDarkMode,
      })}
      onClick={props.onClose}
    >
      <div
        className="simple-modal"
        style={modalCustomStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="simple-modal-header flex items-center justify-end w-full">
          <div
            className={clsx('title', {
              'ml-auto': isTitleCentered,
            })}
          >
            {title}
          </div>
          <Button type="text" className="ml-auto" onClick={props.onClose}>
            <IconComponent name="close" cls='icon-close'/>
          </Button>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
