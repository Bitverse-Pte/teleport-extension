import { ethErrors } from 'eth-rpc-errors';
import { EthereumProviderError } from 'eth-rpc-errors/dist/classes';
import { winMgr } from 'background/webapi';
import { preferenceService } from 'background/service';
import { browser } from 'webextension-polyfill-ts';
import EventEmitter from 'events';

interface Approval {
  data?: {
    state: number;
    params?: any;
    origin?: string;
    approvalComponent: string;
    requestDefer?: Promise<any>;
    approvalType: string;
  };
  waiting: boolean;
  resolve?(params?: any): void;
  reject?(err: EthereumProviderError<any>): void;
}

export const UPDATE_BADGE = 'UPDATE_BADGE';
// something need user approval in window
// should only open one window, unfocus will close the current notification
class NotificationService extends EventEmitter {
  approval: Approval | null = null;
  notifiWindowId = 0;
  isLocked = false;

  constructor() {
    super();
    winMgr.event.on('windowRemoved', (winId: number) => {
      if (winId === this.notifiWindowId) {
        this.notifiWindowId = 0;
      }
    });

    winMgr.event.on('windowFocusChange', (winId: number) => {
      if (this.notifiWindowId && winId !== this.notifiWindowId) {
        console.info('winId:', winId);
        console.info('notifiWindowId:', this.notifiWindowId);
        if (
          winId === chrome.windows.WINDOW_ID_NONE ||
          // for dev debug use
          process.env.BUILD_ENV === 'DEV'
        ) {
          // Wired issue: When notification popuped, will focus to -1 first then focus on notification
          return;
        }
        this.rejectApproval();
      }
    });
  }

  getApproval = () => this.approval?.data;

  resolveApproval = (data?: any) => {
    console.log('============resolveApproval(data)==========', data);
    this.approval?.resolve && this.approval?.resolve(data);
    this.approval = null;
    this.emit(UPDATE_BADGE);
  };

  rejectApproval = async (err?: string) => {
    console.log('============rejectApproval(err)==========', err);
    this.approval?.reject &&
      this.approval?.reject(ethErrors.provider.userRejectedRequest<any>(err));
    await this.clear();
    this.emit(UPDATE_BADGE);
  };

  // currently it only support one approval at the same time
  requestApproval = async (data, winProps?): Promise<any> => {
    // if the request comes into while user approving
    if (this.approval && !this.approval.waiting) {
      throw ethErrors.provider.userRejectedRequest(
        'please request after current approval resolve'
      );
    }
    console.log('============requestApproval(data)==========', data);
    return new Promise((resolve, reject) => {
      this.approval = {
        data,
        waiting: false,
        resolve,
        reject,
      };
      this.emit(UPDATE_BADGE);
      !preferenceService.popupOpen && this.openNotification(winProps);
    });
  };

  clear = async () => {
    this.approval = null;
    if (this.notifiWindowId) {
      await winMgr.remove(this.notifiWindowId);
      this.notifiWindowId = 0;
    }
  };

  unLock = () => {
    this.isLocked = false;
  };

  lock = () => {
    this.isLocked = true;
  };

  openNotification = (winProps) => {
    // remove the isLocked check because we check the lock before, need to check later
    // if (this.isLocked) return;
    // this.lock();
    if (this.notifiWindowId) {
      winMgr.remove(this.notifiWindowId);
      this.notifiWindowId = 0;
    }
    winMgr.openNotification(winProps).then((winId) => {
      this.notifiWindowId = winId!;
    });
  };
}

export default new NotificationService();
