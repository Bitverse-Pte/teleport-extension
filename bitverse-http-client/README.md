# BitversehttpClient 网络请求库

> 适用于网关验签的http接口请求

## usage

```js
// 引入
import httpClient from 'bitverse-http-client';
export const baseURLMainNet = 'https://api.bitverse.zone';

const testHttpRequest = async () => {
  // 接口1：需要签名的接口
  const apiUrl = `${baseURLMainNet}/bitverse/bitdapp/v1/public/quest/activity/get`;

  try {
    /**
     * 参数1： 接口完整url
     * 参数2： post body
     * 参数3:  自定义header
     */
    const result = await httpClient.post(apiUrl, {
      activityId: '123456',
    }, 
    {
      userToken: 'eyJ0eXxxxxs',
    });
    console.log('[response ok]:', result);
  } catch (error) {
    console.log('[response error]: ', error);
  }
};
```

## develop

```bash
# 安装依赖
yarn

# 开发运行
yarn dev

# 构建
yarn build
```
