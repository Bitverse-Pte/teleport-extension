import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Tooltip } from 'antd';
import { IconComponent } from '../IconComponents';
import eth from 'assets/tokens/eth.svg';
import passwordChecked from 'assets/passwordChecked.svg';
import passwordUnchecked from 'assets/passwordUnchecked.svg';
import { Token } from 'types/token';
import classnames from 'classnames';

import './style.less';
import { utils } from 'ethers';
import { Tabs, TipButtonEnum } from 'constants/wallet';
import SendImg from '../../../assets/send.svg';
import ReceiveImg from '../../../assets/receive.svg';
import LockImg from '../../../assets/lock.svg';
import WalletManageImg from '../../../assets/walletManage.svg';
import { PresetNetworkId } from 'constants/defaultNetwork';

export interface SearchInputProps {
  onChange: (value) => void;
}

export const SearchInput = (props) => {
  return (
    <div className="custom-input-container">
      <IconComponent name="search" cls="search-icon" />
      <input {...props} className={'custom-search-input'} />
    </div>
  );
};

export interface TokenIconProps {
  token:
    | Pick<
        Token,
        'symbol' | 'decimal' | 'contractAddress' | 'isNative' | 'chainCustomId'
      >
    | undefined;
  radius?: number;
  scale?: number;
}

function _getDefaultIcon(
  token: Partial<Token>,
  radius?: number,
  scale?: number
) {
  const [loadError, setLoadError] = useState(false);
  const style: Record<string, any> = {};
  if (radius) {
    style.width = `${radius}px`;
    style.height = `${radius}px`;
    style.lineHeight = `${radius}px`;
    style.borderRadius = `${radius}px`;
  }
  if (scale) {
    style.transform = `scale(${scale})`;
  }
  const defaultIcon = (
    <span className="token-icon token-icon-default" style={style}>
      {token?.symbol?.substr(0, 1)?.toUpperCase()}
    </span>
  );
  if (!token.isNative && !token.contractAddress) return defaultIcon;
  let contractAddress = '';
  try {
    contractAddress = (token as any).contractAddress
      ? utils.getAddress((token as any).contractAddress)
      : '';
  } catch {
    setLoadError(true);
  }
  /* const contractAddress = (token as any).contractAddress
    ? utils.getAddress((token as any).contractAddress)
    : ''; */

  const src = useMemo(() => {
    let _src: string | undefined;
    if (token.icon) {
      _src = token.icon;
    } else {
      switch (token.chainCustomId) {
        case PresetNetworkId.ETHEREUM:
          if (token.isNative) {
            _src =
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
          } else {
            _src = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${contractAddress}/logo.png`;
          }
          break;
        case PresetNetworkId.BSC:
          if (token.isNative) {
            _src =
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png';
          } else {
            _src = token.icon;
          }
          break;
        case PresetNetworkId.POLYGON:
          if (token.isNative) {
            _src =
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png';
          } else {
            _src = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/${contractAddress}/logo.png`;
          }
          break;
        case PresetNetworkId.ARBITRUM:
          if (token.isNative) {
            _src =
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png';
          } else {
            _src = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/${contractAddress}/logo.png`;
          }
          break;
        case PresetNetworkId.FTM:
          if (token.isNative) {
            _src =
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png';
          } else {
            _src = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/assets/${contractAddress}/logo.png`;
          }
          break;
        case PresetNetworkId.AVAX:
          if (token.isNative) {
            _src =
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png';
          } else {
            _src = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/assets/${contractAddress}/logo.png`;
          }
          break;
        case PresetNetworkId.OP:
          if (token.isNative) {
            _src =
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png';
          } else {
            _src = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/assets/${contractAddress}/logo.png`;
          }
          break;
      }
    }
    return _src;
  }, [token]);

  return loadError || !src ? (
    defaultIcon
  ) : (
    <img
      className="token-icon"
      src={src}
      style={style}
      onError={(e) => {
        setLoadError(true);
      }}
    />
  );
}

// the default radius is 30, by setting the radius may cause layout incorrect,
// if you want to use a different size, pls use the scale property to set transform style
// calc scale newSize = scale*30
export const TokenIcon = (props: TokenIconProps) => {
  const { token, radius, scale } = props;
  if (!token) return null;
  return _getDefaultIcon(token, radius, scale);
};

