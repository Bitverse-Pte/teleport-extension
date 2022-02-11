/**
 * this script is live in content-script / dapp's page
 */

import { EventEmitter } from 'events';
import { ethErrors } from 'eth-rpc-errors';

abstract class Message extends EventEmitter {
  // avaiable id list
  // max concurrent request limit
  private static readonly MAX_CONCURRENT_CONNECTIONS = 500;
  private _requestIdPool = [
    ...Array(Message.MAX_CONCURRENT_CONNECTIONS).keys(),
  ];
  private _requestPoolRounds = 0;
  protected lastTimePoolResetAt: number = Date.now();

  protected _EVENT_PRE = 'ETH_WALLET_';
  protected listenCallback: any;

  private _waitingMap = new Map<
    number,
    {
      data: any;
      resolve: (arg: any) => any;
      reject: (arg: any) => any;
    }
  >();

  abstract send(type: string, data: any): void;

  abstract isPortMessage(): boolean;

  request = (data) => {
    if (this._requestIdPool.length == 0) {
      /**
       * Anti internal message DDOS
       */
      if (Date.now() - this.lastTimePoolResetAt <= 1000 * 10) {
        console.error(
          'Message: too many request in 10 sec, the message pool is empty now'
        );
        throw ethErrors.rpc.limitExceeded();
      } else {
        /**
         * Avoid long time running that drain the pool
         */
        this._requestPoolRounds += 1;
        /**
         * we add a base to new pools of connection id
         * in case some old id are recycled that possibly caused collide
         */
        const baseOfNewId =
          Message.MAX_CONCURRENT_CONNECTIONS * this._requestPoolRounds;
        this._requestIdPool = [
          ...Array(Message.MAX_CONCURRENT_CONNECTIONS).keys(),
        ].map((id) => id + baseOfNewId);
        // Mark the time reset the pool in case if buggy code send too many msg
        this.lastTimePoolResetAt = Date.now();
      }
    }
    const ident = this._requestIdPool.shift()!;
    return new Promise((resolve, reject) => {
      this._waitingMap.set(ident, {
        data,
        resolve,
        reject,
      });
      this.send('request', { ident, data });
    });
  };

  onResponse = async ({ ident, res, err }: any = {}) => {
    // the url may update
    if (!this._waitingMap.has(ident)) {
      return;
    }
    const { resolve, reject } = this._waitingMap.get(ident)!;
    this._requestIdPool.push(ident);
    this._waitingMap.delete(ident);
    err ? reject(err) : resolve(res);
  };

  onRequest = async ({ ident, data }) => {
    if (this.listenCallback) {
      let res, err;

      try {
        res = await this.listenCallback(data);
      } catch (e: any) {
        err = {
          message: e.message,
          stack: e.stack,
        };
        e.code && (err.code = e.code);
        e.data && (err.data = e.data);
      }
      // send ETH_WALLET_response message
      if (this.isPortMessage()) {
        this.send('response', { ident, res, err });
      }
    }
  };

  _dispose = () => {
    for (const request of this._waitingMap.values()) {
      request.reject(ethErrors.provider.userRejectedRequest());
    }

    this._waitingMap.clear();
  };
}

export default Message;
