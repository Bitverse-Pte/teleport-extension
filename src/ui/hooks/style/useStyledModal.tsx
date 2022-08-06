import { Modal, ModalFuncProps } from 'antd';
import clsx from 'clsx';
import { useDarkmode } from '../useDarkMode';

export function useStyledModal() {
  const { isDarkMode } = useDarkmode();

  return (method: 'confirm' | 'success' | 'info' | 'warn' | 'error') =>
    ({ className, ...props }: ModalFuncProps) =>
      Modal[method]({
        ...props,
        className: clsx(className, { dark: isDarkMode }),
      });
}
