# httpClient 网络请求库

> 适用于网关验签的http接口请求

## usage

```js
import httpClient from './utils/index';

export const baseURLMainNet = 'https://api.bitverse.zone';

const testHttpRequest = async () => {
  // 接口1：需要签名的接口
  const apiUrl1 = '/bitverse/bitdapp/v1/public/quest/activity/get';

  try {
    // 如有需要,可以通过传递第三个参数控制baseURL
    const result = await httpClient.post(apiUrl1, {
      activityId: '123456',
    }, 
    // 不传默认是生产环境地址
    {
      baseURL: baseURLMainNet,
    });
    console.log('[response ok]:', result);
  } catch (error) {
    console.log('[response error]: ', error);
  }
};
```

## develop
