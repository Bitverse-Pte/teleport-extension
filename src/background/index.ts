import 'reflect-metadata';
import { browser } from 'webextension-polyfill-ts';
import { ethErrors } from 'eth-rpc-errors';
import { WalletController } from 'background/controller/wallet';
import { Message } from 'utils';
import { EVENTS } from 'constants/index';
import { storage } from './webapi';
import {
  permissionService,
  preferenceService,
  sessionService,
  keyringService,
  TokenService,
  knownMethodService,
  networkPreferenceService,
  latestBlockDataHub,
  txController,
  contactBookService,
  notificationService,
} from './service';
import { providerController, walletController } from './controller';
import i18n from './service/i18n';
import eventBus from 'eventBus';
import DataSyncService from './service/dataSyncService';
import { UPDATE_BADGE } from './service/notification';
import { cosmosTxHistoryStorage } from './service/transactions/cosmos/cosmos';
const { PortMessage } = Message;
import httpClient from '../../bitverse-http-client';

let appStoreLoaded = false;

const testHttp = async () => {
  // setWalletManagePopupVisible(true);
  // 接口1：需要签名的接口
  const baseURLMainNet = 'https://api.bitverse.zone';
  const apiUrl1 = `${baseURLMainNet}/bitverse/bitdapp/v1/public/quest/activity/get`;

  try {
    // 如有需要,可以通过传递第三个参数控制headers
    const result = await httpClient.post(
      apiUrl1,
      {
        activityId: '123456',
      },
      {
        'x-test-key': 'test',
      }
    );
    console.log('[response ok]:', result);
  } catch (error) {
    console.log('[response error]: ', error);
  }
};

setTimeout(() => {
  testHttp();
}, 5 * 1000);

async function restoreAppState() {
  console.log('restoreAppState');
  const keyringState = await storage.get('keyringState');
  console.log('-----restoreAppState', keyringState);
  keyringService.loadStore(keyringState);
  keyringService.store.subscribe((value) => storage.set('keyringState', value));

  await Promise.all([
    permissionService.init(),
    preferenceService.init(),
    TokenService.init(),
    contactBookService.init(),
  ]);

  new DataSyncService({
    tokenStore: TokenService.store,
    transactionHistory: txController.store,
    knownMethod: knownMethodService.store,
    preference: preferenceService.store,
    networkStore: networkPreferenceService.networkStore,
    customNetworksStore: networkPreferenceService.customNetworksStore,
    latestBlockData: latestBlockDataHub.store,
    cosmosTxHistory: cosmosTxHistoryStorage,
  });

  appStoreLoaded = true;
  // initAppMeta();
}

function updateBadge() {
  const count = notificationService.getApproval() ? '1' : '';
  chrome.action.setBadgeText({ text: count });
  chrome.action.setBadgeBackgroundColor({ color: '#56FAA5' });
}

restoreAppState();
updateBadge();
notificationService.on(UPDATE_BADGE, updateBadge);

// for page provider
browser.runtime.onConnect.addListener((port) => {
  console.log(
    '----- background browser.runtime.onConnect.addListener port',
    port
  );
  if (
    port.name === 'popup' ||
    port.name === 'notification' ||
    port.name === 'tab'
  ) {
    const pm = new PortMessage(port);
    pm.listen((data) => {
      if (data?.type) {
        console.log(
          '----- background browser.runtime.onConnect.addListener PortMessage',
          data
        );
        switch (data.type) {
          case 'broadcast':
            eventBus.emit(data.method, data.params);
            break;
          case 'controller':
          default:
            if (data.method) {
              return walletController[data.method].apply(null, data.params);
            }
        }
      }
    });

    const broadcastCallback = (data: any) => {
      pm.request({
        type: 'broadcast',
        method: data.method,
        params: data.params,
      });
    };

    if (port.name === 'popup' || port.name == 'tab') {
      preferenceService.setPopupOpen(true);

      port.onDisconnect.addListener(() => {
        preferenceService.setPopupOpen(false);
      });
    }

    eventBus.addEventListener(EVENTS.broadcastToUI, broadcastCallback);
    port.onDisconnect.addListener(() => {
      eventBus.removeEventListener(EVENTS.broadcastToUI, broadcastCallback);
    });

    return;
  }

  if (!port.sender?.tab) {
    return;
  }

  const pm = new PortMessage(port);

  pm.listen(async (data) => {
    if (!appStoreLoaded) {
      throw ethErrors.provider.disconnected();
    }

    const sessionId = port.sender?.tab?.id;
    const session = sessionService.getOrCreateSession(sessionId);

    const req = { data, session };
    // for background push to respective page
    req.session.pushMessage = (event, data) => {
      pm.send('message', { event, data });
    };
    return providerController(req);
  });
});

declare global {
  interface Window {
    wallet: WalletController;
  }
}

// for popup operate
window.wallet = new Proxy(walletController, {
  get(target, propKey, receiver) {
    if (!appStoreLoaded) {
      throw ethErrors.provider.disconnected();
    }
    return Reflect.get(target, propKey, receiver);
  },
});
