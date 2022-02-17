import './style.less';
import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Header from 'ui/components/Header';
import { message, Drawer, Collapse, Tooltip } from 'antd';
import {
  transferAddress2Display,
  useAsyncEffect,
  useWallet,
  useWalletRequest,
} from 'ui/utils';
import { BaseAccount } from 'types/extend';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Jazzicon from 'react-jazzicon';
import * as _ from 'lodash';
import { IconComponent } from 'ui/components/IconComponents';
import {
  CustomButton,
  CustomInput,
  CustomPasswordInput,
  WalletName,
} from 'ui/components/Widgets';
import { Provider } from 'types/network';
import { IdToChainLogoSVG } from 'ui/utils/networkCategoryToIcon';
import { WalletHeader } from '../WalletManage';
import addImg from 'assets/addImg.svg';
import editImg from 'assets/editImg.svg';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';

interface ICustomChain extends BaseAccount {
  chainList?: {
    chainCustomId: string;
    chainName: string;
  }[];
}

const AccountManage: React.FC = () => {
  const history = useHistory();
  const [accounts, setAccounts] = useState<any>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [addPopupVisible, setAddPopupVisible] = useState(false);
  const [renamePopupVisible, setRenamePopupVisible] = useState(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [currentAccountName, setCurrentAccountName] = useState('');
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const wallet = useWallet();

  const { state } = useLocation<{
    hdWalletId: string;
    hdWalletName: string;
  }>();
  const { hdWalletId, hdWalletName } = state;

  const queryAccounts = async () => {
    const accounts: {
      accountName: string;
      accounts: ICustomChain[];
      hdPathIndex: number;
    }[] = await wallet.getAccountListByHdWalletId(hdWalletId);

    if (accounts && accounts.length > 0) {
      for (const a of accounts) {
        for (const subAccount of a.accounts) {
          const { coinType } = subAccount;
          const chains: Provider[] = await wallet.getSameChainsByCoinType(
            coinType
          );
          if (chains?.length) {
            chains.forEach((p: Provider) => {
              const chainItem = {
                chainCustomId: p.id,
                chainName: p.nickname,
              };
              if (subAccount?.chainList) {
                subAccount.chainList.push(chainItem);
              } else {
                subAccount.chainList = [chainItem];
              }
            });
          }
        }
      }
      setAccounts(accounts);
    } else {
      history.replace('/welcome');
    }
  };

  const [add, addLoading] = useWalletRequest(
    wallet.addNewDisplayAccountByExistKeyring,
    {
      onSuccess: () => {
        setAddPopupVisible(false);
        queryAccounts();
      },
      onError: (e) => {
        ClickToCloseMessage.error('add account failed');
      },
    }
  );

  useAsyncEffect(queryAccounts, []);

  const onRenameConfirm = async (accountName) => {
    if (!accountName) {
      ClickToCloseMessage.error('invalid account name');
      return;
    }
    if (accountName.length > 20) {
      ClickToCloseMessage.error('the length of name should less than 20');
      return;
    }
    const renamed = await wallet
      .renameDisplayAccount(hdWalletId, accountName, currentAccountIndex)
      .catch((e) => {
        ClickToCloseMessage.error('this name is exist already');
      });
    if (renamed) {
      setRenamePopupVisible(false);
      queryAccounts();
    }
  };

  const onDeleteConfirm = async () => {
    await wallet.deleteDisplayAccountByExistKeyringAndIndex(
      hdWalletId,
      currentAccountIndex
    );
    setDeletePopupVisible(false);
    queryAccounts();
  };

  return (
    <div className="account-manage flexCol">
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
          onClick={() => setIsEdit(!isEdit)}
        >
          <div className="wallet-manage-button-wrap flexR">
            <img src={editImg} alt="" className="wallet-manage-img" />
          </div>
          <span className="wallet-manage-button-item-title">Edit</span>
        </div>

        <div
          onClick={() => setAddPopupVisible(true)}
          className="wallet-manage-button-item cursor flexCol _add"
        >
          <div className="wallet-manage-button-wrap flexR">
            <img src={addImg} alt="" className="wallet-manage-img" />
          </div>
          <span className="wallet-manage-button-item-title">Add</span>
        </div>
      </div>
      <div className="content flexCol content-wrap-padding">
        {isEdit
          ? accounts.map((a, i) => (
              <div className="edit-account flexR" key={`edit_${i}`}>
                <div className="edit-left flexR">
                  <Jazzicon
                    diameter={30}
                    seed={Number(a.accounts[0].address.substr(0, 8) || 0)}
                  />
                  <WalletName cls="account" width={100}>
                    {a.accountName}
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
                      if (i === 0) {
                        ClickToCloseMessage.warning(
                          'can not delete the last account'
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
            ))
          : null}
        <Collapse
          expandIconPosition="right"
          bordered={false}
          ghost={true}
          expandIcon={({ isActive }) =>
            isActive ? (
              <IconComponent name="chevron-up" cls="base-text-color" />
            ) : (
              <IconComponent name="chevron-down" cls="base-text-color" />
            )
          }
          style={{
            display: isEdit ? 'none' : 'block',
          }}
        >
          {accounts.map((a, i) => {
            return (
              <Collapse.Panel
                key={i}
                header={
                  <div className="account-item flexR">
                    <Jazzicon
                      diameter={32}
                      seed={Number(a.accounts[0].address.substr(0, 8) || 0)}
                    />
                    <WalletName cls="account-address bold" width={180}>
                      {a.accountName}
                    </WalletName>
                  </div>
                }
              >
                <div className="address-container flexCol">
                  {a.accounts.map((item: ICustomChain) => {
                    return (
                      <div className="address-item" key={item.address}>
                        <div className="address-chain-container flexR">
                          {item?.chainList?.map((c) => (
                            <Tooltip title={c.chainName} key={c.chainCustomId}>
                              <img
                                src={IdToChainLogoSVG(c.chainCustomId)}
                                className="chain-icon"
                              />
                            </Tooltip>
                          ))}
                        </div>
                        <div className="address-chain-address-container flexR">
                          <span className="address-chain-address">
                            {transferAddress2Display(item.address)}
                          </span>
                          <CopyToClipboard
                            text={item.address}
                            onCopy={() => ClickToCloseMessage.success('Copied')}
                          >
                            <IconComponent
                              name="copy"
                              cls="copy-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            />
                          </CopyToClipboard>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </div>
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
    if (props.add && props.add instanceof Function) {
      props.add(value);
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
          cls="popup-container-top popup-add-btn"
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
    if (props.onConfirm && props.onConfirm instanceof Function) {
      props.onConfirm(value);
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
          disabled={_.isEmpty(value)}
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
      ClickToCloseMessage.error('wrong password');
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
          All information in this account will be lost, and the operation can't
          be undo.
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
