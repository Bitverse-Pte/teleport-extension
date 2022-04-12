import { ethErrors } from 'eth-rpc-errors';
import { EthereumProviderError } from 'eth-rpc-errors/dist/classes';
import { winMgr } from 'background/webapi';
import { IS_CHROME, IS_LINUX } from 'constants/index';
import { preferenceService, txController } from 'background/service';

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

// something need user approval in window
// should only open one window, unfocus will close the current notification
class NotificationService {
  approval: Approval | null = null;
  notifiWindowId = 0;
  isLocked = false;

  constructor() {
    winMgr.event.on('windowRemoved', (winId: number) => {
      if (winId === this.notifiWindowId) {
        this.notifiWindowId = 0;
      }
    });

    winMgr.event.on('windowFocusChange', (winId: number) => {
      if (this.notifiWindowId && winId !== this.notifiWindowId) {
        console.info('winId:', winId);
        console.info('notifiWindowId:', this.notifiWindowId);
        this.rejectApproval();
      }
    });
  }

  getApproval = () => this.approval?.data;

  resolveApproval = (data?: any) => {
    console.log('============resolveApproval(data)==========', data);
    this.approval?.resolve && this.approval?.resolve(data);
    this.approval = null;
  };

  rejectApproval = async (err?: string) => {
    this.approval?.reject &&
      this.approval?.reject(ethErrors.provider.userRejectedRequest<any>(err));
    await this.clear();
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
    if (this.isLocked) return;
    this.lock();
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
