import './style.less';
import React, { ReactNode, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IconComponent } from '../IconComponents';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';

interface HeaderProps {
  handleBackClick?: () => void;
  title: string | ReactNode;
  hidden?: boolean;
  component?: any;
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const history = useHistory();
  const { isDarkMode } = useDarkmode();

  const handleBackClick = () => {
    if (props.handleBackClick) {
      props.handleBackClick();
    } else {
      history.go(-1);
    }
  };
  return (
    <div
      className={clsx('header flexR content-wrap-padding', {
        dark: isDarkMode,
      })}
    >
      <IconComponent
        name="back"
        cls="icon back-icon"
        style={{ display: props.hidden ? 'none' : 'block' }}
        onClick={handleBackClick}
      />
      {typeof props.title === 'string' ? (
        <span className="title capitalize bold">{props.title}</span>
      ) : (
        props.title
      )}
      {props.component ? <div className="right">{props.component}</div> : null}
    </div>
  );
};

export const HeaderWithFlex: React.FC<HeaderProps> = (props: HeaderProps) => {
  const history = useHistory();
  const { isDarkMode } = useDarkmode();

  const handleBackClick = () => {
    if (props.handleBackClick) {
      props.handleBackClick();
    } else {
      history.go(-1);
    }
  };

  return (
    <div className={clsx('header-flex', { dark: isDarkMode })}>
      <IconComponent
        name="back"
        cls="icon back-icon"
        style={{ display: props.hidden ? 'none' : 'block' }}
        onClick={handleBackClick}
      />
      <div className="content">
        {typeof props.title === 'string' ? (
          <span className="title capitalize bold">{props.title}</span>
        ) : (
          props.title
        )}
      </div>
      <div className="placeholder-block">{props.component}</div>
    </div>
  );
};

export default Header;
