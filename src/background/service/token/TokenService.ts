import {
  AddTokenOpts,
  ERC20Struct,
  IDenomTrace,
  ITokenStore,
  ITrace,
  Token,
} from 'types/token';
import { TOKEN_STORE_KEY } from 'constants/chain';
import cloneDeep from 'lodash/cloneDeep';
import {
  AppChainInfo,
  DEFAULT_TOKEN_CONFIG,
  EmbedChainInfos,
} from 'constants/token';
import { nanoid } from 'nanoid';
import { networkPreferenceService } from 'background/service';
import abi from 'utils/human-standard-token-abi-extended';
import BitError from 'error';
import { ErrorCode } from 'constants/code';
import { ObservableStorage } from 'background/utils/obsStorage';
import { getMulticallAddressOf } from 'constants/evm/multicall';
import { Ecosystem } from 'types/network';
import { MulticallHelper } from './utils/multicallHelper';
import { PresetNetworkId } from 'constants/defaultNetwork';
import { Network, Provider } from 'types/network';

class TokenService {
  store: ObservableStorage<ITokenStore>;

  constructor() {
    this.store = new ObservableStorage<ITokenStore>(TOKEN_STORE_KEY, {
      tokens: [],
      balances: null,
      denomTrace: {},
    });
  }

  async init(): Promise<TokenService> {
    this.compareDifferenceFromConfig();
    return this;
  }

  compareDifferenceFromConfig() {
    const storageTokens = cloneDeep(this.store.getState().tokens || []);
    DEFAULT_TOKEN_CONFIG.forEach((t: Token) => {
      if (
        storageTokens.every(
          (subT: Token) =>
            !(
              subT.chainCustomId === t.chainCustomId &&
              subT.symbol === t.symbol &&
              subT.contractAddress === t.contractAddress
            )
        )
      ) {
        const token: Token = { ...{ tokenId: nanoid(), ...cloneDeep(t) } };
        storageTokens.push(token);
      }
    });
    this.store.updateState({
      tokens: storageTokens,
    });
  }

  getAllTokens(chainCustomId?: string): Token[] {
    return this.store
      .getState()
      .tokens.filter((t: Token) =>
        chainCustomId ? t.chainCustomId === chainCustomId : true
      );
  }

  private _checkDuplicateToken(chainCustomId, contractAddress): boolean {
    return !!this.getAllTokens(chainCustomId).find(
      (t: Token) =>
        (t as any).contractAddress.toLowerCase() ===
        contractAddress.toLowerCase()
    );
  }

  addCustomToken(tokenParams: AddTokenOpts): Promise<boolean> {
    if (
      !tokenParams.isNative &&
      this._checkDuplicateToken(
        tokenParams.chainCustomId,
        tokenParams.contractAddress
      )
    ) {
      return Promise.reject(
        new BitError(ErrorCode.CUSTOM_ERC20_TOKEN_DUPLICATED)
      );
    }
    const token: Token = {
      symbol: tokenParams.symbol,
      decimal: tokenParams.decimal,
      name: tokenParams.name,
      denom: tokenParams.denom || '',
      icon: '',
      chainCustomId: tokenParams.chainCustomId,
      isNative: tokenParams.isNative,
      contractAddress: tokenParams.contractAddress || '',
      isCustom: true,
      display: true,
      tokenId: nanoid(),
    };
    const storageTokens = cloneDeep(this.store.getState().tokens || []);
    storageTokens.push(token);
    this.store.updateState({
      tokens: storageTokens,
    });
    return Promise.resolve(true);
  }

  setTokenDisplay(tokenId: string, display: boolean): Promise<boolean> {
    const storageTokens = cloneDeep(this.store.getState().tokens || []);
    const storageBalances = cloneDeep(this.store.getState().balances || {});
    const currentToken = storageTokens.find(
      (t: Token) => t.tokenId === tokenId
    );
    if (!currentToken) return Promise.reject('current token id was not found');
    currentToken.display = display;
    Object.values(storageBalances).forEach((tokens: Token[]) => {
      tokens.forEach((t: Token) => {
        if (t.tokenId === tokenId) {
          t.display = display;
        }
      });
    });
    this.store.updateState({
      tokens: storageTokens,
      balances: storageBalances,
    });
    return Promise.resolve(true);
  }

