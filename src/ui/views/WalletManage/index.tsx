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
import { UnlockModal } from 'ui/components/UnlockModal';

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
  const [unlockPopupVisible, setUnlockPopupVisible] = useState(false);
  const [unlockType, setUnlockType] = useState('edit');

  const queryWallets = async () => {
    const accounts: DisplayWalletManage = await wallet.getAccountList(true);
    if (accounts && accounts.hdAccount) {
      setHdWalletAccount(accounts.hdAccount);
    }

    if (accounts && accounts.simpleAccount) {
      setSimpleWalletAccount(accounts.simpleAccount);
    }
  };

  const queryCurrentAccount = async () => {
    const account: BaseAccount = await wallet.getCurrentAccount();
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

  const handleCreateBtnClick = async () => {
    setUnlockType('create');
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    history.push('/create');
  };
  const handleImportBtnClick = async () => {
    setUnlockType('import');
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
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
    if (walletName.length > 20) {
      ClickToCloseMessage.error({
        content: 'Name length should be 1-20 characters',
        key: 'Name length should be 1-20 characters',
      });
      return;
    }
    const renamed: boolean = await wallet
      .renameHdWalletByHdWalletId(currentHdWalletId, walletName)
      .catch((e) => {
        console.error(e.code);
        if (e?.code === ErrorCode.WALLET_NAME_REPEAT) {
          ClickToCloseMessage.error({
            content: 'Name already exists',
            key: 'Name already exists',
          });
        } else {
          ClickToCloseMessage.error({
            content: 'Unknown error, please try again later',
            key: 'Unknown error, please try again later',
          });
        }
      });
    if (renamed) {
      setRenamePopupVisible(false);
      queryWallets();
    }
  };

  const handleDeleteBtnClick = (e, hdWalletId) => {
    if (hdWalletAccounts.length + simpleWalletAccounts.length === 1) {
      ClickToCloseMessage.warning('Please keep alive at least one account');
      return;
    }
    e.stopPropagation();
    setDeletePopupVisible(true);
    setCurrentHdWalletId(hdWalletId);
  };

  const handleUnlock = () => {
    if (unlockType === 'edit') {
      setIsEdit(!isEdit);
    }
    if (unlockType === 'create') {
      history.push('/create');
    }
    if (unlockType === 'import') {
      history.push('/recover');
    }
  };

  const handleEdit = async () => {
    setUnlockType('edit');
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    setIsEdit(!isEdit);
  };

  return (
    <div className="wallet-manage flexCol">
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
        }}
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
                  className={`item flexR ${
                    currentAccount?.hdWalletId === w?.hdWalletId
                      ? '_active'
                      : ''
                  }`}
                  style={isEdit ? { paddingRight: '24px' } : {}}
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
                    <div
                      className="circle-wrap flexR"
                      style={{
                        display:
                          w?.accountCreateType === AccountCreateType.PRIVATE_KEY
                            ? 'flex'
                            : 'none',
                      }}
                    >
                      <img
                        src={coinTypeToIconSVG(w?.coinType)}
                        className="circle-ecosystem-icon"
                      />
                    </div>
                  </div>
                  <div className="right flexR">
                    <WalletName cls="name-account-name" width={100}>
                      {w?.hdWalletName}
                    </WalletName>
                    <div
                      className="normal-container flexR cursor"
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
                        display: isEdit ? 'none' : 'flex',
                      }}
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

                    <div
                      className="icons-container flexR"
                      style={{
                        display: isEdit ? 'flex' : 'none',
                      }}
                    >
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
