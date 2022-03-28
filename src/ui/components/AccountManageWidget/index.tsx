import './style.less';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Collapse, Tooltip } from 'antd';
import { transferAddress2Display, useAsyncEffect, useWallet } from 'ui/utils';
import { BaseAccount } from 'types/extend';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Jazzicon from 'react-jazzicon';
import * as _ from 'lodash';
import { IconComponent } from 'ui/components/IconComponents';
import clsx from 'clsx';
import { WalletName } from 'ui/components/Widgets';
import { CoinType, Ecosystem, Provider } from 'types/network';
import {
  ecosystemToIconSVG,
  IdToChainLogoSVG,
} from 'ui/utils/networkCategoryToIcon';
import { ClickToCloseMessage } from 'ui/components/universal/ClickToCloseMessage';
import { CoinTypeEcosystemMapping } from 'constants/wallet';
import selectedIcon from '../../../assets/accountSelected.svg';

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
  const [tempAccounts, setTempAccounts] = useState<IDisplayAccountManage[]>();
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
      setTempAccounts(displayAccounts);
    }
  };

  useImperativeHandle(ref, () => {
    return {
      queryAccounts,
    };
  });

  useAsyncEffect(queryAccounts, []);

  const handleAccountClick = async (a: IDisplayAccountManage) => {
    if (a.ethAddress === currentAccount) return;
    let coinType: CoinType, account;
    const currentChain: Provider | null = await wallet.getCurrentChain();
    if (currentChain) {
      coinType = currentChain.coinType;
    }
    a.ecosystems.forEach((e) =>
      e.accounts.forEach((ic: ICustomChain) => {
        if (ic.coinType === coinType) {
          account = ic;
        }
      })
    );
    await wallet.changeAccount(account);
    queryAccounts();
  };

  return (
    <div className="account-manage-widget flexR">
      <div className="side-bar flexCol">
        {tempAccounts?.map((account: IDisplayAccountManage, i) => {
          return (
            <div
              className={clsx('flexR id-item')}
              onClick={() => handleAccountClick(account)}
              style={account.selected ? { width: '40px', height: '40px' } : {}}
              key={i}
            >
              <Jazzicon
                diameter={account.selected ? 40 : 30}
                seed={Number(account?.ethAddress?.substr(0, 8) || 0)}
              />
              <img
                src={selectedIcon}
                className="account-manage-selected-icon"
                style={{ display: account.selected ? 'block' : 'none' }}
              />
            </div>
          );
        })}
      </div>
      <div className="account-manage-widget-content flexCol">
        <WalletName cls="account-manage-widget-account-name" width={250}>
          {(() => {
            const account = tempAccounts?.find(
              (a: IDisplayAccountManage) => a.selected
            )?.ecosystems[0]?.accounts[0];
            return account?.accountName || account?.hdWalletName;
          })()}
        </WalletName>
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
  );
};

export default forwardRef(AccountManageWidget);
