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
import deepmerge from 'deepmerge';
import { SecretUtils } from 'secretjs/types/enigmautils';
import Long from 'long';

const log = (event, ...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `%c [teleport-cosmos] (${new Date()
        .toTimeString()
        .substr(0, 8)}) ${event}`,
      'font-weight: bold; background-color: #374D80; color: white;',
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
  private _dedupePromise = new DedupePromise([]);
  private _bcm: BroadcastChannelMessage;

  constructor({
    bcm,
    maxListeners = 200,
  }: {
    bcm: BroadcastChannelMessage;
    maxListeners?: number;
  }) {
    super();
    this._bcm = bcm;
    this.setMaxListeners(maxListeners);
    this.initialize();
    this._pushEventHandlers = new PushEventHandlers(this);
  }
  version = 'x.x.x';
  mode: KeplrMode = 'extension';
  defaultOptions: KeplrIntereactionOptions = {};
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
      this._requestPromise.check(2);
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
    return this._dedupePromise.call(method, () => this._request(proxyMessage));
  }

  _request = async (proxyMessage) => {
    this._requestPromise.check(1);
    this._requestPromise.check(2);
    return this._requestPromise.call(() => {
      log('[request]', JSON.stringify(proxyMessage, null, 2));
      return this._bcm
        .request(proxyMessage)
        .then((res) => {
          const result = JSONUint8Array.unwrap(res);
          log('[response: success]', proxyMessage.method, result);
          return result;
        })
        .catch((err) => {
          const result = JSONUint8Array.unwrap(err);
          log('[response: error]', proxyMessage.method, result);
          return result;
        });
    });
  };

  async getKey(chainId: string): Promise<Key> {
    console.log('=====CosmosProvider.getKey=====');
    return await this.requestMethod('getKey', [chainId]);
  }

  async enable(chainIds: string | string[]): Promise<void> {
    await this.requestMethod('enable', [chainIds]);
  }

  some() {
    console.log('this:', this);
  }

  getOfflineSigner(chainId: string): OfflineSigner & OfflineDirectSigner {
    return new CosmJSOfflineSigner(chainId, this);
  }

  async experimentalSuggestChain(chainInfo: CosmosChainInfo): Promise<void> {
    return await this.requestMethod('experimentalSuggestChain', [chainInfo]);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    return await this.requestMethod('signAmino', [
      chainId,
      signer,
      signDoc,
      signOptions,
    ]);
  }

  async signDirect(
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
    const result = await this.requestMethod('signDirect', [
      chainId,
      signer,
      // We can't send the `Long` with remaing the type.
      // Receiver should change the `string` to `Long`.
      {
        bodyBytes: signDoc.bodyBytes,
        authInfoBytes: signDoc.authInfoBytes,
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber
          ? signDoc.accountNumber.toString()
          : null,
      },
      signOptions,
    ]);

    const signed: {
      bodyBytes: Uint8Array;
      authInfoBytes: Uint8Array;
      chainId: string;
      accountNumber: string;
    } = result.signed;

    return {
      signed: {
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        chainId: signed.chainId,
        // We can't send the `Long` with remaing the type.
        // Sender should change the `Long` to `string`.
        accountNumber: Long.fromString(signed.accountNumber),
      },
      signature: result.signature,
    };
  }

  async sendTx(
    chainId: string,
    tx: Uint8Array,
    mode: BroadcastMode
  ): Promise<Uint8Array> {
    if (!('length' in tx)) {
      console.log(
        'Do not send legacy std tx via `sendTx` API. We now only support protobuf tx. The usage of legeacy std tx would throw an error in the near future.'
      );
    }

    return await this.requestMethod('sendTx', [chainId, tx, mode]);
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
}
