import { v4 as uuidv4 } from 'uuid';
// import init, {
//   // initThreadPool,
//   // test,
//   // ecdsa_keygen_first_handle,
//   // ecdsa_keygen_second_handle,
//   // test_key_gen_first_msg,
//   ecdsa_chaincode_first_handle,
//   ecdsa_chaincode_second_handle_and_return_master_key,
//   ecdsa_build_sign_first_request,
//   ecdsa_sign_first_handle,
// } from './mpc_wallet_core_wasm/pkg';
import httpClient from 'bitverse-http-client';
// import * as Comlink from 'comlink';

// init();

// const webWorker = new Worker(new URL('./worker.ts', import.meta.url));
// const work = Comlink.wrap(webWorker);

export const baseURLMainNet = 'http://api2.bitverse-dev-1.bitverse.zone';
// console.log('ufoufo hello23:', hello);
// void (async function () {
// await init();
//await initThreadPool(navigator.hardwareConcurrency);
// await initThreadPool(1);
// self.postMessage({ ready: true });
// })();
// new // hello();
// const testHttpRequest = async () => {
//   // 接口1：需要签名的接口
//   const apiUrl1 = '/bitverse/bitdapp/v1/public/quest/activity/get';

//   try {
//     // 如有需要,可以通过传递第三个参数控制baseURL
//     const result = await httpClient.post(apiUrl1, {
//       activityId: '123456',
//     },
//     // 不传默认是生产环境地址
//     {
//       baseURL: baseURLMainNet,
//     });
//     console.log('[response ok]:', result);
//   } catch (error) {
//     console.log('[response error]: ', error);
//   }
// };

// const result = await httpClient.post(
//   apiUrl1,
//   {
//     activityId: '123456',
//   },
//   // 不传默认是生产环境地址
//   {
//     baseURL: baseURLMainNet,
//   }
// );

// const instance = axios.create({
//   baseURL: 'http://api2.bitverse-dev-1.bitverse.zone',
//   timeout: 1000 * 30,
//   headers: {
//     'Content-Type': 'application/json',
//     'Access-Control-Allow-Origin': '*',
//     'device-id': '634d410360b2b599152e1125',
//     platform: 'android',
//     userToken:
//       'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhcHBJZCI6ImJpdHZlcnNlX2FwcCIsInVzZXJJZCI6MjA4ODU3MDAwMDAxMDAxNiwicGxhdGZvcm0iOjEsImlzc3VlZF9hdCI6MTY4NDMxMzY2MjE4OCwiZ2VuX3RzIjoxNjg0NDAwMDYyMTg4LCJleHBpcmVzX2F0IjoxNjg0NTcyODYyMTg4LCJpYXQiOjE2ODQzMTM2NjIsImV4cCI6MTY4Njk5MjA2Mn0.MEUCIFmaeyG3kUYuTl2Yv88Jqo9i6T9hT0rntXwuBBpGB20_AiEAqWPGbpxpzwSrdjw74s_Hgl0DWHBoBnercyoNYdpyyos',
//   },
// });

// ecdsa_chaincode_first_handle('1');
// ecdsa_chaincode_second_handle_and_return_master_key(1, 2, 3, 4, 5, 6, 7);
// ecdsa_build_sign_first_request(1);
// ecdsa_sign_first_handle(1, 2, 3, 4, 5, 6, 7, 8);

function createInstance(baseURLMainNet) {
  return {
    post1: async (url, args) => {
      const result = await httpClient.post(
        url,
        args,
        // 不传默认是生产环境地址
        {
          baseURL: baseURLMainNet,
          timeout: 1000 * 30,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'device-id': '634d410360b2b599152e1125',
            platform: 'android',
            userToken:
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhcHBJZCI6ImJpdHZlcnNlX2FwcCIsInVzZXJJZCI6MjA4ODU3MDAwMDAxMDAxNiwicGxhdGZvcm0iOjEsImlzc3VlZF9hdCI6MTY4NTE1Njc1NzU5NCwiZ2VuX3RzIjoxNjg1MjQzMTU3NTk0LCJleHBpcmVzX2F0IjoxNjg3NzQ4NzU3NTk0LCJpYXQiOjE2ODUxNTY3NTcsImV4cCI6MTY4NzgzNTE1N30.MEYCIQCCE3AkOOub4TjR9FNK_fo0Mks2FP-54MmC2WUo_bukbwIhAJaSBmTpG805XV5P-0wcks74zTXRaGjsY1G0afqMyNyy',
          },
        }
      );
      return result;
    },
    post: async (url, args) => {
      const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'device-id': '634d410360b2b599152e1125',
          platform: 'android',
          userToken:
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhcHBJZCI6ImJpdHZlcnNlX2FwcCIsInVzZXJJZCI6MjA4ODU3MDAwMDAxMDAxNiwicGxhdGZvcm0iOjEsImlzc3VlZF9hdCI6MTY4NTE1Njc1NzU5NCwiZ2VuX3RzIjoxNjg1MjQzMTU3NTk0LCJleHBpcmVzX2F0IjoxNjg3NzQ4NzU3NTk0LCJpYXQiOjE2ODUxNTY3NTcsImV4cCI6MTY4NzgzNTE1N30.MEYCIQCCE3AkOOub4TjR9FNK_fo0Mks2FP-54MmC2WUo_bukbwIhAJaSBmTpG805XV5P-0wcks74zTXRaGjsY1G0afqMyNyy',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(args), // body data type must match "Content-Type" header
      });
      return response.json(); // parses JSON response into native JavaScript objects
    },
  };
}

// const instance = createInstance(baseURLMainNet);