  getBalancesSync(address: string, chainCustomId: string): Promise<Token[]> {
    let tokens: Token[] = [];
    const { ecosystem } = networkPreferenceService.getProviderConfig();
    if (this.store.getState().balances) {
      const clonedBalances = cloneDeep(this.store.getState().balances);
      if (clonedBalances && clonedBalances[address]) {
        tokens = clonedBalances[address].filter(
          (t: Token) => t.chainCustomId === chainCustomId
        );
      }
    }
    return Promise.resolve(tokens);
  }

  private async _getEvmBalancesLegacy(
    tokens: Token[],
    address: string
  ): Promise<Token[]> {
    for (const token of tokens) {
      if (token.contractAddress && address) {
        const balance = await this.getERC20Balance(
          token.contractAddress,
          address
        );
        if (balance) {
          token.amount = balance;
        }
      } else if (token.isNative) {
        const balance = await this.getNativeBalance(address);
        if (balance) {
          token.amount = balance;
        }
      }
    }
    return tokens;
  }
  async getEvmBalancesAsync(
    address: string,
    chainCustomId: string
  ): Promise<Token[]> {
    let tokens: Token[] = cloneDeep(this.store.getState().tokens || []).filter(
      (t: Token) => t.chainCustomId === chainCustomId // && (showHideToken ? true : t.display)
    );
    const { chainId } = networkPreferenceService.getProviderConfig();
    const multicallV2 = getMulticallAddressOf(chainId);

    /** Use multicall contract to fetch balance */
    if (multicallV2) {
      try {
        const fetchedBalances = await this._fetchBalancesByMulticall(
          multicallV2,
          tokens,
          address
        );
        tokens = tokens.map((t, idx) =>
          !fetchedBalances[idx]
            ? t
            : /** assign if balance exist */
              { ...t, amount: fetchedBalances[idx]?.toString() }
        );
      } catch (error) {
        console.error('getBalancesAsync::multicall:error:', error);
        console.warn('using legacy query now...');
        tokens = await this._getEvmBalancesLegacy(tokens, address);
      }
    } else {
      /**
       * just use legacy way if no multicall for this chain
       */
      tokens = await this._getEvmBalancesLegacy(tokens, address);
    }

    return Promise.resolve(tokens);
  }

  private async _cacheDenomTrace(hash): Promise<any> {
    let denomTrace: any;
    let denoms = cloneDeep(this.store.getState().denomTrace);
    if (denoms && denoms[hash]) {
      denomTrace = denoms[hash];
    } else {
      const denomRes = await this._fetchIbcDenom(hash).catch((e) => {
        console.error(e);
      });
      if (!denoms) denoms = {};
      (denoms as any)[hash] = denomRes;
      this.store.updateState({
        denomTrace: denoms,
      });
      if (denomRes) denomTrace = denomRes;
    }
    return Promise.resolve(denomTrace);
  }

  private _getPresetTokenCfgByDenom(denom: string): {
    chainName: string;
    name: string;
    symbol: string;
  } {
    const extra: {
      chainName: string;
      name: string;
      symbol: string;
    } = {
      chainName: '',
      name: '',
      symbol: '',
    };
    const currentToken = EmbedChainInfos.find((e: AppChainInfo) => {
      return (
        e.stakeCurrency.coinMinimalDenom === denom ||
        e.currencies.some((c) => c.coinMinimalDenom === denom)
      );
    });
    if (currentToken) {
      extra.chainName = currentToken.chainName;
      if (currentToken.stakeCurrency.coinMinimalDenom === denom) {
        extra.symbol = currentToken.stakeCurrency.coinDenom.toUpperCase();
        extra.name = currentToken.stakeCurrency.coinDenom.toUpperCase();
      } else {
        currentToken.currencies.forEach((c) => {
          if (c.coinMinimalDenom === denom) {
            extra.symbol = c.coinDenom.toUpperCase();
            extra.name = c.coinDenom.toUpperCase();
          }
        });
      }
    }
    return extra;
  }

