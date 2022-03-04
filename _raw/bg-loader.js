try {
  importScripts('/webextension-polyfill.js', '/vendors.js', '/background.js');
} catch (e) {
  console.error(e);
}
  