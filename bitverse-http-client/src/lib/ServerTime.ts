import { baseURLMainNet } from './config';

class ServerTime {
  private _systime: number;
  private _difftime: number;

  constructor() {
    this._systime = 0;
    this._difftime = 0;
  }

  async init() {
    try {
      const response = await fetch(`${baseURLMainNet}/v3/public/time`);
      const { retCode, result } = await response.json();
      if (retCode === 0) {
        const { timeSecond } = result;
        this._systime = timeSecond * 1000;
        console.log('[server time] _systime =', this._systime);
        this._difftime = Date.now() - this._systime;
        console.log('[server time] _difftime =', this._difftime);
      }
    } catch (error) {
      console.error('get server time error: ', error);
    }
  }

  getServerTime() {
    if (this._systime === null) {
      throw new Error('Server time not initialized');
    }
    return this._systime;
  }

  getClientTime() {
    return Date.now();
  }

  getTimestamp() {
    if (this._difftime === null) {
      throw new Error('Server time not initialized');
    }
    return this.getClientTime() + this._difftime;
  }
}

export default ServerTime;
