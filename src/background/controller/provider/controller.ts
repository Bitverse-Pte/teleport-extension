import { BigNumber } from 'ethers';
import { isHexString } from 'ethereumjs-util';
import { stringToHex } from 'web3-utils';
import { ethErrors } from 'eth-rpc-errors';
import { recoverPersonalSignature } from 'eth-sig-util';
import { cloneDeep } from 'lodash';
import {
  keyringService,
  permissionService,
  networkPreferenceService,
  sessionService,
  txController,
  preferenceService,
  TokenService,
} from 'background/service';
import { Session } from 'background/service/session';
import { Tx } from 'types/tx';
import Wallet from '../wallet';
import { SAFE_RPC_METHODS } from 'constants/index';
import BaseController from '../base';
import { CoinType, Ecosystem } from 'types/network';
import BitError from 'error';
import { ErrorCode } from 'constants/code';
import { chainIdToCategory } from 'utils/chain';
import { TransactionEnvelopeTypes } from 'constants/transaction';
import { MESSAGE_TYPE } from 'constants/app';

interface ApprovalRes extends Tx {
  type?: string;
  address?: string;
  uiRequestComponent?: string;
  isSend?: boolean;
  extra?: Record<string, any>;
}

interface Web3WalletPermission {
  // The name of the method corresponding to the permission
  parentCapability: string;

  // The date the permission was granted, in UNIX epoch time
  date?: number;
}

const v1SignTypedDataVlidation = ({
  data: {
    params: [_, from],
  },
}) => {
  const currentAddress = preferenceService
    .getCurrentAccount()
    ?.address.toLowerCase();
  if (from.toLowerCase() !== currentAddress)
    throw ethErrors.rpc.invalidParams('from should be same as current address');
};

const signTypedDataVlidation = ({
  data: {
    params: [from, _],
  },
}) => {
  const currentAddress = preferenceService
    .getCurrentAccount()
    ?.address.toLowerCase();
  if (from.toLowerCase() !== currentAddress)
    throw ethErrors.rpc.invalidParams('from should be same as current address');
};

const switchChainValidation = ({
  data: {
    params: [chainParams],
  },
  session,
}) => {
  const providers = networkPreferenceService.getAllProviders();
  const matchedProvider = providers.find((p) => {
    return (
      p.ecosystem == Ecosystem.EVM &&
      BigNumber.from(p.chainId).eq(chainParams.chainId)
    );
  });
  if (!matchedProvider) {
    throw ethErrors.provider.custom({
      code: 4902, // To-be-standardized "unrecognized chain ID" error
      message: `Unrecognized chain ID "${chainParams.chainId}". Try adding the chain using ${MESSAGE_TYPE.ADD_ETHEREUM_CHAIN} first.`,
    });
  }
  const connected = permissionService.getConnectedSite(session.origin);
  const { chainId: currentChainId, ecosystem } =
    networkPreferenceService.getProviderConfig();
  if (connected) {
    if (
      ecosystem == Ecosystem.EVM &&
      BigNumber.from(chainParams.chainId).eq(currentChainId)
    ) {
      return true;
    }
  }
};

class ProviderController extends BaseController {
  ethRpc = async (req) => {
    const {
      data: { method, params },
      session: { origin },
    } = req;

    if (
      !permissionService.hasPerssmion(origin) &&
      !SAFE_RPC_METHODS.includes(method)
    ) {
      throw ethErrors.provider.unauthorized();
    }

    const request = { id: 1, jsonrpc: '2.0', method: method, params: params };
    const provider =
      networkPreferenceService.getProviderAndBlockTracker().provider;
    const res = await provider.sendAsync(request);
    return res.result;
  };

  ethRequestAccounts = async ({ session: { origin } }) => {
    const _account = await this.getCurrentAccount();
    if (
      !permissionService.hasPerssmion({
        origin: origin,
        account: _account?.address,
      })
    ) {
      throw ethErrors.provider.unauthorized();
    }

    const account = _account ? [_account.address] : [];
    sessionService.broadcastEvent('accountsChanged', account);

    const currentSelectedProvider =
      networkPreferenceService.getProviderConfig();
    sessionService.broadcastEvent(
      'chainChanged',
      {
        chain: currentSelectedProvider.chainId,
        networkVersion: currentSelectedProvider.chainId,
      },
      origin
    );

    return account;
  };

