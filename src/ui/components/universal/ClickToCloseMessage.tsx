import { message } from 'antd';
import { ArgsProps } from 'antd/lib/message';
import { nanoid } from 'nanoid';
import React from 'react';
import { IconComponent } from '../IconComponents';
import './style.less';

function isArgsProps(jc: React.ReactNode | ArgsProps): jc is ArgsProps {
  return typeof jc === 'object' && Boolean((jc as any).content);
}

type MessageParams = Parameters<typeof message['info']>;

const createCTCMessage =
  (name: 'info' | 'success' | 'error' | 'warning' | 'loading') =>
  (...params: MessageParams) => {
    let content = params[0] as ArgsProps;
    if (!isArgsProps(params[0])) {
      content = {
        content: params[0],
        duration: params[1],
        onClose: params[2],
      } as ArgsProps;
    }

    let msgKey: string | number;
    if (!content.key) {
      /**
       * Generate a key for onClick to close
       */
      msgKey = nanoid();
      content.key = msgKey;
    } else {
      msgKey = content.key;
    }
    const _poorOldOnClick = content.onClick;
    content.onClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (_poorOldOnClick) {
        /**
         * continute if onClick existed
         */
        _poorOldOnClick(e);
      }

      message.destroy(msgKey);
    };
    content.content = (
      <div className="flex items-center">
        <span className="message">{content.content}</span>
        <div
          style={{
            borderRadius: '100%',
            background: '#E1E8F0',
            width: 16,
            height: 16,
          }}
          className="flex cursor-pointer justify-center items-center ml-auto closeButton"
        >
          <IconComponent
            name="close"
            cls="closeIcon base-text-color"
            style={{ width: 8, height: 8 }}
          />
        </div>
      </div>
    );
    params[0] = content;
    message[name](...params);
  };

export const ClickToCloseMessage = {
  info: (...params: Parameters<typeof message['info']>) => {
    return createCTCMessage('info')(...params);
  },
  success: (...params: MessageParams) => {
    return createCTCMessage('success')(...params);
  },
  error: (...params: MessageParams) => {
    return createCTCMessage('error')(...params);
  },
  warning: (...params: MessageParams) => {
    return createCTCMessage('warning')(...params);
  },
  loading: (...params: MessageParams) => {
    return createCTCMessage('loading')(...params);
  },
};
