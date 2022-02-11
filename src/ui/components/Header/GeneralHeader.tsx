import React from 'react';
import { Button } from 'antd';
import walletLogo from 'assets/walletLogo.svg';
import './style.less';
import { useHistory } from 'react-router';
import { Space } from 'antd';
import { IconComponent } from '../IconComponents';

/**
 *
 * @param onXButtonClick optional, leave it blank to use router's builtin `history.goBack()`, define it if you want different behaviour
 * @returns a Header components
 */
const GeneralHeader = ({
  onXButtonClick,
  hideLogo = false,
  title = '',
}: {
  onXButtonClick?: React.MouseEventHandler;
  hideLogo?: boolean;
  title?: string;
}) => {
  const history = useHistory();
  const defaultAction = () => history.goBack();

  return (
    <div className="flex headerOfMenu justify-end items-center">
      {!hideLogo && <img src={walletLogo} className="header-logo" />}
      <span className={hideLogo ? 'nologo-title' : 'title'}>{title}</span>
      <Button
        type="text"
        className="closeWindowBtn"
        onClick={onXButtonClick || defaultAction}
      >
        <Space>
          <IconComponent name="close" cls="closeIcon base-text-color" />
        </Space>
      </Button>
    </div>
  );
};

export default GeneralHeader;