type DeletedProps = 'className';
interface CustomElementProps extends Omit<any, DeletedProps> {
  cls?: string;
}
export const CustomButton = ({ cls, ...props }: CustomElementProps) => {
  return <Button {...props} className={`custom-button ${cls ? cls : ''}`} />;
};

interface CustomInputProps extends CustomElementProps {
  onFocus?: (...props) => void;
  onBlur?: (...props) => void;
}

export const CustomInput = ({
  cls,
  onFocus,
  onBlur,
  ...props
}: CustomInputProps) => {
  const [active, setActive] = useState(false);
  return (
    <Input
      {...props}
      onFocus={() => {
        if (onFocus) onFocus();
        setActive(true);
      }}
      onBlur={() => {
        if (onBlur) onBlur();
        setActive(false);
      }}
      className={classnames(`custom-input ${cls ? cls : ''}`, {
        'custom-input-active': active,
      })}
    />
  );
};

export const CustomPasswordInput = ({
  cls,
  onFocus,
  onBlur,
  ...props
}: CustomElementProps) => {
  const [active, setActive] = useState(false);

  return (
    <Input.Password
      iconRender={(visible) =>
        visible ? (
          <IconComponent name="eye" cls="base-text-color" />
        ) : (
          <IconComponent name="eye-off" cls="base-text-color" />
        )
      }
      {...props}
      onFocus={(e) => {
        if (onFocus) onFocus(e);
        setActive(true);
      }}
      onBlur={(e) => {
        if (onBlur) onBlur(e);
        setActive(false);
      }}
      className={classnames(`custom-input ${cls ? cls : ''}`, {
        'custom-input-active': active,
      })}
    />
  );
};

interface PasswordCheckPassedProps {
  value: string;
  setPassed: (pass: boolean) => void;
}

