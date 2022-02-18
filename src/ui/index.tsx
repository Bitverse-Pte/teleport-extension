import './wdyr';
import React from 'react';
import ReactDOM from 'react-dom';
import Views from './views';
import { Message } from 'utils';
import skynet from 'utils/skynet';
import { getUITypeName } from 'ui/utils';
import eventBus from 'eventBus';
import i18n, { addResourceBundle } from '../i18n';
import { EVENTS } from '../constants/index';
import '../i18n';
import configureStore from './store/store';

// import './style/index.less'; //remove import index.less, using a built css, as the content of this file is usually not modified
import './iconfont/iconfont.js';

/*Sentry.init({
  dsn:
      'https://e871ee64a51b4e8c91ea5fa50b67be6b@o460488.ingest.sentry.io/5831390',
  integrations: [new Integrations.BrowserTracing()],
  release: process.env.release,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});*/

// For fix chrome extension render problem in external screen
if (
  // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
  window.screenLeft < 0 ||
  window.screenTop < 0 ||
  window.screenLeft > window.screen.width ||
  window.screenTop > window.screen.height
) {
  chrome.runtime.getPlatformInfo(function (info) {
    if (info.os === 'mac') {
      const fontFaceSheet = new CSSStyleSheet();
      fontFaceSheet.insertRule(`
        @keyframes redraw {
          0% {
            opacity: 1;
          }
          100% {
            opacity: .99;
          }
        }
      `);
      fontFaceSheet.insertRule(`
        html {
          animation: redraw 1s linear infinite;
        }
      `);
      (document as any).adoptedStyleSheets = [
        ...(document as any).adoptedStyleSheets,
        fontFaceSheet,
      ];
    }
  });
}

function initAppMeta() {
  const head = document.querySelector('head');
  const icon = document.createElement('link');
  icon.href = '/images/logo.png';
  icon.rel = 'icon';
  head?.appendChild(icon);
  const name = document.createElement('meta');
  name.name = 'name';
  name.content = 'TeleportWallet';
  head?.appendChild(name);
  const description = document.createElement('meta');
  description.name = 'description';
  description.content = i18n.t('appDescription');
  head?.appendChild(description);
}

initAppMeta();

skynet.start();

const { PortMessage } = Message;

const portMessageChannel = new PortMessage();
portMessageChannel.connect(getUITypeName());

const wallet: Record<string, any> = new Proxy(
  {},
  {
    get(obj, key) {
      switch (key) {
        default:
          return function (...params: any) {
            return portMessageChannel.request({
              type: 'controller',
              method: key,
              params,
            });
          };
      }
    },
  }
);

portMessageChannel.listen((data) => {
  if (data.type === 'broadcast') {
    eventBus.emit(data.method, data.params);
  }
});

eventBus.addEventListener(EVENTS.broadcastToBackground, (data) => {
  portMessageChannel.request({
    type: 'broadcast',
    method: data.method,
    params: data.data,
  });
});

async function queryCurrentActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const [activeTab] = tabs;
      const { id, title, url } = activeTab;
      const u = url ? new URL(url) : ({} as any);
      const origin = u.origin;
      const protocol = u.protocol;
      if (!origin || origin === 'null') {
        resolve({});
        return;
      }
      resolve({ id, title, origin, protocol, url });
    });
  });
}

async function launchTeleportWalletUi() {
  const activeTab = await queryCurrentActiveTab();

  const store = configureStore();
  wallet.getLocale().then((locale) => {
    addResourceBundle(locale).then(() => {
      i18n.changeLanguage(locale);
      // no need to wait, just let it do the job
      // more like a temp fix
      wallet.useCurrentSelectedNetwork();
      // setupWeb3Connection();
      ReactDOM.render(
        <Views store={store} wallet={wallet} />,
        document.getElementById('root')
      );
    });
  });
}

launchTeleportWalletUi();
