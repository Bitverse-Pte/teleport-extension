import { message } from 'antd';
import { ArgsProps } from 'antd/lib/message';
import { nanoid } from 'nanoid';

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