export const PasswordCheckPassed: React.FC<PasswordCheckPassedProps> = (
  props: PasswordCheckPassedProps
) => {
  const [lengthPass, setLengthPass] = useState(false);
  const [uppercasePass, setUppercasePass] = useState(false);
  const [numberPass, setNumberPass] = useState(false);
  const [symbolPass, setSymbolPass] = useState(false);

  const checkSymbol = (str) => {
    const en = /[`!@#$%^&*()_+<>?:"{},./;'[\]]/im,
      cn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
    return en.test(str) || cn.test(str);
  };

  const checkUppercase = (str) => {
    const uppercase = /^(?=.*?[A-Z]).*$/;
    return uppercase.test(str);
  };
  const checkNumber = (str) => {
    const uppercase = /^(?=.*?\d).*$/;
    return uppercase.test(str);
  };
  const checkLength = (str) => {
    return str?.length >= 8 && str?.length <= 30;
  };

  useMemo(() => {
    setLengthPass(checkLength(props.value));
    setUppercasePass(checkUppercase(props.value));
    setNumberPass(checkNumber(props.value));
    setSymbolPass(checkSymbol(props.value));
  }, [props.value]);

  useMemo(() => {
    setLengthPass(checkLength(props.value));
    setUppercasePass(checkUppercase(props.value));
    setNumberPass(checkNumber(props.value));
    setSymbolPass(checkSymbol(props.value));
  }, [props.value]);

  useEffect(() => {
    props.setPassed(lengthPass && uppercasePass && numberPass && symbolPass);
  }, [lengthPass, uppercasePass, numberPass, symbolPass]);

  return (
    <>
      <div className="password-check-pass-container">
        <div className="password-check-pass-top flexR">
          <div className="password-check-pass-item flexR">
            <img
              src={passwordChecked}
              style={{ display: lengthPass ? 'block' : 'none' }}
              className="password-check-pass-icon"
            />
            <img
              src={passwordUnchecked}
              style={{ display: lengthPass ? 'none' : 'block' }}
              className="password-check-pass-icon"
            />
            <p
              className={classnames('password-check-pass-title', {
                'password-check-pass-title-active': lengthPass,
              })}
            >
              8-30 characters
            </p>
          </div>
          <div className="password-check-pass-item flexR">
            <img
              src={passwordChecked}
              style={{ display: uppercasePass ? 'block' : 'none' }}
              className="password-check-pass-icon"
            />
            <img
              src={passwordUnchecked}
              style={{ display: uppercasePass ? 'none' : 'block' }}
              className="password-check-pass-icon"
            />
            <p
              className={classnames('password-check-pass-title', {
                'password-check-pass-title-active': uppercasePass,
              })}
            >
              1 uppercase
            </p>
          </div>
        </div>
        <div className="password-check-pass-top flexR">
          <div className="password-check-pass-item flexR">
            <img
              src={passwordChecked}
              style={{ display: numberPass ? 'block' : 'none' }}
              className="password-check-pass-icon"
            />
            <img
              src={passwordUnchecked}
              style={{ display: numberPass ? 'none' : 'block' }}
              className="password-check-pass-icon"
            />
            <p
              className={classnames('password-check-pass-title', {
                'password-check-pass-title-active': numberPass,
              })}
            >
              1 number
            </p>
          </div>
          <div className="password-check-pass-item flexR">
            <img
              src={passwordChecked}
              style={{ display: symbolPass ? 'block' : 'none' }}
              className="password-check-pass-icon"
            />
            <img
              src={passwordUnchecked}
              style={{ display: symbolPass ? 'none' : 'block' }}
              className="password-check-pass-icon"
            />
            <p
              className={classnames('password-check-pass-title', {
                'password-check-pass-title-active': symbolPass,
              })}
            >
              1 symbol
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export const WalletName = ({ children, cls, width, ...rest }) => {
  return (
    <span
      {...rest}
      style={{ maxWidth: `${width}px` }}
      className={`widgets-wallet-name-container ${cls}`}
    >
      {children}
    </span>
  );
};

export interface TabInterface {
  tab1: string;
  tab2: string;
  handleTabClick: (Tabs) => void;
  currentTab: Tabs;
  showToolTips?: boolean;
  tip1?: string;
  tip2?: string;
}

export const CustomTab = (props: TabInterface) => {
  const [tooltip, setTooltip] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="widgets-tab-container flexR">
      <span
        className={classnames('tab-item', 'cursor', {
          'tab-item-active': props.currentTab === Tabs.FIRST,
        })}
        onClick={() => {
          props.handleTabClick(Tabs.FIRST);
        }}
        onMouseOver={() => {
          if (props.showToolTips && props.tip1) {
            setTooltip(props.tip1);
            setShowTooltip(true);
          }
        }}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {props.tab1}
      </span>
      <span
        className={classnames('tab-item', 'cursor', {
          'tab-item-active': props.currentTab === Tabs.SECOND,
        })}
        onClick={() => {
          props.handleTabClick(Tabs.SECOND);
        }}
        onMouseOver={() => {
          if (props.showToolTips && props.tip2) {
            setTooltip(props.tip2);
            setShowTooltip(true);
          }
        }}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {props.tab2}
      </span>
      <span
        className="custom-tab-tooltip"
        style={props.showToolTips && showTooltip ? {} : { display: 'none' }}
      >
        {tooltip}
      </span>
    </div>
  );
};

export interface TipButtonProps {
  title: string;
  type: TipButtonEnum;
  handleClick: () => void;
}

export const TipButton = (props: TipButtonProps) => {
  const getTipImg = (type: TipButtonEnum) => {
    switch (type) {
      case TipButtonEnum.SEND:
        return SendImg;
      case TipButtonEnum.RECEIVE:
        return ReceiveImg;
      case TipButtonEnum.WALLET_MANAGE:
        return WalletManageImg;
      case TipButtonEnum.LOCK:
        return LockImg;
    }
  };
  return (
    <div
      className="tip-button-button-item flexCol cursor"
      onClick={() => props.handleClick()}
    >
      <div className="tip-button-send-img flex">
        <img src={getTipImg(props.type)} className="tip-button-send-img-item" />
      </div>
      <span className="tip-button-send-title">{props.title}</span>
    </div>
  );
};

export const BetaIcon = () => {
  return (
    <span
      className="beta-icon"
    >
      Beta
    </span>
  );
};
