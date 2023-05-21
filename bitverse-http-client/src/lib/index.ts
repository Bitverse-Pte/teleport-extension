// import axios from 'axios';
// import { encode } from 'js-base64';
// import { baseURLMainNet, envConfig } from './config';
// import ServerTime from './ServerTime';
// import { resolveSignature } from './crypto';
// import { default as xhrAdapter } from 'axios/lib/adapters/xhr';

import http from './useFetch';

export default http;

// Object.defineProperty(navigator, 'userAgent', {
//   value: 'bitverse_app/2.0.4/iphone14',
//   writable: false,
// });

// const request = axios.create({
//   // adapter: xhrAdapter,
//   baseURL: baseURLMainNet,
//   timeout: 5000,
//   headers: {
//     'Content-Type': 'application/json',

//     platform: 'android', // TODO: 后面修改网关，增加 plugin @rookie
//     // platform: 'plugin',
//     // 固定写这个
//     app_name: 'bitverse_app',
//     version: '1.0.0',
//     // 'User-Agent': 'bitverse_app/2.0.4/iphone14',
//     // 'User-Agent': 'bitverse_app/2.0.4/iphone14',
//     // 'Access-Control-Allow-Origin': '*',
//     // TODO: 增加device-id， 设备指纹
//     // 'device-id': '634d410360b2b599152e1125',
//     // platform: 'extension',
//     // userToken:
//     // 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhcHBJZCI6ImJpdHZlcnNlX2FwcCIsInVzZXJJZCI6MjA4ODU3MDAwMDAxMDAxNiwicGxhdGZvcm0iOjEsImlzc3VlZF9hdCI6MTY4NDMxMzY2MjE4OCwiZ2VuX3RzIjoxNjg0NDAwMDYyMTg4LCJleHBpcmVzX2F0IjoxNjg0NTcyODYyMTg4LCJpYXQiOjE2ODQzMTM2NjIsImV4cCI6MTY4Njk5MjA2Mn0.MEUCIFmaeyG3kUYuTl2Yv88Jqo9i6T9hT0rntXwuBBpGB20_AiEAqWPGbpxpzwSrdjw74s_Hgl0DWHBoBnercyoNYdpyyos',
//   },
// });

// request.interceptors.request.use(
//   async (config) => {
//     // 计算时间戳
//     const st = new ServerTime();
//     await st.init();
//     const timestamp = st.getTimestamp();

//     const env = baseURLMainNet ? 'mainnet' : 'testnet';
//     const accessKeyId = envConfig[env].access_key;
//     const accessKeySecret = envConfig[env].secret;

//     console.log('[timestamp] ===', timestamp);
//     console.log('[accessKeyId] ===', accessKeyId);
//     console.log('[accessKeySecret] ===', accessKeySecret);

//     // 计算消息内容的 base64 编码
//     let content = '';
//     if (config.method === 'get') {
//       const params = Object.keys(config.params).sort();
//       content = encode(
//         params.map((key) => `${key}=${config.params[key]}`).join('&')
//       );
//     } else {
//       try {
//         content = encode(!config.data ? '' : JSON.stringify(config.data));
//       } catch (_) {
//         console.log('[catch] content error:', _);
//         content = encode(config.data?.toString() ?? '');
//       }
//     }

//     console.log('[content] 原始值:', config.data);
//     console.log('[content] 加密后:', content);

//     // 计算签名
//     const signature = resolveSignature(
//       accessKeyId,
//       accessKeySecret,
//       content,
//       timestamp
//     );

//     console.log('[signature] = ', signature);

//     // 添加请求头
//     config.headers['X-B-Timestamp'] = timestamp;
//     config.headers['X-B-Signature'] = signature;
//     config.headers['X-B-AccessKeyId'] = accessKeyId;

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// request.interceptors.response.use(
//   (response) => {
//     // 在响应返回之前做一些处理
//     return response.data;
//   },
//   (error) => {
//     // 处理响应返回失败的情况
//     return Promise.reject(error);
//   }
// );

// export default request;
