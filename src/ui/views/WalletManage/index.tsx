import './style.less';
import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Header from 'ui/components/Header';
import { message } from 'antd';
import clsx from 'clsx';
import { transferAddress2Display, useAsyncEffect, useWallet } from 'ui/utils';
import { BaseAccount, DisplayWalletManage } from 'types/extend';
import { Tabs, WALLET_THEME_COLOR } from 'constants/wallet';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Backup from 'ui/components/Backup';
import { CustomButton, CustomTab, WalletName } from 'ui/components/Widgets';
import { IconComponent } from 'ui/components/IconComponents';
import ChainIcons from 'ui/components/ChainIcons';
import noAssets from 'assets/noAssets.svg';
import { Delete, Rename } from '../AccountManage';
import { ErrorCode } from 'constants/code';
import reversEnter from 'assets/reverseEnter.svg';
import addImg from 'assets/addImg.svg';
import editImg from 'assets/editImg.svg';
import importImg from 'assets/importImg.svg';

export interface WalletHeaderProps {
  title: string;
  handleDoneClick: () => void;
}

export const WalletHeader = (props: WalletHeaderProps) => {
  return (
    <div className="wallet-header-container flexR content-wrap-padding">
      <span className="wallet-header-title">Edit {props.title}</span>
      <span
        className="wallet-header-done cursor"
        onClick={props.handleDoneClick}
      >
        Done
      </span>
    </div>
  );
};

