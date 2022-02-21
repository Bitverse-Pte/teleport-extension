import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';
import { Button } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import { intToHex } from 'ethereumjs-util';
import { useWallet, useApproval } from 'ui/utils';
import { NetworkProviderContext } from 'ui/context/NetworkProvider';
import { BigNumber } from 'ethers';
import { CoinType, EcoSystem, Provider } from 'types/network';
import DefaulutIcon from 'assets/tokens/default.svg';
import { nanoid } from 'nanoid';
import './addChain.less';
import { AddChainDetailCard } from 'ui/components/AddChain/AddChain';
import { SwitchChainCard } from 'ui/components/AddChain/SwitchChain';
import { chainIdToCategory } from 'utils/chain';

/**
 * @dev according to the spec on MetaMask
 * checkout: https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
 */
interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

interface SwitchEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
}

interface AddChainProps {
  data: [AddEthereumChainParameter | SwitchEthereumChainParameter];
  session: {
    origin: string;
    icon: string;
    name: string;
  };
}

/**
 * type guard for `AddEthereumChainParameter` and `SwitchEthereumChainParameter`
 * @param d the payload of the request
 * @returns is the payload a `AddEthereumChain` request
 */
function isDataTypeOfAddEthereumChain(
  d: AddEthereumChainParameter | SwitchEthereumChainParameter
): d is AddEthereumChainParameter {
  /**
   * - `chainName` must be defined
   * - `rpcUrls` must be at least 1 items
   */
  const treatAsAdd = d as AddEthereumChainParameter;
  return (
    Boolean(treatAsAdd.chainName) &&
    Boolean(treatAsAdd.rpcUrls) &&
    treatAsAdd.rpcUrls.length > 0
  );
}

const removeHttp = (url: string) => url.replace(/^https?:\/\//, '');

const itemsCenteredCls = 'flex items-center justify-center';

const AddChain = ({ params }: { params: AddChainProps }) => {
  const wallet = useWallet();
  const networkContext = useContext(NetworkProviderContext);
  const [, resolveApproval, rejectApproval] = useApproval();
  const { t } = useTranslation();

  const { session } = params;
  /* eslint-disable-next-line prefer-const */
  let [data] = params.data;
  if (typeof data.chainId === 'number') {
    data.chainId = intToHex(data.chainId).toLowerCase();
  } else {
    data.chainId = data.chainId.toLowerCase();
  }
  console.debug('AddChain::params: ', params);

  const [inited, setInited] = useState(false);

  const [siteUrl, setSiteUrl] = useState('');

  const init = async () => {
    const site = await wallet.getConnectedSite(session.origin)!;
    setSiteUrl(site);
    setInited(true);
  };

  const enableChains = useMemo(() => {
    if (!networkContext) return [];
    else return networkContext.enabledProviders;
  }, [networkContext]);

  const findMatchedChain = useCallback(
    (chain: Provider) => {
      /**
       * Is the same provider that depends on:
       * - is same RPC URL (if any)
       * - is same ChainId
       */
      if (isDataTypeOfAddEthereumChain(data)) {
        // is a `AddEthereumChain` request, same provider will be switched
        return (
          chain.rpcUrl === data.rpcUrls[0] &&
          BigNumber.from(chain.chainId).eq(data.chainId)
        );
      } else {
        // is a `SwitchEthereumChain` request
        return BigNumber.from(chain.chainId).eq(data.chainId);
      }
    },
    [data]
  );

  /**
   * This indicate is same network exist in local or not
   * no matter whether the type of `data` is.
   */
  const isProviderExistedToSwitch = useMemo(
    () => enableChains.some(findMatchedChain),
    [enableChains]
  );
  const matchedExistedProviderToSwitch = useMemo(
    () => enableChains.find(findMatchedChain),
    [enableChains]
  );

  const showChain = useMemo(() => {
    if (isDataTypeOfAddEthereumChain(data) && !isProviderExistedToSwitch) {
      // is add request, and provider is not existed in local
      return {
        chainId: data.chainId,
        nickname: data.chainName,
        rpcPrefs: {
          blockExplorerUrl: data.blockExplorerUrls
            ? data.blockExplorerUrls[0]
            : undefined,
        },
        rpcUrl: data.rpcUrls[0],
        ticker: data.nativeCurrency.symbol,
        category: chainIdToCategory(data.chainId),
        coinType: CoinType.ETH,
        chainName: 'ETH',
        id: nanoid(),
        ecsystem: EcoSystem.EVM,
        prefix: '0x',
      };
    } else {
      return matchedExistedProviderToSwitch as Provider;
    }
  }, [data, isProviderExistedToSwitch]);

  const titleAndContent = useMemo(() => {
    if (!isProviderExistedToSwitch) {
      return {
        title: t('AddChain'),
        askUser: t('doYouAllowSiteToAddNetwork'),
        content: t('enableChainContent'),
        confirmBtnText: t('add'),
      };
    } else {
      return {
        title: t('SwitchChain'),
        askUser: t('doYouAllowSiteToSwitchNetwork'),
        content: (
          <Trans
            i18nKey="switchChainDesc"
            values={{ name: showChain?.nickname }}
          />
        ),
        confirmBtnText: t('SwitchNetwork'),
      };
    }
  }, [isProviderExistedToSwitch, showChain]);

  const siteLogo = useMemo(() => {
    return session.icon || DefaulutIcon;
  }, [session]);

  useEffect(() => {
    init();
  }, []);

  const formattedOrigin = useMemo(() => {
    return removeHttp(session.origin);
  }, [session.origin]);

  /**
   * we take care of Dapp's `addChainRequest`
   * so sometime we can just treat it as `switchChain`
   */
  const isAddChainRequest = useMemo(() => {
    if (isProviderExistedToSwitch) return false;
    return isDataTypeOfAddEthereumChain(data);
  }, []);

  if (!inited) return <>Loading</>;

  return (
    <div className="addchain-container">
      <div className="approval-chain">
        {data && (
          <>
            <h1 className="text-center header">{titleAndContent.title}</h1>
            <div className="text-center">
              <div
                className={clsx(
                  'site-logo-container mx-auto mb-12',
                  itemsCenteredCls
                )}
              >
                <img className="addChain-siteIcon" src={siteLogo} />
              </div>
              <div className="text-16 origin">{formattedOrigin}</div>
              <div className="addChain-askUser mb-18">
                {titleAndContent.askUser}
              </div>
            </div>
            <div className="addChain-prompt">{titleAndContent.content}</div>
            {isAddChainRequest ? (
              <AddChainDetailCard showChain={showChain} />
            ) : (
              <SwitchChainCard toChain={showChain} />
            )}
          </>
        )}
      </div>
      <footer className="connect-footer">
        <div className={clsx(['action-buttons mt-4'])}>
          <Button
            type="primary"
            size="large"
            className={clsx(itemsCenteredCls, 'w-full mt-2', 'mb-14')}
            onClick={() => resolveApproval()}
          >
            {titleAndContent.confirmBtnText}
          </Button>
          <Button
            size="large"
            type="primary"
            ghost
            className={clsx(itemsCenteredCls, 'w-full mt-2')}
            onClick={() => rejectApproval()}
          >
            {t('Cancel')}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default AddChain;