  @Reflect.metadata('SAFE', true)
  ethAccounts = async ({ session: { origin } }) => {
    const account = await this.getCurrentAccount();
    if (
      !permissionService.hasPerssmion({
        origin: origin,
        account: account?.address,
      })
    ) {
      return [];
    }
    return account ? [account.address] : [];
  };

  @Reflect.metadata('SAFE', true)
  ethCoinbase = async ({ session: { origin } }) => {
    const account = await this.getCurrentAccount();
    if (
      !permissionService.hasPerssmion({
        origin: origin,
        account: account?.address,
      })
    ) {
      return null;
    }
    return account ? [account.address] : [];
  };

  @Reflect.metadata('SAFE', true)
  ethChainId = ({ session }: { session: Session }) => {
    const currentSelected = networkPreferenceService.getProviderConfig();
    return currentSelected.chainId;
  };

  @Reflect.metadata('SAFE', true)
  netVersion = ({ session }: { session: Session }) => {
    const currentSelected = networkPreferenceService.getProviderConfig();
    return currentSelected.chainId;
  };

  @Reflect.metadata('APPROVAL', [
    'SignTx',
    ({
      data: {
        params: [tx],
      },
      session,
    }) => {
      const currentAddress = preferenceService
        .getCurrentAccount()
        ?.address.toLowerCase();
      if (tx.from.toLowerCase() !== currentAddress) {
        throw ethErrors.rpc.invalidParams(
          'from should be same as current address'
        );
      }
    },
  ])
  ethSendTransaction = async (options: {
    data: {
      params: any;
    };
    session: Session;
    initParams: any;
    approvalRes: ApprovalRes;
    pushed: boolean;
    result: any;
  }) => {
    if (options.pushed) return options.result;
    const {
      data: {
        params: [txParams],
      },
      session: { origin },
      approvalRes,
    } = cloneDeep(options);
    const opts = {
      jsonrpc: '2.0',
      method: txParams.method,
      origin: 'metamask',
    };
    delete txParams.txParam;
    txParams.gas = approvalRes.gas;
    if (txParams.type === TransactionEnvelopeTypes.FEE_MARKET) {
      txParams.maxFeePerGas = approvalRes.maxFeePerGas;
      txParams.maxPriorityFeePerGas = approvalRes.maxPriorityFeePerGas;
      delete txParams.gasPrice;
    } else {
      if (approvalRes.gasPrice !== '0x0') {
        txParams.gasPrice = approvalRes.gasPrice;
      }
    }
    console.debug(
      'txController.newUnapprovedTransaction ===> start:',
      txParams,
      opts
    );
    const initParams = await txController.newUnapprovedTransaction(
      txParams,
      opts
    );
    console.debug(
      'txController.updateAndApproveTransaction ===> initParams',
      initParams
    );
    await txController.updateAndApproveTransaction(initParams);
    //const txMeta = txController.getTransactions(initParams.id);
    console.debug(
      'txController.updateAndApproveTransaction ===> txHash:',
      initParams.hash
    );
    return initParams.hash;
  };

  web3ClientVersion = () => {
    return `TeleportWallet/${process.env.release}`;
  };

  @Reflect.metadata('APPROVAL', [
    'SignText',
    ({
      data: {
        params: [_, from],
      },
    }) => {
      const currentAddress = preferenceService
        .getCurrentAccount()
        ?.address.toLowerCase();
      if (from.toLowerCase() !== currentAddress)
        throw ethErrors.rpc.invalidParams(
          'from should be same as current address'
        );
    },
  ])
  personalSign = async ({
    data: {
      params: [data, from],
    },
    approvalRes,
  }) => {
    data = data = isHexString(data) ? data : stringToHex(data);
    //const keyring = await this._checkAddress(from);

    return keyringService.signPersonalMessage(
      //keyring,
      //{ data, from },
      data,
      approvalRes?.extra
    );
  };