const WalletManage: React.FC = () => {
  const history = useHistory();
  const wallet = useWallet();
  const [hdWalletAccounts, setHdWalletAccount] = useState<any>([]);
  const [simpleWalletAccounts, setSimpleWalletAccount] = useState<
    BaseAccount[]
  >([]);
  const [accountType, setAccountType] = useState(Tabs.FIRST);
  const [backupHdWalletId, setBackupWalletId] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [currentHdWalletId, setCurrentHdWalletId] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [renamePopupVisible, setRenamePopupVisible] = useState(false);
  const [currentWalletName, setCurrentWalletName] = useState('');

  const queryWallets = async () => {
    const accounts: DisplayWalletManage = await wallet.getAccountList(true);
    console.log('accounts', accounts);
    if (accounts && accounts.hdAccount) {
      setHdWalletAccount(accounts.hdAccount);
    }

    if (accounts && accounts.simpleAccount) {
      setSimpleWalletAccount(accounts.simpleAccount);
    }
  };

  useAsyncEffect(queryWallets, []);

  const isHd = useMemo(() => {
    return accountType === Tabs.FIRST;
  }, [accountType]);

  const handleCreateBtnClick = () => {
    history.push('/create');
  };
  const handleImportBtnClick = () => {
    history.push('/recover');
  };

  const onDeleteConfirm = async () => {
    await wallet.removeHdWalletsByHdWalletId(currentHdWalletId).catch((e) => {
      console.error(e);
    });
    setDeletePopupVisible(false);
    queryWallets();
  };

  const handleWalletClick = (w: any) => {
    history.push({
      pathname: '/account-manage',
      state: {
        hdWalletId: w.hdWalletId,
        hdWalletName: w.hdWalletName,
      },
    });
  };

  const setBackupVisible = (visible: boolean) => {
    setPopupVisible(visible);
  };

  const onRenameConfirm = async (walletName) => {
    if (!walletName) {
      message.error('invalid wallet name');
      return;
    }
    if (walletName.length > 20) {
      message.error('the length of name should less than 20');
      return;
    }
    const renamed: boolean = await wallet
      .renameHdWalletByHdWalletId(currentHdWalletId, walletName)
      .catch((e) => {
        console.error(e.code);
        if (e?.code === ErrorCode.WALLET_NAME_REPEAT) {
          message.error('wallet name is already exist');
        }
      });
    if (renamed) {
      setRenamePopupVisible(false);
      queryWallets();
    }
  };

  const handleDeleteBtnClick = (e, hdWalletId) => {
    if (hdWalletAccounts.length + simpleWalletAccounts.length === 1) {
      message.warn('can not delete the last wallet');
      return;
    }
    e.stopPropagation();
    setDeletePopupVisible(true);
    setCurrentHdWalletId(hdWalletId);
  };

  return (
    <div className="wallet-manage flexCol">
      {isEdit ? (
        <WalletHeader
          title="Wallet"
          handleDoneClick={() => setIsEdit(!isEdit)}
        />
      ) : (
        <Header title="Manage Wallets" />
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
          className="wallet-manage-button-item cursor flexCol _import"
          onClick={handleImportBtnClick}
        >
          <div className="wallet-manage-button-wrap flexR">
            <img src={importImg} alt="" className="wallet-manage-img" />
          </div>
          <span className="wallet-manage-button-item-title">Import</span>
        </div>
        <div
          onClick={handleCreateBtnClick}
          className="wallet-manage-button-item cursor flexCol _add"
        >
          <div className="wallet-manage-button-wrap flexR">
            <img src={addImg} alt="" className="wallet-manage-img" />
          </div>
          <span className="wallet-manage-button-item-title">Create</span>
        </div>
      </div>
      <div className="tab-container flexR content-wrap-padding">
        <CustomTab
          tab1="ID Wallet"
          tab2="Normal Wallet"
          handleTabClick={(tab: Tabs) => {
            setAccountType(tab);
          }}
        />
      </div>
      <div className="content flexCol">
        <div className="account-container flexR">
          {(accountType === Tabs.FIRST
            ? hdWalletAccounts
            : simpleWalletAccounts
          ).length > 0 ? (
            <div className="list flexCol">
              {(accountType === Tabs.FIRST
                ? hdWalletAccounts
                : simpleWalletAccounts
              ).map((w: BaseAccount | any, i: number) => (
                <div
                  className="item flexR"
                  key={w.hdWalletName}
                  onClick={(e) => {
                    if (!isHd || isEdit) return;
                    handleWalletClick(w);
                  }}
                >
                  <span
                    className="circle flexR"
                    style={{ background: WALLET_THEME_COLOR[i % 5] }}
                  >
                    {w?.hdWalletName?.substr(0, 1)}
                  </span>
                  <div className="right flexR">
                    <div className="name-account flexCol">
                      <WalletName cls="name-account-name" width={100}>
                        {w?.hdWalletName}
                      </WalletName>
                      <span
                        className="name-account-address"
                        style={{
                          display: isHd ? 'none' : 'block',
                        }}
                      >
                        {transferAddress2Display(w.address)}
                      </span>
                    </div>
                    <div
                      className="normal-container flexR"
                      style={{
                        display: isHd && !isEdit ? 'flex' : 'none',
                      }}
                    >
                      <span className="account-count">
                        {w?.accounts?.length} accounts
                      </span>
                      <IconComponent name="chevron-right" />
                    </div>

                    <div
                      className="normal-container flexR"
                      style={{
                        display: !isHd && !isEdit ? 'flex' : 'none',
                      }}
                    >
                      <ChainIcons coinType={w?.coinType} />
                      <CopyToClipboard
                        text={w.address}
                        onCopy={() => message.success('Copied')}
                      >
                        <IconComponent
                          name="copy"
                          cls="base-text-color arrow-right-icon"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </CopyToClipboard>
                    </div>
                    <div
                      className="icons-container flexR"
                      style={{
                        display: isEdit ? 'flex' : 'none',
                      }}
                    >
                      <IconComponent
                        name="eye"
                        cls="base-text-color"
                        onClick={(e) => {
                          e.stopPropagation();
                          history.push({
                            pathname: '/mnemonic-check',
                            state: {
                              hdWalletId: w.hdWalletId,
                              accountType,
                            },
                          });
                        }}
                        style={{
                          display: isEdit ? 'block' : 'none',
                        }}
                      />
                      <IconComponent
                        name="edit"
                        cls="base-text-color"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentWalletName(w.hdWalletName);
                          setCurrentHdWalletId(w.hdWalletId);
                          setRenamePopupVisible(true);
                        }}
                        style={{
                          display: isEdit ? 'block' : 'none',
                        }}
                      />
                      <IconComponent
                        name="trash"
                        cls="base-text-color"
                        onClick={(e) => handleDeleteBtnClick(e, w.hdWalletId)}
                        style={{
                          display: isEdit ? 'block' : 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data flexCol">
              <img src={noAssets} className="home-no-assets" />
              <span className="no-assets-title">No Wallet</span>
            </div>
          )}
        </div>
      </div>
      {/* <Backup
        visible={popupVisible}
        accountType={accountType}
        hdWalletId={backupHdWalletId}
        setVisible={setBackupVisible}
      /> */}
      <Delete
        title="Delete Wallet"
        visible={deletePopupVisible}
        setVisible={(visible: boolean) => {
          setDeletePopupVisible(visible);
        }}
        onConfirm={onDeleteConfirm}
      />
      <Rename
        title="Rename Wallet"
        visible={renamePopupVisible}
        defaultValue={currentWalletName}
        setVisible={(visible: boolean) => {
          setRenamePopupVisible(visible);
        }}
        onConfirm={onRenameConfirm}
      />
    </div>
  );
};

export default WalletManage;
