import { encode } from 'js-base64';
import ServerTime from './ServerTime';
import { resolveSignature } from './crypto';
import { baseURLMainNet, envConfig } from './config';

async function request(method: string, url: string, data?: any, headers?: any) {
  // 计算时间戳
  const st = new ServerTime();
  await st.init();
  const timestamp = st.getTimestamp();

  const env = baseURLMainNet ? 'mainnet' : 'testnet';
  const accessKeyId = envConfig[env].access_key;
  const accessKeySecret = envConfig[env].secret;

  console.log('[timestamp] ===', timestamp);
  console.log('[accessKeyId] ===', accessKeyId);
  console.log('[accessKeySecret] ===', accessKeySecret);

  // 计算消息内容的 base64 编码
  let content = '';
  if (method.toUpperCase() === 'GET') {
    const urlObj = new URL(url);
    const params = Object.keys(urlObj.search.substring(1)).sort();
    content = encode(params.map((key) => `${key}=${params[key]}`).join('&'));
  } else {
    try {
      content = encode(!data ? '' : JSON.stringify(data));
    } catch (_) {
      console.log('[catch] content error:', _);
      content = encode(data?.toString() ?? '');
    }
  }

  console.log('[content] 原始值:', data);
  console.log('[content] 加密后:', content);

  // 计算签名
  const signature = resolveSignature(
    accessKeyId,
    accessKeySecret,
    content,
    timestamp
  );

  console.log('[signature] = ', signature);

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // 添加网关所需请求头
      'X-B-Timestamp': timestamp,
      'X-B-Signature': signature,
      'X-B-AccessKeyId': accessKeyId,
      platform: 'android',
      // TODO: 后面修改网关，增加 plugin @rookie
      // platform: 'plugin',
      // TODO: 增加设备Id
      'device-id': 'device-id',

      // 固定写这个
      app_name: 'bitverse_app',
      version: '1.0.0',
      ...headers,
    },
    body: JSON.stringify(data),
  };

  return fetch(url, options)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Network response was not ok.');
      }
    })
    .catch((error) => {
      console.error('There was a problem with the network request.', error);
    });
}

const http = {
  get: (url: string) => request('GET', url),
  post: (url: string, data: any, headers: any) =>
    request('POST', url, data, headers),
  // put: (url, data) => request('PUT', url, data),
  // delete: (url, data) => request('DELETE', url, data)
};

export default http;

// 示例用法
// http
//   .get('http://example.com/api/data')
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// http
//   .post('http://example.com/api/data', { name: 'John', age: 30 })
//   .then((response) => {
//     console.log(response);
//   })
//   .catch((error) => {
//     console.error('There was a problem with the network request.', error);
//   });
