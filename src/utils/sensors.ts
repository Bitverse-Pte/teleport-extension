import sensors from 'sa-sdk-javascript';

export const isObject = (value) => {
  const type = typeof value;
  return !!value && (type == 'object' || type == 'function');
};

const isPC = () => {
  const ua = navigator.userAgent;

  const isAndroid = /(?:Android)/.test(ua);
  const isFireFox = /(?:Firefox)/.test(ua);
  const isTablet =
    /(?:iPad|PlayBook)/.test(ua) ||
    (isAndroid && !/(?:Mobile)/.test(ua)) ||
    (isFireFox && /(?:Tablet)/.test(ua));
  const isIPhone = /(?:iPhone)/.test(ua) && !isTablet;

  return !isIPhone && !isAndroid;
};

const getReferrerPath = () => {
  if (!document.referrer) return '';
  if (window.URL) return new URL(document.referrer).pathname;
  const parser = document.createElement('a');
  parser.href = document.referrer;
  return parser.pathname;
};

const RUNTIME_ENV = process.env.BUILD_ENV || 'TEST';

export const init = (initOpts: any = { heatmap: {} }, registerOpts = {}) => {
  // must provide data server url
  if (!isObject(initOpts) || !initOpts.server_url) return;

  sensors.init({
    is_track_single_page: true,
    send_type: 'beacon',
    heatmap: {
      clickmap: 'default',
      scroll_notice_map: 'default',
      ...initOpts.heatmap,
    },
    app_js_bridge: true,

    ...initOpts,
  });

  // registering all events need to add common parameters
  if (isObject(registerOpts)) {
    sensors.registerPage({
      env: RUNTIME_ENV,
      app_id: 10009,
      // notify_lang: // current language
      //   getCookie(BYBIT_LANG_KEY)
      //   || storage.get(BYBIT_LANG_KEY)
      //   || window.navigator.language,
      project_type: '',
      project_name: '',
      // ga_id: getGaClientId(), // google 的 ga id
      page_url: window.location.href || '',
      page_path: window.location.pathname || '',
      referrer_url: document.referrer || '',
      referrer_path: getReferrerPath(),

      // guid: getGuid(),
      // u: window.GA_UID || '', // uid
      platform_type: isPC() ? 'Web' : 'H5',

      ...registerOpts,
    });
  }

  // collect $pageview event
  sensors.quick('autoTrack');
};

export default sensors;
