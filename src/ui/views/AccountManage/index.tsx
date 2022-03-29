import './style.less';
import React, { useMemo, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from 'ui/components/Header';
import { Drawer } from 'antd';
import { useAsyncEffect, useWallet, useWalletRequest } from 'ui/utils';
import { AccountCreateType, BaseAccount } from 'types/extend';
import Jazzicon from 'react-jazzicon';
import * as _ from 'lodash';
import { IconComponent } from 'ui/components/IconComponents';
import {
  CustomButton,
  CustomInput,
  CustomPasswordInput,
  WalletName,
} from 'ui/components/Widgets';
import { WalletHeader } from '../WalletManage';
import addImg from 'assets/addImg.svg';
import editImg from 'assets/editImg.svg';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import AccountManageWidget from 'ui/components/AccountManageWidget';
import { ErrorCode } from 'constants/code';
import { UnlockModal } from 'ui/components/UnlockModal';
import skynet from 'utils/skynet';
const { sensors } = skynet;

const AccountManage: React.FC = () => {
  const [accounts, setAccounts] = useState<any>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [addPopupVisible, setAddPopupVisible] = useState(false);
  const [renamePopupVisible, setRenamePopupVisible] = useState(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [currentAccountName, setCurrentAccountName] = useState('');
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const wallet = useWallet();
  const accountManageWidgetRef = useRef();
  const [unlockPopupVisible, setUnlockPopupVisible] = useState(false);
  const [isAdd, setIsAdd] = useState(false);

  const { state, pathname } = useLocation<{
    hdWalletId: string;
    hdWalletName: string;
    accountCreateType: AccountCreateType;
  }>();
  const { hdWalletId, hdWalletName, accountCreateType } = state;

  const queryAccounts = async () => {
    const accountList: BaseAccount[] = await wallet.getAccountListByHdWalletId(
      hdWalletId
    );

    if (accountList && accountList.length > 0) {
      const tempAccounts: BaseAccount[] = [];
      accountList.forEach((a: BaseAccount) => {
        if (tempAccounts.every((t) => t.hdPathIndex !== a.hdPathIndex)) {
          tempAccounts.push(a);
        }
      });
      setAccounts(accountList);
    }
  };

  const [add, addLoading] = useWalletRequest(
    wallet.addNewDisplayAccountByExistKeyring,
    {
      onSuccess: () => {
        setAddPopupVisible(false);
        queryAccounts();
        (accountManageWidgetRef.current as any).queryAccounts();
        sensors.track('teleport_account_manage_add_confirm', {
          page: pathname,
        });
      },
      onError: (e) => {
        console.error(e.code);
        if (e?.code === ErrorCode.WALLET_NAME_REPEAT) {
          ClickToCloseMessage.error('Name already exists');
        } else {
          ClickToCloseMessage.error('Unknown error, please try again later');
        }
      },
    }
  );

  useAsyncEffect(queryAccounts, []);

  const onRenameConfirm = async (accountName) => {
    sensors.track('teleport_account_manage_rename_confirm', { page: pathname });
    if (accountName.length > 20) {
      ClickToCloseMessage.error('Name length should be 1-20 chars');
      return;
    }
    const renamed = await wallet
      .renameDisplayAccount(hdWalletId, accountName, currentAccountIndex)
      .catch((e) => {
        ClickToCloseMessage.error('Name already exist');
      });
    if (renamed) {
      setRenamePopupVisible(false);
      queryAccounts();
    }
  };

  const onDeleteConfirm = async () => {
    sensors.track('teleport_account_manage_delete_confirm', { page: pathname });
    await wallet.deleteDisplayAccountByExistKeyringAndIndex(
      hdWalletId,
      currentAccountIndex
    );
    setDeletePopupVisible(false);
    queryAccounts();
  };
  const handleUnlock = () => {
    if (isAdd) {
      setAddPopupVisible(true);
    } else {
      setIsEdit(!isEdit);
    }
  };

  const handleEdit = async () => {
    sensors.track('teleport_account_manage_edit', { page: pathname });
    setIsAdd(false);
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    setIsEdit(!isEdit);
  };

  const handleAdd = async () => {
    sensors.track('teleport_account_manage_add', { page: pathname });
    setIsAdd(true);
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    setAddPopupVisible(true);
  };

  return (
    <div className="account-manage flexCol">
      <UnlockModal
        title="Unlock Wallet"
        visible={unlockPopupVisible}
        setVisible={(visible: boolean) => {
          setUnlockPopupVisible(visible);
        }}
        unlocked={() => handleUnlock()}
      />
      {isEdit ? (
        <WalletHeader
          title="Accounts"
          handleDoneClick={() => setIsEdit(!isEdit)}
        />
      ) : (
        <Header
          title={
            <WalletName cls="bold" width={160}>
              {`wallet: ${hdWalletName}`}
            </WalletName>
          }
        />
      )}

      <div
        className="wallet-manage-button-container flexR content-wrap-padding"
        style={isEdit ? { display: 'none' } : {}}
      >
        <div
          className="wallet-manage-button-item cursor flexCol _edit"
          onClick={() => handleEdit()}
        >
          <div className="wallet-manage-button-wrap flexR">
            <img src={editImg} alt="" className="wallet-manage-img" />
          </div>
          <span className="wallet-manage-button-item-title">Edit</span>
        </div>

        <div
          onClick={() => handleAdd()}
          style={
            accountCreateType === AccountCreateType.PRIVATE_KEY
              ? { display: 'none' }
              : {}
          }
          className="wallet-manage-button-item cursor flexCol _add"
        >
          <div className="wallet-manage-button-wrap flexR">
            <img src={addImg} alt="" className="wallet-manage-img" />
          </div>
          <span className="wallet-manage-button-item-title">Add</span>
        </div>
      </div>

      {isEdit ? (
        <div className="content flexCol content-wrap-padding">
          {accounts.map((a, i) => (
            <div className="edit-account flexR" key={`edit_${i}`}>
              <div className="edit-left flexR">
                <Jazzicon
                  diameter={30}
                  seed={Number(a.address.substr(0, 8) || 0)}
                />
                <WalletName cls="account" width={100}>
                  {a.accountName || a.hdWalletName}
                </WalletName>
              </div>
              <div className="edit-right flexR">
                <IconComponent
                  name="edit"
                  cls="base-text-color"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentAccountName(a.accountName);
                    setCurrentAccountIndex(a.hdPathIndex);
                    setRenamePopupVisible(true);
                  }}
                />
                <IconComponent
                  name="trash"
                  cls="base-text-color right"
                  onClick={(e) => {
                    if (accounts?.length === 1) {
                      ClickToCloseMessage.warning(
                        'Please keep alive at least one account'
                      );
                      return;
                    }
                    e.stopPropagation();
                    setCurrentAccountName(a.accountName);
                    setCurrentAccountIndex(a.hdPathIndex);
                    setDeletePopupVisible(true);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AccountManageWidget
          hdWalletId={state.hdWalletId}
          ref={accountManageWidgetRef}
        />
      )}
      <Add
        title="Add Account"
        visible={addPopupVisible}
        setVisible={(visible: boolean) => {
          setAddPopupVisible(visible);
        }}
        loading={addLoading}
        add={(name) => add(hdWalletId, name)}
      />

      <Rename
        title="Rename Account"
        visible={renamePopupVisible}
        defaultValue={currentAccountName}
        setVisible={(visible: boolean) => {
          setRenamePopupVisible(visible);
        }}
        onConfirm={onRenameConfirm}
      />

      <Delete
        title="Delete Account"
        visible={deletePopupVisible}
        setVisible={(visible: boolean) => {
          setDeletePopupVisible(visible);
        }}
        onConfirm={onDeleteConfirm}
      />
    </div>
  );
};

export default AccountManage;

export interface IAddProps {
  visible: boolean;
  title: string;
  loading: boolean;
  setVisible?: (visible: boolean) => void;
  add?: (name: string) => void;
}

export const Add: React.FC<IAddProps> = (props: IAddProps) => {
  const [value, setValue] = useState('');

  const handleConfirmBtnClick = () => {
    if (value.trim().length > 20) {
      ClickToCloseMessage.error('Name length should be 1-20 chars');
      return;
    }
    if (props.add && props.add instanceof Function) {
      props.add(value.trim());
      setValue('');
    }
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
        <span className="popup-item-title">Account name</span>
        <CustomInput
          value={value}
          cls="popup-container-input"
          placeholder="Enter Account Name"
          onChange={(e) => setValue(e.target.value)}
        />
        <CustomButton
          type="primary"
          loading={props.loading}
          onClick={handleConfirmBtnClick}
          block
          cls="popup-container-top theme"
          disabled={_.isEmpty(value)}
        >
          Add
        </CustomButton>
      </div>
    </Drawer>
  );
};
export interface IRenameProps {
  visible: boolean;
  defaultValue: string;
  title: string;
  setVisible?: (visible: boolean) => void;
  onConfirm?: (name: string) => void;
}

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

export const Rename: React.FC<IRenameProps> = (props: IRenameProps) => {
  const [value, setValue] = useState(props.defaultValue);

  const resetState = () => {
    setValue(props.defaultValue);
  };

  useMemo(() => {
    if (props.visible) {
      resetState();
    }
  }, [props.visible]);

  const handleConfirmBtnClick = () => {
    if (
      value.trim() === props.defaultValue &&
      props.setVisible &&
      props.setVisible instanceof Function
    ) {
      props.setVisible(false);
      return;
    }
    if (value.trim().length > 20) {
      ClickToCloseMessage.error('Name length should be 1-20 chars');
      return;
    }
    if (props.onConfirm && props.onConfirm instanceof Function) {
      props.onConfirm(value.trim());
    }
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
        <span className="popup-item-title">New account name</span>
        <CustomInput
          value={value}
          cls="popup-container-input"
          onChange={(e) => setValue(e.target.value)}
        />
        <CustomButton
          type="primary"
          onClick={handleConfirmBtnClick}
          block
          cls="popup-container-top"
          disabled={_.isEmpty(value.trim())}
        >
          Rename
        </CustomButton>
      </div>
    </Drawer>
  );
};
export interface IDeleteProps {
  visible: boolean;
  title: string;
  setVisible?: (visible: boolean) => void;
  onConfirm?: () => void;
}

export const Delete: React.FC<IDeleteProps> = (props: IDeleteProps) => {
  const [psd, setPsd] = useState('');
  const wallet = useWallet();

  const resetState = () => {
    setPsd('');
  };

  useMemo(() => {
    if (!props.visible) {
      resetState();
    }
  }, [props.visible]);

  const handleConfirmBtnClick = async () => {
    const checksumPassed = await wallet.verifyPassword(psd).catch((e) => {
      ClickToCloseMessage.error('Wrong password');
    });
    if (checksumPassed) {
      if (props.onConfirm && props.onConfirm instanceof Function) {
        props.onConfirm();
      }
    }
  };

  return (
    <Drawer
      visible={props.visible}
      placement="bottom"
      closable={false}
      height="284px"
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
        <div className="popup-delete-notice">
          Make sure you’ve backed up this wallet,all accounts belonging to this
          wallet will be deleted,and the operation can’t reverse.
        </div>
        <span className="popup-item-title">Input password to delete</span>
        <CustomPasswordInput
          cls="popup-container-input"
          value={psd}
          placeholder="Enter your password"
          onChange={(e) => {
            setPsd(e.target.value);
          }}
        />
        <CustomButton
          type="primary"
          cls="popup-container-top popup-delete-btn"
          onClick={handleConfirmBtnClick}
          block
          disabled={_.isEmpty(psd)}
        >
          Delete
        </CustomButton>
      </div>
    </Drawer>
  );
};
