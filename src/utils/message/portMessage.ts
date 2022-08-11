import { Runtime, browser } from 'webextension-polyfill-ts';
import Message from './index';
class PortMessage extends Message {
  port: Runtime.Port | null = null;
  listenCallback: any;

  constructor(port?: Runtime.Port) {
    super();

    if (port) {
      this.port = port;
    }
  }
  isPortMessage(): boolean {
    return true;
  }
  connect = (name?: string) => {
    console.error('begin connecting, connect name is:', name);
    this.port = browser.runtime.connect(undefined, name ? { name } : undefined);
    this.port.onMessage.addListener(({ _type_, data }) => {
      if (_type_ === `${this._EVENT_PRE}message`) {
        this.emit('message', data);
        return;
      }

      if (_type_ === `${this._EVENT_PRE}response`) {
        this.onResponse(data);
        this.emit('eth_response', data);
      }
    });

    this.port.onDisconnect.addListener(() => {
      console.error('service worker disconnected, reconnecting...  name:', name);
      this.connect(name);
      this._listen();
    });

    return this;
  };

  listen = (listenCallback: any) => {
    this.listenCallback = listenCallback;
    return this._listen();
  };

  _listen() {
    if (!this.port) return;
    this.port.onMessage.addListener(({ _type_, data }) => {
      if (_type_ === `${this._EVENT_PRE}request`) {
        this.onRequest(data);
      }
    });

    return this;
  }

  send = (type, data) => {
    if (!this.port) return;
    try {
      this.port.postMessage({ _type_: `${this._EVENT_PRE}${type}`, data });
    } catch (e) {
      // DO NOTHING BUT CATCH THIS ERROR
    }
  };

  dispose = () => {
    this._dispose();
    this.port?.disconnect();
  };
}

export default PortMessage;