  private _signTypedData = async (from, data, version, extra?) => {
    //const keyring = await this._checkAddress(from);
    let _data = data;
    if (version !== 'V1') {
      if (typeof data === 'string') {
        _data = JSON.parse(data);
      }
    }

    return keyringService.signTypedMessage(
      //keyring,
      //{ from, data: _data },
      _data,
      { version, ...(extra || {}) }
    );
  };

  @Reflect.metadata('APPROVAL', ['SignTypedData', v1SignTypedDataVlidation])
  ethSignTypedData = async ({
    data: {
      params: [data, from],
    },
    approvalRes,
  }) => this._signTypedData(from, data, 'V1', approvalRes?.extra);

  @Reflect.metadata('APPROVAL', ['SignTypedData', v1SignTypedDataVlidation])
  ethSignTypedDataV1 = async ({
    data: {
      params: [data, from],
    },
    approvalRes,
  }) => this._signTypedData(from, data, 'V1', approvalRes?.extra);

  @Reflect.metadata('APPROVAL', ['SignTypedData', signTypedDataVlidation])
  ethSignTypedDataV3 = async ({
    data: {
      params: [from, data],
    },
    approvalRes,
  }) => this._signTypedData(from, data, 'V3', approvalRes?.extra);

  @Reflect.metadata('APPROVAL', ['SignTypedData', signTypedDataVlidation])
  ethSignTypedDataV4 = async ({
    data: {
      params: [from, data],
    },
    approvalRes,
  }) => this._signTypedData(from, data, 'V4', approvalRes?.extra);

  @Reflect.metadata('APPROVAL', [
    'AddToken',
    ({ data: { params }, session: { origin } }) => {
      return null;
    },
    { height: 390 },
  ])
  walletWatchAsset = async ({ data: { params }, session: { origin } }) => {
    console.debug('walletWatchAsset::tokenParams:', params);
    const { symbol, address, decimals, image } = params.options;
    const currentProvider = networkPreferenceService.getProviderConfig();
    await TokenService.addCustomToken({
      symbol,
      name: '',
      decimal: decimals,
      chainCustomId: currentProvider.id,
      contractAddress: address,
      isNative: false,
    });
    return null;
  };

  @Reflect.metadata('APPROVAL', [
    'AddChain',
    ({
      data: {
        params: [chainParams],
      },
      session,
    }) => {
      const connected = permissionService.getConnectedSite(session.origin);
      const { chainId: currentChainId, ecosystem } =
        networkPreferenceService.getProviderConfig();
      if (connected) {
        if (
          ecosystem == Ecosystem.EVM &&
          BigNumber.from(chainParams.chainId).eq(currentChainId)
        ) {
          return true;
        }
      }
    },
    { height: 390 },
  ])
  walletAddEthereumChain = async ({
    data: {
      params: [chainParams],
    },
    session: { origin },
  }) => {
    console.debug('walletAddEthereumChain::chainParams:', chainParams);

    /**
     * Handle edge case like
     * I have added network already, and dapp use the add api to switch to that network
     */

    const providers = networkPreferenceService.getAllProviders();
    const matchedSameChainIdProvider = providers.find((p) => {
      /**
       * If these are matched at the same time,
       * then they are treated as existed provider:
       * - Chain ID
       */
      return (
        p.ecosystem == Ecosystem.EVM &&
        BigNumber.from(p.chainId).eq(chainParams.chainId)
      );
    });

    if (matchedSameChainIdProvider) {
      // switch instead of add
      networkPreferenceService.setProviderConfig(matchedSameChainIdProvider);
      return null;
    }
    let newChainName: string = chainParams.chainName;
    if (providers.find((p) => p.nickname === chainParams.chainName)) {
      newChainName = `${chainParams.chainName} (${Number(
        chainParams.chainId
      )})`;
    }

    /**
     * chainParams are the data from the dapp,
     * so the type of `chainParams` is `AddEthereumChainParameter`
     */
    const network = networkPreferenceService.addCustomEthereumProvider(
      newChainName,
      chainParams.rpcUrls[0],
      chainParams.chainId,
      chainParams.nativeCurrency.symbol,
      chainParams.blockExplorerUrls
        ? chainParams.blockExplorerUrls[0]
        : undefined,
      CoinType.ETH,
      'ETH',
      Ecosystem.EVM,
      '0x'
    );
    try {
      networkPreferenceService.setProviderConfig({
        ...network,
        type: 'rpc',
      });
    } catch (error: any) {
      /** @TODO handle potential ACCOUNT_DOES_NOT_EXIST */
      // if (error.code == ErrorCode.ACCOUNT_DOES_NOT_EXIST) {

      // }
      console.error('walletAddEthereumChain::error: ', error);
    }

    await TokenService.addCustomToken({
      symbol: chainParams.nativeCurrency.symbol || 'ETH',
      name: '',
      decimal: 18,
      chainCustomId: network.id,
      isNative: true,
    });

    // return null is expected behaviour
    return null;
  };

