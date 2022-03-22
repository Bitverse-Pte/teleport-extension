import React, { useState } from 'react';
import { Drawer } from 'antd';
import { CustomButton, CustomPasswordInput } from 'ui/components/Widgets';
import { IconComponent } from 'ui/components/IconComponents';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import { useWallet, useWalletRequest } from 'ui/utils';
import './style.less';

interface DrawerHeaderProps {
  title: string;
  handleCloseIconClick: () => void;
}

const DrawerHeader = (props: DrawerHeaderProps) => {
  return (
    <div className="drawer-header-container-common flexR">
      <span className="drawer-header-title">{props.title}</span>
      <IconComponent
        name="close"
        onClick={props.handleCloseIconClick}
        cls="drawer-header-close-icon"
      />
    </div>
  );
};

export interface PropsInterface {
  visible: boolean;
  title: string;
  setVisible?: (visible: boolean) => void;
  unlocked?: () => void;
}

export const UnlockModal: React.FC<PropsInterface> = (
  props: PropsInterface
) => {
  const [value, setValue] = useState('');
  const wallet = useWallet();

  const [unlock, loading] = useWalletRequest(wallet.unlock, {
    onSuccess() {
      if (props.setVisible) {
        props.setVisible(false);
      }
      if (props.unlocked && props.unlocked instanceof Function) {
        props.unlocked();
      }
    },
    onError(err) {
      ClickToCloseMessage.error('Wrong password');
    },
  });

  const handleConfirmBtnClick = async () => {
    unlock(value);
  };

  return (
    <Drawer
      visible={props.visible}
      placement="bottom"
      closable={false}
      height="236px"
      bodyStyle={{
        boxSizing: 'border-box',
        padding: '0 24px 24px 24px',
      }}
      contentWrapperStyle={{
        borderRadius: '16px 16px 0 0',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      key="top"
    >
      <div className="backup-popup-container flexCol">
        <DrawerHeader
          title={props.title}
          handleCloseIconClick={() => {
            if (props.setVisible) {
              props.setVisible(false);
            }
          }}
        />
        <span className="popup-item-title">Password</span>
        <CustomPasswordInput
          cls="popup-container-input password-input"
          value={value}
          placeholder="Password"
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={() => handleConfirmBtnClick()}
        />
        <CustomButton
          type="primary"
          loading={loading}
          onClick={handleConfirmBtnClick}
          block
          cls="popup-container-top popup-add-btn"
          disabled={false}
        >
          Unlock
        </CustomButton>
      </div>
    </Drawer>
  );
};