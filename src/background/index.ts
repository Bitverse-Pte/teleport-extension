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

const { PortMessage } = Message;

let appStoreLoaded = false;

/*Sentry.init({
  dsn:
    'https://e871ee64a51b4e8c91ea5fa50b67be6b@o460488.ingest.sentry.io/5831390',
  integrations: [new Integrations.BrowserTracing()],
  release: process.env.release,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
});*/

// function initAppMeta() {
//   const head = document.querySelector('head');
//   const icon = document.createElement('link');
//   icon.href = '/images/logo.png';
//   icon.rel = 'icon';
//   head?.appendChild(icon);
//   const name = document.createElement('meta');
//   name.name = 'name';
//   name.content = 'TeleportWallet';
//   head?.appendChild(name);
//   const description = document.createElement('meta');
//   description.name = 'description';
//   description.content = i18n.t('appDescription');
//   head?.appendChild(description);
// }

async function restoreAppState() {
  const keyringState = await storage.get('keyringState');
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
  });

  appStoreLoaded = true;
  // initAppMeta();
}

function updateBadge() {
  const count = notificationService.getApproval() ? '1' : '';
  chrome.action.setBadgeText({ text: count });
  chrome.action.setBadgeBackgroundColor({ color: '#1484F5' });
}

restoreAppState();
updateBadge();
notificationService.on(UPDATE_BADGE, updateBadge);

// for page provider
browser.runtime.onConnect.addListener((port) => {
  if (
    port.name === 'popup' ||
    port.name === 'notification' ||
    port.name === 'tab'
  ) {
    const pm = new PortMessage(port);
    pm.listen((data) => {
      if (data?.type) {
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