// export async function keygenMPC() {
//   // keygen first
//   const kg_party_one_first_message_result = await instance.post(
//     '/bitverse/wallet/v1/private/mpc/ecdsa/keygen/first',
//     {}
//   );
//   console.log(
//     'kg_party_one_first_message_result',
//     kg_party_one_first_message_result
//   );
//   if (kg_party_one_first_message_result.data.retCode != 0) {
//     //TODO 处理失败请求
//     return;
//   }
//   const kg_party_one_first_message =
//     kg_party_one_first_message_result.data.result;

//   const id = JSON.parse(kg_party_one_first_message)[0];
//   const kg_first_message = JSON.parse(kg_party_one_first_message)[1];

//   const keyGenFirstHandleResult = await ecdsa_keygen_first_handle(id);
//   console.log('keyGenFirstHandleResult', keyGenFirstHandleResult);

//   ///// keygen second
//   const kg_party_one_second_message_result = await instance.post(
//     '/bitverse/wallet/v1/private/mpc/ecdsa/keygen/second',
//     keyGenFirstHandleResult.key_gen_second_req
//   );
//   if (kg_party_one_second_message_result.data.retCode != 0) {
//     //TODO 处理失败请求
//     return;
//   }
//   //
//   const kg_second_message = kg_party_one_second_message_result.data.result;

//   const keyGenSecondHandleResult = await ecdsa_keygen_second_handle(
//     id,
//     kg_first_message,
//     JSON.parse(kg_second_message)
//   );
//   console.log('keyGenSecondHandleResult', keyGenSecondHandleResult);

//   ///// chain_code first
//   const cc_party_one_first_message_result = await instance.post(
//     '/bitverse/wallet/v1/private/mpc/ecdsa/keygen/chaincode/first',
//     keyGenSecondHandleResult.chain_code_first_req
//   );
//   console.log(
//     'party_one_chain_code_first_message_result',
//     cc_party_one_first_message_result
//   );
//   if (cc_party_one_first_message_result.data.retCode != 0) {
//     //TODO 处理失败请求
//     return;
//   }
//   const cc_party_one_first_message =
//     cc_party_one_first_message_result.data.result;
//   const chainCodeFirstHandleResult = await ecdsa_chaincode_first_handle(id);
//   console.log('chainCodeFirstHandleResult', chainCodeFirstHandleResult);

//   ///// chain_code second
//   const cc_party_one_second_message_result = await instance.post(
//     '/bitverse/wallet/v1/private/mpc/ecdsa/keygen/chaincode/second',
//     chainCodeFirstHandleResult.chain_code_second_req
//   );
//   console.log(
//     'cc_party_one_second_message_result',
//     cc_party_one_second_message_result
//   );
//   if (cc_party_one_second_message_result.data.retCode != 0) {
//     //TODO 处理失败请求
//     return;
//   }
//   const cc_party_one_second_message =
//     cc_party_one_second_message_result.data.result;

//   //// swap Masterkey
//   const chainCodeSecondHandleResult = await ecdsa_chaincode_second_handle_and_return_master_key(
//     id,
//     keyGenSecondHandleResult.party_two_paillier,
//     JSON.parse(kg_second_message),
//     JSON.parse(cc_party_one_first_message),
//     chainCodeFirstHandleResult.cc_ec_key_pair2,
//     keyGenFirstHandleResult.kg_ec_key_pair_party2,
//     JSON.parse(cc_party_one_second_message)
//   );

//   console.log('客户端私钥分片=========>', chainCodeSecondHandleResult);
//   debugger;
//   ////// sign
//   // await sign(id, chainCodeSecondHandleResult.master_key, '123', '61');
// }

// export async function sign(
//   id: string, // 钱包 ID
//   mk: any, // master key
//   c_message_le_hex: string,
//   coinId: string
// ) {
//   const signFirstRequestResult = await ecdsa_build_sign_first_request(id);

//   console.log('signFirstRequestResult', signFirstRequestResult);

//   const biz_id = uuidv4();
//   const signFirstRequest = signFirstRequestResult.sign_first_req;
//   signFirstRequest.bizId = biz_id;
//   const sign_party_one_first_message_result = await instance.post(
//     '/bitverse/wallet/v1/private/mpc/ecdsa/sign/first',
//     signFirstRequest
//   );
//   console.log(
//     'sign_party_one_first_message_result',
//     sign_party_one_first_message_result
//   );
//   if (sign_party_one_first_message_result.data.retCode != 0) {
//     //TODO 处理失败请求
//     return;
//   }
//   const sign_party_one_first_message =
//     sign_party_one_first_message_result.data.result;

//   console.log('sign_party_one_first_message', sign_party_one_first_message);

//   //   const c_message_le_hex = '1234'; //自定义消息 msg 必须 16进制
//   const c_x_pos = coinId || '60'; // coin id
//   const c_y_pos = '1'; // 固定1

//   const signFirstHandleResult = await ecdsa_sign_first_handle(
//     c_message_le_hex,
//     mk,
//     c_x_pos,
//     c_y_pos,
//     id,
//     JSON.parse(sign_party_one_first_message),
//     signFirstRequestResult.eph_comm_witness,
//     signFirstRequestResult.eph_ec_key_pair_party2
//   );

//   signFirstHandleResult.sign_second_request.bizId = biz_id;
//   const sign_party_one_second_message_result = await instance.post(
//     '/bitverse/wallet/v1/private/mpc/ecdsa/sign/second',
//     signFirstHandleResult.sign_second_request
//   );
//   console.log(
//     'sign_party_one_second_message_result',
//     sign_party_one_second_message_result
//   );

//   if (sign_party_one_second_message_result.data.retCode != 0) {
//     //TODO 处理失败请求
//     return;
//   }
//   const signature = sign_party_one_second_message_result.data.result;

//   console.log('签名结果=========>', signature);
// }
