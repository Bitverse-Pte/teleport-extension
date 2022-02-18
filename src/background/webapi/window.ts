import platform from 'background/service/extension';
import { EventEmitter } from 'events';
import { IS_WINDOWS } from 'constants/index';
import { browser, Windows } from 'webextension-polyfill-ts';

const event = new EventEmitter();

// if focus other windows, then reject the approval
browser.windows.onFocusChanged.addListener((winId) => {
  event.emit('windowFocusChange', winId);
});

browser.windows.onRemoved.addListener((winId) => {
  event.emit('windowRemoved', winId);
});

const BROWSER_HEADER = 80;
const WINDOW_SIZE = {
  width: 360 + (IS_WINDOWS ? 14 : 0), // idk why windows cut the width.
  height: 600,
};

const create = async ({ url, ...rest }): Promise<number | undefined> => {
  const {
    top: cTop,
    left: cLeft,
    width,
  } = await browser.windows.getCurrent({
    windowTypes: ['normal'],
  } as Windows.GetInfo);

  const top = cTop! + BROWSER_HEADER;
  const left = cLeft! + width! - WINDOW_SIZE.width;

  const win = await platform.openWindow({
    focused: true,
    url,
    type: 'popup',
    top,
    left,
    ...WINDOW_SIZE,
    ...rest,
  });

  // shim firefox
  if (win.left !== left) {
    await platform.updateWindowPosition(win.id, left, top);
  }

  return win.id;
};

const remove = async (winId) => {
  return browser.windows.remove(winId);
};

const openNotification = ({ route = '', ...rest } = {}): Promise<
  number | undefined
> => {
  const url = `notification.html${route && `#${route}`}`;
  return create({ url, ...rest });
};

export default {
  openNotification,
  event,
  remove,
};
