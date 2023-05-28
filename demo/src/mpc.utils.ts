import { v4 as uuidv4 } from 'uuid';

// // import hello from './ufo_demo/hello';
import httpClient from 'bitverse-http-client';
// import * as Comlink from 'comlink';
// import Worker from './worker.ts?worker';
// import InlineWorker from './worker.js?worker&inline';

// console.log('---import.meta.url:', import.meta.url);
// console.log(
//   '---import.meta.url:',
//   new URL('../workers/worker.ts', import.meta.url)
// );
// const webWorker = new Worker(new URL('./worker.ts', import.meta.url));
// const webWorker = new Worker();
// const work = Comlink.wrap(webWorker);

export async function test(arg) {
  console.log(webWorker);
  const aaa = await work
    .test_wasm(arg)
    .then((v) => {
      console.log('------keygen1', v);
    })
    .catch((e) => {
      console.log('-------keygen2', e);
    });
  console.log('------aaa', aaa);
  return aaa;
  return 'aaa';
}

export const baseURLMainNet = 'http://api2.bitverse-dev-1.bitverse.zone';
// console.log('ufoufo hello234:');
// // void (async function () {
// // await init();
// //await initThreadPool(navigator.hardwareConcurrency);
// // await initThreadPool(1);
// // self.post1Message({ ready: true });
// // })();
// // new // hello();
// // const testHttpRequest = async () => {
// //   // 接口1：需要签名的接口
// //   const apiUrl1 = '/bitverse/bitdapp/v1/public/quest/activity/get';

// //   try {
// //     // 如有需要,可以通过传递第三个参数控制baseURL
// //     const result = await httpClient.post(apiUrl1, {
// //       activityId: '123456',
// //     },
// //     // 不传默认是生产环境地址
// //     {
// //       baseURL: baseURLMainNet,
// //     });
// //     console.log('[response ok]:', result);
// //   } catch (error) {
// //     console.log('[response error]: ', error);
// //   }
// // };

// // const result = await httpClient.post(
// //   apiUrl1,
// //   {
// //     activityId: '123456',
// //   },
// //   // 不传默认是生产环境地址
// //   {
// //     baseURL: baseURLMainNet,
// //   }
// // );

// // const instance = axios.create({
// //   baseURL: 'http://api2.bitverse-dev-1.bitverse.zone',
// //   timeout: 1000 * 30,
// //   headers: {
// //     'Content-Type': 'application/json',
// //     'Access-Control-Allow-Origin': '*',
// //     'device-id': '634d410360b2b599152e1125',
// //     platform: 'android',
// //     userToken:
// //       'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhcHBJZCI6ImJpdHZlcnNlX2FwcCIsInVzZXJJZCI6MjA4ODU3MDAwMDAxMDAxNiwicGxhdGZvcm0iOjEsImlzc3VlZF9hdCI6MTY4NDMxMzY2MjE4OCwiZ2VuX3RzIjoxNjg0NDAwMDYyMTg4LCJleHBpcmVzX2F0IjoxNjg0NTcyODYyMTg4LCJpYXQiOjE2ODQzMTM2NjIsImV4cCI6MTY4Njk5MjA2Mn0.MEUCIFmaeyG3kUYuTl2Yv88Jqo9i6T9hT0rntXwuBBpGB20_AiEAqWPGbpxpzwSrdjw74s_Hgl0DWHBoBnercyoNYdpyyos',
// //   },
// // });

// // ecdsa_chaincode_first_handle('1');
// // ecdsa_chaincode_second_handle_and_return_master_key(1, 2, 3, 4, 5, 6, 7);
// // ecdsa_build_sign_first_request(1);
// // ecdsa_sign_first_handle(1, 2, 3, 4, 5, 6, 7, 8);

function createInstance() {
  const token =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhcHBJZCI6ImJpdHZlcnNlX2FwcCIsInVzZXJJZCI6MjA4ODU3MDAwMDAxMDAxNiwicGxhdGZvcm0iOjEsImlzc3VlZF9hdCI6MTY4NTI0MTA4MDM2NywiZ2VuX3RzIjoxNjg1MzI3NDgwMzY3LCJleHBpcmVzX2F0IjoxNjg3ODMzMDgwMzY3LCJpYXQiOjE2ODUyNDEwODAsImV4cCI6MTY4NzkxOTQ4MH0.MEUCIQD5WydrdGd8Q2H6leKqFHLxNBL1quEeK0rJYXKxCHaFUQIgOcVu3cZGyA8WxFdC2tPaV6jTWSio4L4o5f5B3AwiNyQ';
  return {
    post: async (url, args) => {
      const result = await httpClient.post(url, args, {
        'Content-Type': 'application/json',
        userToken: token,
      });
      return result;
    },
    post1: async (url, args) => {
      const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          userToken: token,
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(args), // body data type must match "Content-Type" header
      });
      return response.json(); // parses JSON response into native JavaScript objects
    },
  };
}

const instance = createInstance();

