import EventEmitter from 'events';
import BroadcastChannelMessage from 'utils/message/broadcastChannelMessage';
import PushEventHandlers from './pushEventHandlers';
import { domReadyCall, $ } from './utils';
import ReadyPromise from './readyPromise';
import DedupePromise from './dedupePromise';
import {
  CosmosChainInfo,
  Keplr,
  KeplrIntereactionOptions,
  KeplrMode,
  KeplrSignOptions,
  Key,
} from 'types/cosmos';
import { JSONUint8Array } from 'utils/cosmos/json-uint8-array';
import { CosmJSOfflineSigner } from './cosmjs';
import {
  AminoSignResponse,
  BroadcastMode,
  OfflineSigner,
  StdSignature,
  StdSignDoc,
} from '@cosmjs/launchpad';
import { DirectSignResponse, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { Long } from 'long';
import { SecretUtils } from 'secretjs/types/enigmautils';

const log = (event, ...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `%c [teleport] (${new Date().toTimeString().substr(0, 8)}) ${event}`,
      'font-weight: bold; background-color: #6AB5FF; color: white;',
      ...args
    );
  }
};

/**
 * CosmosProvider would be injected to the webpage.
 * To request some methods of the extension, this will proxy the request to the content script that is injected to webpage on the extension level.
 * This will use `window.postMessage` to interact with the content script.
 */

export class CosmosProvider extends EventEmitter implements Keplr {
  private _pushEventHandlers: PushEventHandlers;
  private _requestPromise = new ReadyPromise(2);
  private _bcm: BroadcastChannelMessage;

  constructor({ channelName = '', maxListeners = 200 } = {}) {
    super();
    this._bcm = new BroadcastChannelMessage(channelName);
    this.setMaxListeners(maxListeners);
    this.initialize();
    this._pushEventHandlers = new PushEventHandlers(this);
  }
  version = 'x.x.x';
  mode: KeplrMode = 'extension';
  defaultOptions: KeplrIntereactionOptions = {};
  experimentalSuggestChain(chainInfo: CosmosChainInfo): Promise<void> {
    throw new Error('Method not implemented.');
  }
  signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    throw new Error('Method not implemented.');
  }
  signDirect(
    chainId: string,
    signer: string,
    signDoc: {
      bodyBytes?: Uint8Array | null | undefined;
      authInfoBytes?: Uint8Array | null | undefined;
      chainId?: string | null | undefined;
      accountNumber?: Long | null | undefined;
    },
    signOptions?: KeplrSignOptions
  ): Promise<DirectSignResponse> {
    throw new Error('Method not implemented.');
  }
  sendTx(
    chainId: string,
    tx: Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    throw new Error('Method not implemented.');
  }
  verifyArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array,
    signature: StdSignature
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getOfflineSignerOnlyAmino(chainId: string): OfflineSigner {
    throw new Error('Method not implemented.');
  }
  getOfflineSignerAuto(
    chainId: string
  ): Promise<OfflineSigner | OfflineDirectSigner> {
    throw new Error('Method not implemented.');
  }
  suggestToken(
    chainId: string,
    contractAddress: string,
    viewingKey?: string
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getSecret20ViewingKey(
    chainId: string,
    contractAddress: string
  ): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getEnigmaUtils(chainId: string): SecretUtils {
    throw new Error('Method not implemented.');
  }
  getEnigmaPubKey(chainId: string): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  getEnigmaTxEncryptionKey(
    chainId: string,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  enigmaEncrypt(
    chainId: string,
    contractCodeHash: string,
    msg: object
  ): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  enigmaDecrypt(
    chainId: string,
    ciphertext: Uint8Array,
    nonce: Uint8Array
  ): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  initialize = async () => {
    this._bcm.connect().on('message', this._handleBackgroundMessage);
    domReadyCall(() => {
      const origin = top?.location.origin;
      const icon =
        ($('head > link[rel~="icon"]') as HTMLLinkElement)?.href ||
        ($('head > meta[itemprop="image"]') as HTMLMetaElement)?.content;
      const name =
        document.title ||
        ($('head > meta[name="title"]') as HTMLMetaElement)?.content ||
        origin;
    });
  };

  private _handleBackgroundMessage = ({ event, data }) => {
    if (this._pushEventHandlers[event]) {
      return this._pushEventHandlers[event](data);
    }
    this.emit(event, data);
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected requestMethod(method: string, args: any[]): Promise<any> {
    const id: string = Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((value) => {
        return value.toString(16);
      })
      .join('');

    const proxyMessage = {
      type: 'cosmos-proxy-request',
      id,
      method,
      args: JSONUint8Array.wrap(args),
    };
    this._requestPromise.uncheck(1);
    return this._requestPromise.call(() => {
      log('[request]', JSON.stringify(proxyMessage, null, 2));
      this._bcm
        .request(proxyMessage)
        .then((res) => {
          log('[response: success]', proxyMessage.method, res);
          return res;
        })
        .catch((err) => {
          log('[response: error]', proxyMessage.method, err);
          return err;
        });
    });
  }

  async getKey(chainId: string): Promise<Key> {
    return await this.requestMethod('getKey', [chainId]);
  }

  async enable(chainIds: string | string[]): Promise<void> {
    await this.requestMethod('enable', [chainIds]);
  }

  getOfflineSigner(chainId: string): OfflineSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this);
  }
}
