import './style.less';
import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Header from 'ui/components/Header';
import { transferAddress2Display, useAsyncEffect, useWallet } from 'ui/utils';
import {
  AccountCreateType,
  BaseAccount,
  DisplayWalletManage,
} from 'types/extend';
import { Tabs, WALLET_THEME_COLOR } from 'constants/wallet';
import { CustomTab, WalletName } from 'ui/components/Widgets';
import { IconComponent } from 'ui/components/IconComponents';
import noAssets from 'assets/noAssets.svg';
import { Delete, Rename } from '../AccountManage';
import { ErrorCode } from 'constants/code';
import addImg from 'assets/addImg.svg';
import editImg from 'assets/editImg.svg';
import importImg from 'assets/importImg.svg';
import keyDefaultIcon from 'assets/keyDefault.svg';
import keyActiveIcon from 'assets/keyActive.svg';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import { coinTypeToIconSVG } from 'ui/utils/networkCategoryToIcon';

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
  const [currentAccount, setCurrentAccount] = useState<BaseAccount>();

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

  const queryCurrentAccount = async () => {
    const account: BaseAccount = await wallet.getCurrentAccount();
    console.log('current account', account);
    if (account) {
      setCurrentAccount(account);
    }
  };

  useAsyncEffect(queryWallets, []);
  useAsyncEffect(queryCurrentAccount, []);

  const isHd = useMemo(() => {
    return accountType === Tabs.FIRST;
  }, [accountType]);

  useMemo(() => {
    if (currentAccount && hdWalletAccounts && simpleWalletAccounts) {
      if (
        hdWalletAccounts.some((account) =>
          account.accounts.some(
            (subAccount) => subAccount.address === currentAccount.address
          )
        )
      ) {
        setAccountType(Tabs.FIRST);
      } else {
        setAccountType(Tabs.SECOND);
      }
    }
  }, [hdWalletAccounts, simpleWalletAccounts, currentAccount]);

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

  const handleWalletClick = async (w: any) => {
    await wallet.changeAccount(w?.accounts ? w?.accounts[0] : w);
    history.goBack();
  };

  const setBackupVisible = (visible: boolean) => {
    setPopupVisible(visible);
  };

  const onRenameConfirm = async (walletName) => {
    if (!walletName) {
      ClickToCloseMessage.error('invalid wallet name');
      return;
    }
    if (walletName.length > 20) {
      ClickToCloseMessage.error('the length of name should less than 20');
      return;
    }
    const renamed: boolean = await wallet
      .renameHdWalletByHdWalletId(currentHdWalletId, walletName)
      .catch((e) => {
        console.error(e.code);
        if (e?.code === ErrorCode.WALLET_NAME_REPEAT) {
          ClickToCloseMessage.error('wallet name is already exist');
        }
      });
    if (renamed) {
      setRenamePopupVisible(false);
      queryWallets();
    }
  };

  const handleDeleteBtnClick = (e, hdWalletId) => {
    if (hdWalletAccounts.length + simpleWalletAccounts.length === 1) {
      ClickToCloseMessage.warning('can not delete the last wallet');
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
        style={{
          display: isEdit ? 'none' : 'flex',
          justifyContent:
            accountType === Tabs.FIRST ? 'space-between' : 'center',
        }}
      >
        <div
          className="wallet-manage-button-item cursor flexCol _edit"
          style={{
            marginRight: accountType === Tabs.FIRST ? '0px' : '132px',
          }}
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
          style={{ display: accountType === Tabs.FIRST ? 'flex' : 'none' }}
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
          currentTab={accountType}
          tab2="Normal Wallet"
          showToolTips
          tip1="Created/Imported with mnemonic words"
          tip2="Imported with private key"
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
                  className={`item flexR ${currentAccount?.hdWalletId === w?.hdWalletId
                      ? '_active'
                      : ''
                    }`}
                  key={w.hdWalletName}
                  onClick={(e) => {
                    if (isEdit) return;
                    handleWalletClick(w);
                  }}
                >
                  <div
                    className="circle flexR"
                    style={{ background: WALLET_THEME_COLOR[i % 5] }}
                  >
                    {w?.hdWalletName?.substr(0, 1)}
                    <div className="circle-wrap flexR">
                      <img
                        src={coinTypeToIconSVG(w?.coinType)}
                        style={{
                          display:
                            w?.accountCreateType === AccountCreateType.PRIVATE_KEY
                              ? 'block'
                              : 'none',
                        }}
                        className="circle-ecosystem-icon"
                      />
                    </div>

                  </div>
                  <div className="right flexR">
                    <div className="name-account-wrap flexR">
                      <div className="name-account flexCol">
                        <WalletName cls="name-account-name" width={100}>
                          {w?.hdWalletName}
                        </WalletName>
                      </div>
                      <div
                        className="name-account-key-container"
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
                        style={
                          currentAccount?.hdWalletId === w?.hdWalletId
                            ? { display: 'flex' }
                            : {}
                        }
                      >
                        <img
                          src={keyDefaultIcon}
                          className="home-no-assets key-default-icon"
                        />
                        <img
                          src={keyActiveIcon}
                          className="home-no-assets key-active-icon"
                        />
                      </div>
                    </div>

                    <div
                      className="normal-container flexR"
                      style={{
                        display: isEdit ? 'none' : 'flex',
                      }}
                    >
                      {currentAccount?.hdWalletId === w?.hdWalletId ||
                        currentAccount?.address === w?.address ? (
                        <IconComponent name="check" cls="base-text-color" />
                      ) : null}
                    </div>

                    <div
                      className="icons-container flexR"
                      style={{
                        display: isEdit ? 'flex' : 'none',
                      }}
                    >
                      {/* <IconComponent
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
                      /> */}
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