  async getCosmosEcosystemBalancesAsync(
    address: string,
    chainCustomId: string | PresetNetworkId
  ): Promise<Token[]> {
    const chain: Network | undefined =
      networkPreferenceService.getProvider(chainCustomId);
    const balances = cloneDeep(this.store.getState().balances || {});
    // defined tokens from cache
    let currentAccountTokens: Token[] = balances[address] || [];
    const allTokens = cloneDeep(this.store.getState().tokens);
    if (chain && chain.ecoSystemParams?.rest) {
      const urlPrefix = chain.ecoSystemParams.rest;
      //cosmos1nckqhfp8k67qzvats2slqvtaf3kynz66ze6up4
      const url = `${urlPrefix}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
      const res = await fetch(url)
        .then((res) => res.json())
        .catch((e) => console.error(e));
      console.log('balance', res);
      const currentChainTokens = allTokens.filter(
        (t: Token) => t.chainCustomId === chainCustomId
      );

      if (res && res.balances?.length >= 0) {
        //current balance is 0, which is not 0 ever;
        currentAccountTokens = currentAccountTokens.filter((t: Token) => {
          if (
            t?.trace?.hash &&
            res.balances.some((b: { denom: string; amount }) => {
              if (b.denom.includes('ibc/')) {
                const hash = b.denom.split('ibc/')[1];
                return t?.trace?.hash === hash;
              }
            })
          ) {
            return true;
          } else if (
            !t?.trace?.hash &&
            res.balances.some((b: { denom: string; amount }) => {
              if (!b.denom.includes('ibc/')) {
                return t?.denom === b.denom;
              }
            })
          ) {
            return true;
          }
        });
        for (const b of res.balances) {
          // ibc tokens
          if (b.denom.includes('ibc/')) {
            const hash = b.denom.split('ibc/')[1];
            const token = currentAccountTokens.find(
              (t: Token) => t.trace?.hash === hash
            );
            if (token) {
              token.amount = b.amount;
            } else {
              const t: Token = {
                symbol: '',
                decimal: 6,
                name: '',
                denom: b.denom,
                chainCustomId,
                isNative: false,
                isCustom: false,
                display: true,
                tokenId: nanoid(),
                amount: b.amount,
              };
              // Cache denom trace
              const denomTrace: any = await this._cacheDenomTrace(hash);
              if (denomTrace) {
                const tokenInfo = this._getPresetTokenCfgByDenom(
                  denomTrace.denom
                );
                t.chainName = tokenInfo.chainName;
                t.symbol = tokenInfo.symbol;
                t.name = tokenInfo.name;
                t.trace = denomTrace;
              }
              currentAccountTokens.push(t);
            }
          } else {
            const token = currentAccountTokens.find(
              (t: Token) => t.denom === b.denom
            );
            if (token) {
              token.amount = b.amount;
            } else {
              const t = currentChainTokens.find(
                (st: Token) => st.denom === b.denom
              );
              if (t) {
                t.amount = b.amount;
                currentAccountTokens.push(t);
              }
            }
          }
        }
      }
      // Native token must display in list
      if (currentAccountTokens?.every((t: Token) => !t.isNative)) {
        const nativeToken = allTokens.find(
          (t: Token) => t.chainCustomId === chainCustomId && t.isNative
        );
        console.log('all tokens', allTokens);
        console.log('native token', nativeToken);
        if (nativeToken) {
          nativeToken.amount = 0;
          currentAccountTokens.push(cloneDeep(nativeToken));
        }
      }

      const cw20Tokens: Token[] = allTokens.filter(
        (t: Token) =>
          t.chainCustomId === chainCustomId && !t.isNative && t.contractAddress
      );
      if (cw20Tokens?.length > 0) {
        for (const t of cw20Tokens) {
          const balance = await this._queryCw20TokenBalance(
            address,
            t.contractAddress as string,
            urlPrefix
          ).catch((e) => {
            console.error(e);
          });
          if (balance) {
            const cw20Token = currentAccountTokens.find(
              (token: Token) => token.contractAddress === t.contractAddress
            );
            if (cw20Token) {
              cw20Token.amount = balance.data.balance;
            } else {
              t.amount = balance.data.balance;
              currentAccountTokens.push(t);
            }
          }
        }
      }
    }
    return Promise.resolve(currentAccountTokens);
  }

  private async _queryCw20TokenBalance(
    address: string,
    contractAddress: string,
    urlPrefix: string
  ): Promise<any> {
    const tokenInfoObj = {
      balance: {
        address,
      },
    };
    const msg = JSON.stringify(tokenInfoObj);
    const query = Buffer.from(msg).toString('base64');
    const url = `${urlPrefix}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${query}`;
    return await fetch(url)
      .then((res) => res.json())
      .catch((e) => console.error(e));
  }

  private async _fetchIbcDenom(hash: string): Promise<IDenomTrace | null> {
    const { ecoSystemParams } = networkPreferenceService.getProviderConfig();
    if (ecoSystemParams?.rest) {
      const urlPrefix = ecoSystemParams.rest;
      const url = `${urlPrefix}/ibc/apps/transfer/v1/denom_traces/${hash}`;
      const res = await fetch(url)
        .then((res) => res.json())
        .catch((e) => console.error(e));
      if (res?.denom_trace?.path && res?.denom_trace?.base_denom) {
        const pathArr = res?.denom_trace?.path.split('/');
        if (pathArr?.length % 2 === 0) {
          const traces: string[][] = [];
          for (let i = 0; i < pathArr.length; i += 2) {
            traces.push(pathArr.slice(i, i + 2));
          }
          const traceArray: ITrace[] = traces.map((t) => {
            return {
              portId: t[0],
              channelId: t[1],
            };
          });
          const denomTrace: IDenomTrace = {
            hash,
            trace: traceArray,
            denom: res?.denom_trace?.base_denom,
            path: res?.denom_trace?.path,
          };
          return Promise.resolve(denomTrace);
        }
      }
    }
    return Promise.resolve(null);
  }

  async getBalancesAsync(
    address: string,
    chainCustomId: string,
    ecosystem: Ecosystem
  ): Promise<Token[]> {
    const balances = cloneDeep(this.store.getState().balances || {});
    let tokens: Token[] = [];
    switch (ecosystem) {
      case Ecosystem.COSMOS:
        tokens = await this.getCosmosEcosystemBalancesAsync(
          address,
          chainCustomId
        );
        break;
      default:
        tokens = await this.getEvmBalancesAsync(address, chainCustomId);
        break;
    }

    balances![address] = tokens;
    this.store.updateState({
      balances,
    });
    return this.getBalancesSync(address, chainCustomId);
  }

  private async _fetchBalancesByMulticall(
    mcallAddr: string,
    tokens: Token[],
    who: string,
    requireAllSuccess = false
  ) {
    const balanceOfEncoder = MulticallHelper.encodeBalanceOf(mcallAddr, who);
    const balanceOfCalls = tokens.map(balanceOfEncoder);

    const returnData = await MulticallHelper.tryCall(
      mcallAddr,
      networkPreferenceService.getProviderConfig().rpcUrl,
      balanceOfCalls,
      requireAllSuccess
    );
    const parsedReturnData = returnData.map(
      MulticallHelper.decodeBalanceOfResult
    );
    console.debug(
      '_fetchBalancesByMulticall::parsedReturnData:',
      parsedReturnData
    );
    return parsedReturnData;
  }

  async queryTokenPrices(target = 'usd', tokenId?: string) {
    const { id } = networkPreferenceService.getProviderConfig();
    const tokensStr = this.store
      .getState()
      .tokens.filter(
        (t: Token) =>
          t.chainCustomId === id && (tokenId ? tokenId === t.tokenId : true)
      )
      .map((t: Token) => t.symbol)
      .join(',');
    if (!tokensStr) return null;
    const coinsUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tokensStr}&tsyms=${target}&api_key=87e7ef93b4e386bc370b82ad39697409db31409a808f0e8f426cb59ddabceca4`;
    const res = await fetch(coinsUrl)
      .then((res) => res.json())
      .catch((e) => console.error(e));
    const prices = {};
    if (res && res?.Response !== 'Error') {
      for (const k in res) {
        (prices as any)[k] = res[k][target.toUpperCase()];
      }
    }
    return Promise.resolve(prices);
  }

  getBalanceSync(address: string, tokenId: string): Promise<Token | undefined> {
    const tokens = ((this.store.getState().balances as any) || {})[address];
    let token;
    if (tokens && tokens.length) {
      token = cloneDeep(tokens.find((t: Token) => t.tokenId === tokenId));
    }
    return Promise.resolve(token);
  }

  async getBalanceAsync(
    address: string,
    tokenId: string
  ): Promise<Token | undefined> {
    const balances = cloneDeep(this.store.getState().balances);
    const tokens = ((balances as any) || {})[address];

    let token;
    if (tokens && tokens.length) {
      token = tokens.find((t: Token) => t.tokenId === tokenId);
      if (token.contractAddress && address) {
        const balance = await this.getERC20Balance(
          token.contractAddress,
          address
        );
        if (balance) {
          token.amount = balance;
        }
      } else if (token.isNative) {
        const balance = await this.getNativeBalance(address);
        if (balance) {
          token.amount = balance;
        }
      }
    }
    this.store.updateState({
      balances,
    });
    return this.getBalanceSync(address, tokenId);
  }

  async getERC20Balance(contractAddress, accountAddress): Promise<string> {
    const contract = networkPreferenceService
      .getCurrentEth()
      .contract(abi)
      .at(contractAddress);
    const usersToken = await contract.balanceOf(accountAddress).catch((e) => {
      console.error(e);
    });
    if (!usersToken) return '0';
    return usersToken.balance.toString();
  }

  getNativeBalance(accountAddress): Promise<string> {
    return new Promise((resolve, reject) => {
      networkPreferenceService
        .getCurrentEth()
        .getBalance(accountAddress, (error, balance) => {
          if (error) {
            console.error(error);
            reject(error);
          }
          resolve(balance?.toString());
        });
    });
  }

  async queryEvmERC20Token(
    address,
    rpc,
    contractAddress
  ): Promise<ERC20Struct> {
    const account = await networkPreferenceService
      .getCurrentEth()
      .getCode(address);
    if (account !== '0x') {
      return Promise.reject(new BitError(ErrorCode.INVALID_CONTRACT_ADDRESS));
    }
    const token: ERC20Struct = {
      name: '',
      symbol: '',
      decimals: 0,
      balanceOf: 0,
    };
    const contract = networkPreferenceService
      .getEthByNetwork(rpc)
      .contract(abi)
      .at(contractAddress);
    const res = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.balanceOf(address),
    ]).catch((e) => {
      console.error(e);
    });
    if (res && res.length === 4) {
      if (res[0] && res[0][0]) {
        token.name = res[0][0];
      }
      if (res[1] && res[1][0]) {
        token.symbol = res[1][0];
      }
      if (res[2] && res[2][0]) {
        token.decimals = res[2][0].toString();
      }
      if (res[3] && res[3][0]) {
        token.balanceOf = res[3][0].toString();
      }
    }
    return Promise.resolve(token);
  }

  async queryCosWasmCW20Token(
    address,
    urlPrefix,
    contractAddress
  ): Promise<ERC20Struct> {
    const token: ERC20Struct = {
      name: '',
      symbol: '',
      decimals: 0,
      balanceOf: 0,
    };
    const tokenInfoObj = {
      token_info: {},
    };
    const msg = JSON.stringify(tokenInfoObj);
    const query = Buffer.from(msg).toString('base64');
    const url = `${urlPrefix}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${query}`;
    const res = await fetch(url)
      .then((res) => res.json())
      .catch((e) => console.error(e));
    const balance = await this._queryCw20TokenBalance(
      address,
      contractAddress,
      urlPrefix
    ).catch((e) => {
      console.error(e);
    });
    if (res && balance) {
      token.name = res.data.name;
      token.symbol = res.data.symbol;
      token.decimals = res.data.decimals;
      token.totalSupply = res.data.total_supply;
      token.balanceOf = balance.data.balance;
    }
    return Promise.resolve(token);
  }

  queryToken(address, chainCustomId, contractAddress) {
    const chains = networkPreferenceService.getAllProviders();
    const chain = chains.find((c: Provider) => c.id === chainCustomId);
    if (chain) {
      switch (chain.ecosystem) {
        case Ecosystem.EVM:
          return this.queryEvmERC20Token(
            address,
            chain.rpcUrl,
            contractAddress
          );
        case Ecosystem.COSMOS:
          return this.queryCosWasmCW20Token(
            address,
            chain.ecoSystemParams!.rest,
            contractAddress
          );
      }
    }
  }

  changeCustomTokenProfile(chainCustomId: string, data: Partial<Token>) {
    const state = this.store.getState();
    const tokenAtIdx = cloneDeep(state.tokens || []).findIndex(
      (t: Token) => t.chainCustomId === chainCustomId && t.isNative == true
    );
    if (tokenAtIdx === -1) {
      throw new BitError(ErrorCode.CUSTOM_TOKEN_MISSING);
    }
    /**
     * filter the new token data
     */
    Object.keys(data).forEach((k) => {
      // no undefined nor null
      if (data[k] === undefined || data[k] === null) {
        delete data[k];
      }
    });
    state.tokens[tokenAtIdx] = {
      ...state.tokens[tokenAtIdx],
      // override with new data
      ...data,
    };
  }
}

export default new TokenService();
