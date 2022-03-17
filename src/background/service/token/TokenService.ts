import { AddTokenOpts, ERC20Struct, ITokenStore, Token } from 'types/token';
import { TOKEN_STORE_KEY } from 'constants/chain';
import cloneDeep from 'lodash/cloneDeep';
import { DEFAULT_TOKEN_CONFIG } from 'constants/token';
import { nanoid } from 'nanoid';
import { networkPreferenceService } from 'background/service';
import abi from 'human-standard-token-abi';
import { TOKEN_THEME_COLOR } from 'constants/wallet';
import BitError from 'error';
import { ErrorCode } from 'constants/code';
import { ObservableStorage } from 'background/utils/obsStorage';

class TokenService {
  store: ObservableStorage<ITokenStore>;

  constructor() {
    this.store = new ObservableStorage<ITokenStore>(TOKEN_STORE_KEY, {
      tokens: [],
      balances: null,
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

  private _getRandomColor(): string {
    const length = TOKEN_THEME_COLOR.length;
    const randomNumber = Math.floor(Math.random() * length);
    return TOKEN_THEME_COLOR[randomNumber];
  }

  private _checkDuplicateToken(chainCustomId, contractAddress): boolean {
    return !!this.getAllTokens(chainCustomId).find(
      (t: Token) => t.contractAddress === contractAddress
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
      demon: '',
      icon: '',
      chainCustomId: tokenParams.chainCustomId,
      isNative: tokenParams.isNative,
      contractAddress: tokenParams.contractAddress || '',
      track: '',
      isCustom: true,
      display: true,
      themeColor: this._getRandomColor(),
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

  getBalancesSync(
    address: string,
    chainCustomId: string
    //showHideToken = false
  ): Promise<Token[]> {
    let tokens: Token[] = [];
    if (this.store.getState().balances) {
      const clonedBalances = cloneDeep(this.store.getState().balances);
      if (clonedBalances && clonedBalances[address]) {
        tokens = clonedBalances[address].filter(
          (t: Token) => t.chainCustomId === chainCustomId //&&
          //(showHideToken ? true : t.display)
        );
      }
    }
    return Promise.resolve(tokens);
  }

  async getBalancesAsync(
    address: string,
    chainCustomId: string
    //showHideToken = false
  ): Promise<Token[]> {
    const tokens: Token[] = cloneDeep(
      this.store.getState().tokens || []
    ).filter(
      (t: Token) => t.chainCustomId === chainCustomId // && (showHideToken ? true : t.display)
    );
    const balances = cloneDeep(this.store.getState().balances || {});
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
    balances![address] = tokens;
    this.store.updateState({
      balances,
    });
    return this.getBalancesSync(address, chainCustomId /* , showHideToken */);
  }

  async queryTokenPrices(target = 'usd') {
    const currentChain = networkPreferenceService.getProviderConfig().type;
    //TODO(Jayce) needs to be uncommented；
    //if (currentChain !== 'ethereum') return Promise.resolve(null);
    const tokensStr = this.store
      .getState()
      .tokens.map((t: Token) => t.symbol)
      .join(',');
    if (!tokensStr) return Promise.reject('no token found');
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

  async queryToken(address, rpc, contractAddress): Promise<ERC20Struct> {
    const account = await networkPreferenceService.getCurrentEth().getCode(address);
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
