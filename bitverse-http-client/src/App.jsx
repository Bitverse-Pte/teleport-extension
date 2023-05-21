import { useState } from 'react';
import './App.css';

import httpClient from './lib/index';
import { envConfig } from './lib/config';
import { resolveSignature } from './lib/crypto';
import { baseURLMainNet } from './lib/config';

function App() {
  const [count, setCount] = useState(0);

  const testHttpRequest = async () => {
    console.log('testHttpRequest');
    // 接口1：需要签名的接口
    const apiUrl1 = `${baseURLMainNet}/bitverse/bitdapp/v1/public/quest/activity/get`;

    try {
      // const result = await httpClient.post(apiUrl1);
      const result = await httpClient.post(apiUrl1, {
        activityId: '123456',
      });
      console.log('response: ', result);
    } catch (error) {
      console.log('request error: ', error);
    }
  };

  const testSignFn = () => {
    const base64Content = 'eyJhY3Rpdml0eUlkIjoiMTIzNDU2In0=';
    const serverTime = 1684577214114;
    const accessKey = envConfig.mainnet.access_key;
    const secret = envConfig.mainnet.secret;
    resolveSignature(accessKey, secret, base64Content, serverTime);
  };

  return (
    <>
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1> */}
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className="card">
        <button onClick={testHttpRequest}>发起请求 testnet</button>
      </div>
      <div className="card">
        <button onClick={testHttpRequest}>发起请求 mainnet</button>
      </div>
      <div className="card">
        <button onClick={testSignFn}>测试签名方法</button>
      </div>
    </>
  );
}

export default App;