export async function keygenMPC() {
  console.log('------frank keygenMPC');
  /// keygen first
  const kg_party_one_first_message_result = await instance.post(
    `${baseURLMainNet}/bitverse/wallet/v1/private/mpc/ecdsa/keygen/first`,
    {}
  );
  console.log(
    'kg_party_one_first_message_result',
    kg_party_one_first_message_result
  );

  work.inc();
  if (kg_party_one_first_message_result.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  const kg_party_one_first_message = kg_party_one_first_message_result.result;

  const id = JSON.parse(kg_party_one_first_message)[0];
  const kg_first_message = JSON.parse(kg_party_one_first_message)[1];

  const keyGenFirstHandleResult = await work.ecdsa_keygen_first_handle(id);
  console.log('keyGenFirstHandleResult', keyGenFirstHandleResult);

  ///// keygen second
  const kg_party_one_second_message_result = await instance.post(
    `${baseURLMainNet}/bitverse/wallet/v1/private/mpc/ecdsa/keygen/second`,
    keyGenFirstHandleResult.key_gen_second_req
  );
  if (kg_party_one_second_message_result.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  //
  const kg_second_message = kg_party_one_second_message_result.result;

  const keyGenSecondHandleResult = await work.ecdsa_keygen_second_handle(
    id,
    kg_first_message,
    JSON.parse(kg_second_message)
  );
  console.log('keyGenSecondHandleResult', keyGenSecondHandleResult);

  ///// chain_code first
  const cc_party_one_first_message_result = await instance.post(
    `${baseURLMainNet}/bitverse/wallet/v1/private/mpc/ecdsa/keygen/chaincode/first`,
    keyGenSecondHandleResult.chain_code_first_req
  );
  console.log(
    'party_one_chain_code_first_message_result',
    cc_party_one_first_message_result
  );
  if (cc_party_one_first_message_result.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  const cc_party_one_first_message = cc_party_one_first_message_result.result;
  const chainCodeFirstHandleResult = await work.ecdsa_chaincode_first_handle(
    id
  );
  console.log('chainCodeFirstHandleResult', chainCodeFirstHandleResult);

  ///// chain_code second
  const cc_party_one_second_message_result = await instance.post(
    `${baseURLMainNet}/bitverse/wallet/v1/private/mpc/ecdsa/keygen/chaincode/second`,
    chainCodeFirstHandleResult.chain_code_second_req
  );
  console.log(
    'cc_party_one_second_message_result',
    cc_party_one_second_message_result
  );
  if (cc_party_one_second_message_result.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  const cc_party_one_second_message = cc_party_one_second_message_result.result;

  //// swap Masterkey
  const chainCodeSecondHandleResult = await work.ecdsa_chaincode_second_handle_and_return_master_key(
    id,
    keyGenSecondHandleResult.party_two_paillier,
    JSON.parse(kg_second_message),
    JSON.parse(cc_party_one_first_message),
    chainCodeFirstHandleResult.cc_ec_key_pair2,
    keyGenFirstHandleResult.kg_ec_key_pair_party2,
    JSON.parse(cc_party_one_second_message)
  );

  console.log('客户端私钥分片=========>', chainCodeSecondHandleResult);

  ////// sign
  await sign(id, chainCodeSecondHandleResult.master_key, '124');
}

export async function sign(
  id: string, // 钱包 ID
  mk: any, // master key
  c_message_le_hex: string,
  coinId: string
) {
  const signFirstRequestResult = await work.ecdsa_build_sign_first_request(id);

  console.log('signFirstRequestResult', signFirstRequestResult);

  const biz_id = uuidv4();
  const signFirstRequest = signFirstRequestResult.sign_first_req;
  signFirstRequest.bizId = biz_id;
  const sign_party_one_first_message_result = await instance.post(
    `${baseURLMainNet}/bitverse/wallet/v1/private/mpc/ecdsa/sign/first`,
    signFirstRequest
  );
  console.log(
    'sign_party_one_first_message_result',
    sign_party_one_first_message_result
  );
  if (sign_party_one_first_message_result.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  const sign_party_one_first_message =
    sign_party_one_first_message_result.result;

  console.log('sign_party_one_first_message', sign_party_one_first_message);

  // const c_message_le_hex = '1234'; //自定义消息 msg 必须 16进制
  const c_x_pos = coinId || '60'; // coin id
  const c_y_pos = '1'; // 固定1

  const signFirstHandleResult = await work.ecdsa_sign_first_handle(
    c_message_le_hex,
    mk,
    c_x_pos,
    c_y_pos,
    id,
    JSON.parse(sign_party_one_first_message),
    signFirstRequestResult.eph_comm_witness,
    signFirstRequestResult.eph_ec_key_pair_party2
  );

  signFirstHandleResult.sign_second_request.bizId = biz_id;
  const sign_party_one_second_message_result = await instance.post(
    `${baseURLMainNet}/bitverse/wallet/v1/private/mpc/ecdsa/sign/second`,
    signFirstHandleResult.sign_second_request
  );
  console.log(
    'sign_party_one_second_message_result',
    sign_party_one_second_message_result
  );

  if (sign_party_one_second_message_result.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  const signature = sign_party_one_second_message_result.result;

  console.log('签名结果=========>', signature);
}
