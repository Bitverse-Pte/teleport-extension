import { message } from 'antd';
import { ArgsProps } from 'antd/lib/message';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import React from 'react';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import { IconComponent } from '../IconComponents';
import './style.less';

function isArgsProps(jc: React.ReactNode | ArgsProps): jc is ArgsProps {
  return typeof jc === 'object' && Boolean((jc as any).content);
}

type MessageParams = Parameters<typeof message['info']>;

export const createCTCMessage =
  (
    name: 'info' | 'success' | 'error' | 'warning' | 'loading',
    isDarkMode?: boolean
  ) =>
  (...params: MessageParams) => {
    let content = params[0] as ArgsProps;
    if (!isArgsProps(params[0])) {
      content = {
        content: params[0],
        duration: params[1],
        onClose: params[2],
        key: nanoid(),
      } as ArgsProps;
    }
    content.className = clsx(content.className, 'ctc-msg', {
      dark: isDarkMode,
    });

    const closeMessage = () => {
      console.debug(
        `ClickToCloseMessage::onClick: closing message #${content.key}`
      );
      message.destroy(content.key);
    };

    content.content = (
      <div className="flex items-center">
        <span className="message">{content.content}</span>
        <div
          className="flex cursor-pointer justify-center items-center ml-auto toast-close-button"
          onClick={closeMessage}
        >
          <IconComponent
            name="close"
            cls="closeIcon base-text-color icon-close"
            style={{ width: 8, height: 8 }}
          />
        </div>
      </div>
    );
    message[name](content);
  };

// export const ClickToCloseMessage = {
//   info: (...params: Parameters<typeof message['info']>) => {
//     return createCTCMessage('info')(...params);
//   },
//   success: (...params: MessageParams) => {
//     return createCTCMessage('success')(...params);
//   },
//   error: (...params: MessageParams) => {
//     return createCTCMessage('error')(...params);
//   },
//   warning: (...params: MessageParams) => {
//     return createCTCMessage('warning')(...params);
//   },
//   loading: (...params: MessageParams) => {
//     return createCTCMessage('loading')(...params);
//   },
// };
