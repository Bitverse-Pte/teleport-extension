import React from 'react';
import { Button } from 'antd';
import walletLogo from 'assets/walletLogo.png';
import './style.less';
import { useHistory } from 'react-router';
import { Space } from 'antd';
import { IconComponent } from '../IconComponents';
import clsx from 'clsx';
import { useDarkmode } from 'ui/hooks/useDarkMode';

/**
 *
 * @param onXButtonClick optional, leave it blank to use router's builtin `history.goBack()`, define it if you want different behaviour
 * @returns a Header components
 */
const GeneralHeader = ({
  onXButtonClick,
  hideLogo = false,
  title = '',
  extCls,
}: {
  onXButtonClick?: React.MouseEventHandler;
  hideLogo?: boolean;
  title?: React.ReactNode;
  extCls?: string;
}) => {
  const { isDarkMode } = useDarkmode();
  const history = useHistory();
  const defaultAction = () => history.goBack();

  return (
    <div
      className={clsx('flex headerOfMenu justify-end items-center', extCls, {
        dark: isDarkMode,
      })}
    >
      {!hideLogo && <img src={walletLogo} className="header-logo" />}
      {typeof title === 'string' ? (
        <span className={hideLogo ? 'nologo-title' : 'title'}>{title}</span>
      ) : (
        title
      )}
      <Button
        type="text"
        className="closeWindowBtn"
        onClick={onXButtonClick || defaultAction}
      >
        {/* <Space> */}
        <IconComponent
          name="close"
          cls="closeIcon base-text-color icon-close"
        />
        {/* </Space> */}
      </Button>
    </div>
  );
};

export default GeneralHeader;
