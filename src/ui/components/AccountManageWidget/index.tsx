import './style.less';
import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from 'react';
import { Collapse, Tooltip } from 'antd';
import { transferAddress2Display, useAsyncEffect, useWallet } from 'ui/utils';
import { BaseAccount } from 'types/extend';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Jazzicon from 'react-jazzicon';
import * as _ from 'lodash';
import { IconComponent } from 'ui/components/IconComponents';
import clsx from 'clsx';
import { WalletName } from 'ui/components/Widgets';
import { Ecosystem, Provider } from 'types/network';
import {
  ecosystemToIconSVG,
  IdToChainLogoSVG,
} from 'ui/utils/networkCategoryToIcon';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import { ecosystemMapping } from 'constants/wallet';
import classnames from 'classnames';
import { getUnit10ByAddress } from 'background/utils';

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

const AccountManageWidget = (props: IAccountManageWidgetProps, ref) => {
  const [tempAccounts, setTempAccounts] = useState<any[]>();
  const [currentAccount, setCurrentAccount] = useState<BaseAccount>();

  const wallet = useWallet();
  const { hdWalletId } = props;

  const queryAccounts = async () => {
    const accounts: ICustomChain[] = await wallet.getAccountListByHdWalletId(
      hdWalletId
    );
    const currentAccount: BaseAccount | null = await wallet.getCurrentAccount();
    const displayAccounts: IDisplayAccountManage[] = [];

    if (accounts && accounts.length > 0 && currentAccount) {
      setCurrentAccount(currentAccount);
      for (const a of accounts) {
        a.chainList = [];
        const chains: Provider[] = await wallet.getAllProviders();
        if (chains?.length) {
          chains.forEach((p: Provider) => {
            if (
              (a.ecosystem === Ecosystem.EVM &&
                p.ecosystem === Ecosystem.EVM) ||
              (a.ecosystem !== Ecosystem.EVM && p.id === a.chainCustomId)
            ) {
              const chainItem = {
                chainCustomId: p.id,
                chainName: p.nickname,
              };
              a?.chainList?.push(chainItem);
            }
          });
        }

        if (
          displayAccounts.some(
            (da: IDisplayAccountManage) =>
              da.hdPathIndex === a.hdPathIndex &&
              da.ecosystems.some((subDa) => subDa.ecosystem === a.ecosystem)
          )
        ) {
          displayAccounts
            .find(
              (da: IDisplayAccountManage) => da.hdPathIndex === a.hdPathIndex
            )
            ?.ecosystems?.find((subDa) => subDa.ecosystem === a.ecosystem)
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
                ecosystem: a.ecosystem,
                ecosystemName: ecosystemMapping[a.ecosystem].ecosystemName,
              });
          } else {
            displayAccounts.push({
              hdPathIndex: a.hdPathIndex,
              //selected: a.address === currentAccount.address,
              ecosystems: [
                {
                  accounts: [a],
                  ecosystem: a.ecosystem,
                  ecosystemName: ecosystemMapping[a.ecosystem].ecosystemName,
                },
              ],
            });
          }
        }
      }
      displayAccounts.forEach((da: IDisplayAccountManage) => {
        da.selected = da.ecosystems.some((e) =>
          e.accounts.some((subE) => subE.address === currentAccount.address)
        );
        if (da.ecosystems.some((e) => e.ecosystem === Ecosystem.EVM)) {
          da.ethAddress = da.ecosystems.find(
            (e) => e.ecosystem === Ecosystem.EVM
          )?.accounts[0].address;
        } else {
          da.ethAddress = da.ecosystems[0].accounts[0].address;
        }
      });
      setTempAccounts(displayAccounts);
    }
  };

  useImperativeHandle(ref, () => {
    return {
      queryAccounts,
    };
  });

  useAsyncEffect(queryAccounts, []);

  const handleAccountClick = async (
    a: IDisplayAccountManage,
    isEmpty: boolean,
    isCurrentAccount
  ) => {
    if (isCurrentAccount || isEmpty) return;
    let account;
    const currentChain: Provider | null = await wallet.getCurrentChain();
    if (currentChain) {
      const { ecosystem, id } = currentChain;
      a.ecosystems.forEach((e) => {
        if (ecosystem === Ecosystem.EVM && e.ecosystem === ecosystem) {
          account = e.accounts[0];
        } else if (ecosystem !== Ecosystem.EVM && e.ecosystem === ecosystem) {
          e.accounts.forEach((ic: ICustomChain) => {
            if (ic.chainCustomId === id) {
              account = ic;
            }
          });
        }
      });
      await wallet.changeAccount(account);
      queryAccounts();
    }
  };

  const selectedIndex = useMemo(
    () => tempAccounts?.findIndex((a: IDisplayAccountManage) => a.selected),
    [tempAccounts]
  );

  return (
    <div className="account-manage-widget flexR">
      <div className="side-bar flexCol">
        {tempAccounts?.concat([{}])?.map((account: any, i) => {
          return (
            <div
              className={clsx('flexR id-item', {
                'id-item-selected': account.selected,
                'id-item-selected-previous': i === (selectedIndex || 0) - 1,
                'id-item-selected-after': i === (selectedIndex || 0) + 1,
                cursor: i !== tempAccounts.length,
              })}
              onClick={() =>
                handleAccountClick(
                  account,
                  i === tempAccounts.length,
                  i === selectedIndex
                )
              }
              key={i}
            >
              <div className="id-item-wrap-wrap flexR">
                <div
                  className={classnames('id-item-wrap flexR', {
                    'first-id-item-wrap': i === 0 && !account.selected,
                  })}
                >
                  {account?.ethAddress ? (
                    <Jazzicon
                      diameter={account.selected ? 40 : 30}
                      seed={getUnit10ByAddress(account?.ethAddress)}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="account-manage-widget-content flexCol">
        <WalletName
          cls="account-manage-widget-account-name account-manage-widget-content-name"
          width={250}
        >
          {(() => {
            const account = tempAccounts?.find(
              (a: IDisplayAccountManage) => a.selected
            )?.ecosystems[0]?.accounts[0];
            return account?.accountName || account?.hdWalletName;
          })()}
        </WalletName>
        <div className="account-manage-widget-content-list">
          <Collapse
            expandIconPosition="right"
            bordered={false}
            ghost={true}
            defaultActiveKey={[Ecosystem.EVM]}
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
                    key={a.ecosystem}
                    header={
                      <div className="account-item flexR">
                        <img
                          src={ecosystemToIconSVG(a.ecosystem)}
                          className="account-item-ecosystem-icon"
                        />
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
      </div>
    </div>
  );
};

export default forwardRef(AccountManageWidget);
