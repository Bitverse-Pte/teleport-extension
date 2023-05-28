// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Message } from 'utils';
import { nanoid } from 'nanoid';
import extension from 'extensionizer';

const channelName = nanoid();

// the inline script element is banned in v3
const container = document.head || document.documentElement;
const ele = document.createElement('script');
ele.src = extension.runtime.getURL('pageProvider.js');
ele.onload = function () {
  console.log('script injected');
  // when script injected -> send INIT_TELEPORT_PROVIDER event to page
  window.postMessage({
    type: 'INIT_TELEPORT_PROVIDER',
    channelName: channelName,
  });
};
container.insertBefore(ele, container.children[0]);
container.removeChild(ele);
window.ufo = 'ufov';
console.log('=========== content script');

const { BroadcastChannelMessage, PortMessage } = Message;
const pm = new PortMessage().connect();

const bcm = new BroadcastChannelMessage(channelName).listen((data) => {
  pm.request(data);
});
// background notification
pm.on('message', (data) => {
  bcm.send('message', data);
});
// eth response notification
pm.on('eth_response', (data) => {
  bcm.send('eth_response', data);
});

document.addEventListener('beforeunload', () => {
  bcm.dispose();
  pm.dispose();
});
