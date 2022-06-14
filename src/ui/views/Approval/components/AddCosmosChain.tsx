import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CosmosChainInfo } from 'types/cosmos';
import { useApproval, useWallet } from 'ui/utils';
import DefaulutIcon from 'assets/tokens/default.svg';
import { AddCosmosChainDetailCard } from 'ui/components/AddChain/AddChain';
import { CoinType, Ecosystem } from 'types/network';
import { nanoid } from 'nanoid';
import { Button } from 'antd';
import './addCosmosChain.less';

interface AddCosmosChainProps {
  data: [CosmosChainInfo];
  existed: boolean;
  session: {
    origin: string;
    icon: string;
    name: string;
  };
}

const removeHttp = (url: string) => url.replace(/^https?:\/\//, '');

const AddCosmosChain = ({ params }: { params: AddCosmosChainProps }) => {
  const wallet = useWallet();
  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();
  const { session } = params;
  const [data] = params.data;

  const formattedOrigin = useMemo(() => {
    return removeHttp(session.origin);
  }, [session.origin]);

  const siteLogo = useMemo(() => {
    return session.icon || DefaulutIcon;
  }, [session]);

  const showChain = useMemo(() => {
    // is add request, and provider is not existed in local
    return {
      chainId: data.chainId,
      nickname: data.chainName,
      rpcPrefs: {
        blockExplorerUrl: data.rest ? data.rest : undefined,
      },
      rpcUrl: data.rpc,
      coinType: CoinType.COSMOS,
      chainName: 'COSMOS',
      id: nanoid(),
      ecosystem: Ecosystem.COSMOS,
      prefix: 'cosmos',
    };
  }, [data]);

  return (
    <div className="addchain-container">
      <div className="approval-chain">
        {data && (
          <>
            <h1 className="text-center addChain-header">{t('AddChain')}</h1>
            <div className="text-center">
              <div
                className={clsx(
                  'site-logo-container mx-auto mb-12',
                  'flex items-center justify-center'
                )}
              >
                <img className="addChain-siteIcon" src={siteLogo} />
              </div>
              <div className="text-16 origin">{formattedOrigin}</div>
              <div className="addChain-askUser mb-18">
                {params.existed
                  ? t('existedChain')
                  : t('doYouAllowSiteToAddNetwork')}
              </div>
            </div>
            <div className="addChain-prompt">{t('enableChainContent')}</div>
            <AddCosmosChainDetailCard showChain={showChain} />
          </>
        )}
      </div>
      <footer className="addChain-footer">
        <div className={clsx(['action-buttons mt-4'])}>
          <Button
            type="primary"
            size="large"
            className={clsx(
              'flex items-center justify-center',
              'w-full mt-2',
              'mb-14'
            )}
            onClick={
              params.existed ? () => rejectApproval() : () => resolveApproval()
            }
          >
            {params.existed ? t('confirm') : t('add')}
          </Button>
          {!params.existed && (
            <Button
              size="large"
              type="primary"
              ghost
              className={clsx(
                'flex items-center justify-center',
                'w-full mt-2'
              )}
              onClick={() => rejectApproval()}
            >
              {t('Cancel')}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default AddCosmosChain;
