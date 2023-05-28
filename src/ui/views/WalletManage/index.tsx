import './style.less';
import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Header from 'ui/components/Header';
import { useAsyncEffect, useWallet } from 'ui/utils';
import {
  AccountCreateType,
  BaseAccount,
  DisplayWalletManage,
  HdAccountStruct,
} from 'types/extend';
import { Tabs, WALLET_THEME_COLOR } from 'constants/wallet';
import { CustomTab, WalletName } from 'ui/components/Widgets';
import { IconComponent } from 'ui/components/IconComponents';
import noAssets from 'assets/noAssets.svg';
import noAssetsDark from 'assets/noAssetDark.svg';
import { Delete, Rename } from '../AccountManage';
import { ErrorCode } from 'constants/code';
import addImg from 'assets/addImg.svg';
import editImg from 'assets/editImg.svg';
import editImgDark from 'assets/editImgDark.svg';
import importImg from 'assets/importImg.svg';
import { ecosystemToIconSVG } from 'ui/utils/networkCategoryToIcon';
import { UnlockModal } from 'ui/components/UnlockModal';
import skynet from 'utils/skynet';
import BitError from 'error';
const { sensors } = skynet;
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
import { useStyledMessage } from 'ui/hooks/style/useStyledMessage';
import { renderAccountCreateType } from 'ui/helpers/utils/account.util';
import { openIndexPage } from 'background/webapi/tab';

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
  const location = useLocation();
  const wallet = useWallet();
  const [hdWalletAccounts, setHdWalletAccount] = useState<any>([]);
  const [mpcWalletAccounts, setMPCWalletAccount] = useState<any>([]);
  const [simpleWalletAccounts, setSimpleWalletAccount] = useState<
    HdAccountStruct[]
  >([]);
  const [accountType, setAccountType] = useState(Tabs.FIRST);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [currentHdWalletId, setCurrentHdWalletId] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [renamePopupVisible, setRenamePopupVisible] = useState(false);
  const [currentWalletName, setCurrentWalletName] = useState('');
  const [currentAccount, setCurrentAccount] = useState<BaseAccount>();
  const [unlockPopupVisible, setUnlockPopupVisible] = useState(false);
  const [unlockType, setUnlockType] = useState('edit');
  const { isDarkMode } = useDarkmode();
  const ClickToCloseMessage = useStyledMessage();

  const queryWallets = async () => {
    const accounts: HdAccountStruct[] = await wallet.getWalletList();
    const hdWallets: HdAccountStruct[] = [],
      mpcWallets: HdAccountStruct[] = [],
      simpleWallets: HdAccountStruct[] = [];
    if (accounts?.length > 0) {
      accounts.forEach((a: HdAccountStruct) => {
        if (a.accounts[0]?.accountCreateType === AccountCreateType.MNEMONIC) {
          hdWallets.push(a);
        } else if (
          a.accounts[0]?.accountCreateType === AccountCreateType.PRIVATE_KEY
        ) {
          simpleWallets.push(a);
        } else if (a.accounts[0]?.accountCreateType === AccountCreateType.MPC) {
          mpcWallets.push(a);
        }
      });
      setHdWalletAccount(hdWallets);
      setSimpleWalletAccount(simpleWallets);
      setMPCWalletAccount(mpcWallets);
    }

    const current: BaseAccount = await wallet.getCurrentAccount();
    if (current) {
      setCurrentAccount(current);
      if (current.accountCreateType === AccountCreateType.MPC) {
        setAccountType(Tabs.FIRST);
      } else {
        setAccountType(Tabs.SECOND);
      }
    }
    return {
      current,
      hdWalletAccounts: hdWallets,
    };
  };

  useEffect(() => {
    queryWallets();
  }, []);

  const handleCreateBtnClick = async () => {
    sensors.track('teleport_wallet_manage_create', { page: location.pathname });
    setUnlockType('create');
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    history.push('/create');
  };
  const handleImportBtnClick = async () => {
    sensors.track('teleport_wallet_manage_import', { page: location.pathname });
    setUnlockType('import');
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    history.push('/recover');
  };

  const onDeleteConfirm = async () => {
    sensors.track('teleport_wallet_manage_delete_comfirm', {
      page: location.pathname,
    });
    await wallet.removeHdWalletsByHdWalletId(currentHdWalletId).catch((e) => {
      console.error(e);
    });
    setDeletePopupVisible(false);
    queryWallets();
    //queryCurrentAccount();
  };

  const handleWalletClick = async (w: HdAccountStruct) => {
    sensors.track('teleport_wallet_manage_wallet_click', {
      page: location.pathname,
    });
    if (currentAccount?.hdWalletId === w?.accounts[0]?.hdWalletId) {
      return;
    }
    wallet
      .changeAccountByWalletId(
        w.hdWalletId,
        w.accounts[0].ecosystem,
        w.accounts[0].accountCreateType
      )
      .then(() => history.goBack())
      .catch(async (e: BitError) => {
        console.error(e);
      });
  };

  const onRenameConfirm = async (walletName) => {
    sensors.track('teleport_wallet_manage_rename_confirm', {
      page: location.pathname,
    });
    if (walletName.length > 20) {
      ClickToCloseMessage('error')({
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
          ClickToCloseMessage('error')({
            content: 'Name already exists',
            key: 'Name already exists',
          });
        } else {
          ClickToCloseMessage('error')({
            content: 'Unknown error, please try again later',
            key: 'Unknown error, please try again later',
          });
        }
      });
    if (renamed) {
      setRenamePopupVisible(false);
      queryWallets();
      //queryCurrentAccount();
    }
  };

  const handleDeleteBtnClick = (e, hdWalletId) => {
    sensors.track('teleport_wallet_manage_delete', { page: location.pathname });
    if (hdWalletAccounts.length + simpleWalletAccounts.length === 1) {
      ClickToCloseMessage('warning')('Please keep alive at least one account');
      return;
    }
    e.stopPropagation();
    setDeletePopupVisible(true);
    setCurrentHdWalletId(hdWalletId);
  };

  const handleUnlock = async () => {
    switch (unlockType) {
      case 'edit':
        setIsEdit(!isEdit);
        break;
      case 'create':
        history.push('/create');
        break;
      case 'import':
        history.push('/recover');
        break;
      case 'add':
        await wallet
          .addCurrentChainAccountByWalletId(currentHdWalletId)
          .catch((e) => {
            console.error(e);
          });
        history.goBack();
        break;
    }
  };

  const handleEdit = async () => {
    sensors.track('teleport_wallet_manage_edit', { page: location.pathname });
    setUnlockType('edit');
    if (!(await wallet.isUnlocked())) {
      setUnlockPopupVisible(true);
      return;
    }
    setIsEdit(!isEdit);
  };

  const makeList = (list, accountCreateType) => {
    return list.map((w: HdAccountStruct, i: number) => {
      return (
        <div
          className={`item flexR ${
            currentAccount?.hdWalletId === w?.hdWalletId ? '_active' : ''
          }`}
          style={isEdit ? { paddingRight: '24px' } : {}}
          key={w.hdWalletId}
          onClick={(e) => {
            if (isEdit) return;
            handleWalletClick(w);
          }}
        >
          <div
            className="circle flexR"
            style={{
              background: WALLET_THEME_COLOR[i % 5],
              color: '#171727',
            }}
          >
            {w?.hdWalletName?.substr(0, 1)}
            <div
              className="circle-wrap flexR"
              style={{
                display: accountType === Tabs.SECOND ? 'flex' : 'none',
              }}
            >
              <img
                src={ecosystemToIconSVG(w?.accounts[0]?.ecosystem)}
                className="circle-ecosystem-icon"
              />
            </div>
          </div>
          <div className="right flexR">
            <WalletName cls="name-account-name" width={200}>
              {w?.hdWalletName} ({renderAccountCreateType(accountCreateType)})
            </WalletName>
            <div
              className="normal-container flexR cursor"
              style={{
                display: isEdit ? 'none' : 'flex',
              }}
            >
              <IconComponent
                name="copy"
                cls="backup-icon"
                onClick={(e) => openIndexPage('/mpcwalletbackup')}
              />

              <IconComponent
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
                name="key"
                cls={clsx('key-default-icon')}
                style={
                  isDarkMode
                    ? {
                        fill: '#ffffff',
                      }
                    : {}
                }
              />
              {/* <img
              src={keyDefaultIcon}
              className="home-no-assets key-default-icon"
            />
            <img
              src={isDarkMode ? keyActiveIconDark : keyActiveIcon}
              className="home-no-assets key-active-icon"
            /> */}
            </div>

            <div
              className="icons-container flexR"
              style={{
                display: isEdit ? 'flex' : 'none',
              }}
            >
              <IconComponent
                name="edit_16"
                cls="base-text-color"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentWalletName(w.hdWalletName);
                  setCurrentHdWalletId(w.hdWalletId);
                  setRenamePopupVisible(true);
                  sensors.track('teleport_wallet_manage_rename', {
                    page: location.pathname,
                  });
                }}
                style={{
                  display: isEdit ? 'block' : 'none',
                }}
              />
              <IconComponent
                name="trash_16"
                cls="base-text-color"
                onClick={(e) => handleDeleteBtnClick(e, w.hdWalletId)}
                style={{
                  display: isEdit ? 'block' : 'none',
                }}
              />
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={clsx('wallet-manage flexCol', { dark: isDarkMode })}>
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
        <Header title="Manage Wallets c" />
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
            <IconComponent
              name="edit_17"
              cls="wallet-manage-img"
              style={{
                fill: isDarkMode ? '#ffffff' : '#000000',
              }}
            />
            {/* <img
              src={isDarkMode ? editImgDark : editImg}
              alt=""
              className="wallet-manage-img"
            /> */}
          </div>
          <span
            className="wallet-manage-button-item-title"
            style={{ color: '#fff' }}
          >
            Edit
          </span>
        </div>
        <div
          className="wallet-manage-button-item cursor flexCol _edit"
          onClick={() => openIndexPage('/mpc-recovery-wallet')}
        >
          <div
            className="wallet-manage-button-wrap flexR"
            style={{ background: '#F7A600' }}
          >
            <IconComponent
              name="rocket"
              cls="wallet-manage-img"
              style={{
                fill: isDarkMode ? '#ffffff' : '#000000',
              }}
            />
          </div>
          <span
            className="wallet-manage-button-item-title"
            style={{ color: '#fff' }}
          >
            Recovery
          </span>
        </div>
        <div
          className="wallet-manage-button-item cursor flexCol _import"
          onClick={handleImportBtnClick}
        >
          <div
            className="wallet-manage-button-wrap flexR"
            style={{ background: '#56FAA5' }}
          >
            {/* <img src={importImg} alt="" className="wallet-manage-img" /> */}
            <IconComponent
              name="import"
              cls="wallet-manage-img"
              style={{
                fill: '#364361',
              }}
            />
          </div>
          <span
            className="wallet-manage-button-item-title"
            style={{ color: '#fff' }}
          >
            Import
          </span>
        </div>
        <div
          onClick={handleCreateBtnClick}
          className="wallet-manage-button-item cursor flexCol _add"
        >
          <div
            className="wallet-manage-button-wrap flexR"
            style={{ background: '#FFC701' }}
          >
            <IconComponent
              name="plus-circle"
              cls="wallet-manage-img"
              style={{
                fill: '#364361',
                background: '#FFC701',
              }}
            />
            {/* <img src={addImg} alt="" className="wallet-manage-img" /> */}
          </div>
          <span
            className="wallet-manage-button-item-title"
            style={{ color: '#fff' }}
          >
            Create
          </span>
        </div>
      </div>
      <div className="tab-container flexR content-wrap-padding">
        <CustomTab
          tab1="MPC Wallet 3"
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
            ? mpcWalletAccounts
            : hdWalletAccounts.concat(simpleWalletAccounts)
          ).length > 0 ? (
            <div className="list flexCol">
              {accountType === Tabs.FIRST
                ? makeList(mpcWalletAccounts, AccountCreateType.MPC)
                : null}
              {accountType === Tabs.SECOND
                ? makeList(hdWalletAccounts, AccountCreateType.MNEMONIC)
                : null}
              {accountType === Tabs.SECOND
                ? makeList(simpleWalletAccounts, AccountCreateType.PRIVATE_KEY)
                : null}
            </div>
          ) : (
            <div className="no-data flexCol">
              <img
                src={isDarkMode ? noAssetsDark : noAssets}
                className="home-no-assets"
              />
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
        title="New wallet name"
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
