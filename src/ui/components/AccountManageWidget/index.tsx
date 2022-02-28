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
import clsx from 'clsx';
import {
  CustomButton,
  CustomInput,
  CustomPasswordInput,
  WalletName,
} from 'ui/components/Widgets';
import { Ecosystem, Provider } from 'types/network';
import { IdToChainLogoSVG } from 'ui/utils/networkCategoryToIcon';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import { CoinTypeEcosystemMapping } from 'constants/wallet';

interface ICustomChain extends BaseAccount {
  chainList?: {
    chainCustomId: string;
    chainName: string;
  }[];
}

export interface IAccountManageWidgetProps {
  hdWalletId: string;
}

interface IDisplayAccountManage {
  ethAddress?: string; // for avatar
  hdPathIndex: number;
  selected?: boolean;
  ecosystems: {
    accounts: ICustomChain[];
    ecosystem: Ecosystem;
    ecosystemName: string;
  }[];
}

const AccountManageWidget: React.FC<IAccountManageWidgetProps> = (
  props: IAccountManageWidgetProps
) => {
  const [tempAccounts, setTempAccounts] = useState<IDisplayAccountManage[]>();
  const wallet = useWallet();
  const { hdWalletId } = props;

  const queryAccounts = async () => {
    const accounts: ICustomChain[] = await wallet.getAccountListByHdWalletId(
      hdWalletId
    );
    const currentAccount: BaseAccount | null = await wallet.getCurrentAccount();
    const displayAccounts: IDisplayAccountManage[] = [];

    if (accounts && accounts.length > 0 && currentAccount) {
      for (const a of accounts) {
        a.chainList = [];
        let ecosystem,
          ecosystemName = '';
        for (const eco in CoinTypeEcosystemMapping) {
          if (CoinTypeEcosystemMapping[eco].coinType.includes(a.coinType)) {
            ecosystem = eco;
            ecosystemName = CoinTypeEcosystemMapping[eco].ecosystemName;
          }
        }
        const chains: Provider[] = await wallet.getSameChainsByCoinType(
          a.coinType
        );
        if (chains?.length) {
          chains.forEach((p: Provider) => {
            const chainItem = {
              chainCustomId: p.id,
              chainName: p.nickname,
            };
            a?.chainList?.push(chainItem);
          });
        }
        if (
          displayAccounts.some(
            (da: IDisplayAccountManage) =>
              da.hdPathIndex === a.hdPathIndex &&
              da.ecosystems.some((subDa) => subDa.ecosystem === ecosystem)
          )
        ) {
          displayAccounts
            .find(
              (da: IDisplayAccountManage) => da.hdPathIndex === a.hdPathIndex
            )
            ?.ecosystems?.find((subDa) => subDa.ecosystem === ecosystem)
            ?.accounts.push(a);
        } else {
          if (
            displayAccounts.some(
              (da: IDisplayAccountManage) => da.hdPathIndex === a.hdPathIndex
            )
          ) {
            displayAccounts
              .find(
                (da: IDisplayAccountManage) => da.hdPathIndex === a.hdPathIndex
              )
              ?.ecosystems?.push({
                accounts: [a],
                ecosystem,
                ecosystemName,
              });
          } else {
            displayAccounts.push({
              hdPathIndex: a.hdPathIndex,
              selected: a.address === currentAccount.address,
              ecosystems: [
                {
                  accounts: [a],
                  ecosystem,
                  ecosystemName,
                },
              ],
            });
          }
        }
      }
      displayAccounts.forEach((da: IDisplayAccountManage) => {
        if (da.ecosystems.some((e) => e.ecosystem === Ecosystem.EVM)) {
          da.ethAddress = da.ecosystems.find(
            (e) => e.ecosystem === Ecosystem.EVM
          )?.accounts[0].address;
        } else {
          da.ethAddress = da.ecosystems[0].accounts[0].address;
        }
      });
      console.error(displayAccounts);
      setTempAccounts(displayAccounts);
    }
  };

  useAsyncEffect(queryAccounts, []);

  const handleAccountClick = (a: IDisplayAccountManage) => {
    console.log(a);
  };

  return (
    <div className="account-manage-widget flexR">
      <div className="side-bar flexCol">
        {tempAccounts?.map((account: IDisplayAccountManage, i) => {
          return (
            <div
              className={clsx('flexR id-item', {
                'active-item': account.selected,
              })}
              onClick={() => handleAccountClick(account)}
              key={i}
            >
              <Jazzicon
                diameter={30}
                seed={Number(account?.ethAddress?.substr(0, 8) || 0)}
              />
            </div>
          );
        })}
      </div>
      <div className="account-manage-widget-content flexCol">
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
        >
          {tempAccounts
            ?.find((a: IDisplayAccountManage) => a.selected)
            ?.ecosystems.map((a, i) => {
              return (
                <Collapse.Panel
                  key={i}
                  header={
                    <div className="account-item flexR">
                      <WalletName cls="account-address bold" width={180}>
                        {a.ecosystemName}
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
                              <Tooltip
                                title={c.chainName}
                                key={c.chainCustomId}
                              >
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
                              onCopy={() =>
                                ClickToCloseMessage.success('Copied')
                              }
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
      {/* {isEdit ? (
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
        <div
          className="account-manage-content-container"
          style={{
            display: isEdit ? 'none' : 'block',
          }}
        >
          
        </div>

      </div> */}
    </div>
  );
};

export default AccountManageWidget;

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