  @Reflect.metadata('APPROVAL', [
    'AddChain',
    switchChainValidation,
    { height: 390 },
  ])
  walletSwitchEthereumChain = async ({
    data: {
      params: [chainParams],
    },
    session: { origin },
  }) => {
    {
      console.debug('walletSwitchEthereumChain::chainParams:', chainParams);
      const providers = networkPreferenceService.getAllProviders();
      const matchedProvider = providers.find((p) => {
        return (
          p.ecosystem == Ecosystem.EVM &&
          BigNumber.from(p.chainId).eq(chainParams.chainId)
        );
      });
      if (!matchedProvider) {
        throw ethErrors.provider.custom({
          code: 4902, // To-be-standardized "unrecognized chain ID" error
          message: `Unrecognized chain ID "${chainParams.chainId}". Try adding the chain using ${MESSAGE_TYPE.ADD_ETHEREUM_CHAIN} first.`,
        });
      }

      try {
        networkPreferenceService.setProviderConfig(matchedProvider);
      } catch (error: any) {
        /** @TODO handle potential ACCOUNT_DOES_NOT_EXIST */
        // if (error.code == ErrorCode.ACCOUNT_DOES_NOT_EXIST) {

        // }
        console.error('walletSwitchEthereumChain::error: ', error);
      }

      // return null is expected behaviour
      return null;
    }
  };

  walletRequestPermissions = ({ data: { params: permissions } }) => {
    const result: Web3WalletPermission[] = [];
    if ('eth_accounts' in (permissions?.[0] || {})) {
      result.push({ parentCapability: 'eth_accounts' });
    }
    return result;
  };

  @Reflect.metadata('SAFE', true)
  walletGetPermissions = ({ session: { origin } }) => {
    const result: Web3WalletPermission[] = [];
    if (Wallet.isUnlocked() && Wallet.getConnectedSite(origin)) {
      result.push({ parentCapability: 'eth_accounts' });
    }
    return result;
  };

  personalEcRecover = ({
    data: {
      params: [data, sig, extra = {}],
    },
  }) => {
    return recoverPersonalSignature({
      ...extra,
      data,
      sig,
    });
  };

  netListening = () => {
    return true;
  };

  /* private _checkAddress = async (address) => {
    // eslint-disable-next-line prefer-const
    let { address: currentAddress, type } =
      (await this.getCurrentAccount()) || {};
    currentAddress = currentAddress?.toLowerCase();
    if (
      !currentAddress ||
      currentAddress !== normalizeAddress(address).toLowerCase()
    ) {
      throw ethErrors.rpc.invalidParams({
        message:
          'Invalid parameters: must use the current user address to sign',
      });
    }
    const keyring = await keyringService.getKeyringForAccount(
      currentAddress,
      type
    );

    return keyring;
  }; */
}

export default new ProviderController();
