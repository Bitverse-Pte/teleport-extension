import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import init, {
  initThreadPool,
  test,
  ecdsa_keygen_first_handle,
  ecdsa_keygen_second_handle,
  test_key_gen_first_msg,
  ecdsa_chaincode_first_handle,
  ecdsa_chaincode_second_handle_and_return_master_key,
  ecdsa_build_sign_first_request,
  ecdsa_sign_first_handle,
} from './mpc_wallet_core_wasm/pkg';
// import * as Comlink from 'comlink';

// const webWorker = new Worker(new URL('./worker.ts', import.meta.url));
// const work = Comlink.wrap(webWorker);

const instance = axios.create({
  baseURL: 'http://api2.bitverse-dev-1.bitverse.zone',
  timeout: 1000 * 30,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'device-id': '634d410360b2b599152e1125',
    platform: 'android',
    userToken:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhcHBJZCI6ImJpdHZlcnNlX2FwcCIsInVzZXJJZCI6MjA4ODU3MDAwMDAxMDAxNiwicGxhdGZvcm0iOjEsImlzc3VlZF9hdCI6MTY4NDMxMzY2MjE4OCwiZ2VuX3RzIjoxNjg0NDAwMDYyMTg4LCJleHBpcmVzX2F0IjoxNjg0NTcyODYyMTg4LCJpYXQiOjE2ODQzMTM2NjIsImV4cCI6MTY4Njk5MjA2Mn0.MEUCIFmaeyG3kUYuTl2Yv88Jqo9i6T9hT0rntXwuBBpGB20_AiEAqWPGbpxpzwSrdjw74s_Hgl0DWHBoBnercyoNYdpyyos',
  },
});

export async function keyGen() {
  // keygen first
  const kg_party_one_first_message_result = await instance.post(
    '/bitverse/wallet/v1/private/mpc/ecdsa/keygen/first',
    {}
  );
  console.log(
    'kg_party_one_first_message_result',
    kg_party_one_first_message_result
  );
  if (kg_party_one_first_message_result.data.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  const kg_party_one_first_message =
    kg_party_one_first_message_result.data.result;

  const id = JSON.parse(kg_party_one_first_message)[0];
  const kg_first_message = JSON.parse(kg_party_one_first_message)[1];

  const keyGenFirstHandleResult = await ecdsa_keygen_first_handle(id);
  console.log('keyGenFirstHandleResult', keyGenFirstHandleResult);

  ///// keygen second
  const kg_party_one_second_message_result = await instance.post(
    '/bitverse/wallet/v1/private/mpc/ecdsa/keygen/second',
    keyGenFirstHandleResult.key_gen_second_req
  );
  if (kg_party_one_second_message_result.data.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  //
  const kg_second_message = kg_party_one_second_message_result.data.result;

  const keyGenSecondHandleResult = await ecdsa_keygen_second_handle(
    id,
    kg_first_message,
    JSON.parse(kg_second_message)
  );
  console.log('keyGenSecondHandleResult', keyGenSecondHandleResult);

  ///// chain_code first
  const cc_party_one_first_message_result = await instance.post(
    '/bitverse/wallet/v1/private/mpc/ecdsa/keygen/chaincode/first',
    keyGenSecondHandleResult.chain_code_first_req
  );
  console.log(
    'party_one_chain_code_first_message_result',
    cc_party_one_first_message_result
  );
  if (cc_party_one_first_message_result.data.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  const cc_party_one_first_message =
    cc_party_one_first_message_result.data.result;
  const chainCodeFirstHandleResult = await ecdsa_chaincode_first_handle(id);
  console.log('chainCodeFirstHandleResult', chainCodeFirstHandleResult);

  ///// chain_code second
  const cc_party_one_second_message_result = await instance.post(
    '/bitverse/wallet/v1/private/mpc/ecdsa/keygen/chaincode/second',
    chainCodeFirstHandleResult.chain_code_second_req
  );
  console.log(
    'cc_party_one_second_message_result',
    cc_party_one_second_message_result
  );
  if (cc_party_one_second_message_result.data.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  const cc_party_one_second_message =
    cc_party_one_second_message_result.data.result;

  //// swap Masterkey
  const chainCodeSecondHandleResult = await ecdsa_chaincode_second_handle_and_return_master_key(
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
  await sign(id, chainCodeSecondHandleResult.master_key, '123', '61');
}

export async function sign(
  id: string, // 钱包 ID
  mk: any, // master key
  c_message_le_hex: string,
  coinId: string
) {
  const signFirstRequestResult = await ecdsa_build_sign_first_request(id);

  console.log('signFirstRequestResult', signFirstRequestResult);

  const biz_id = uuidv4();
  const signFirstRequest = signFirstRequestResult.sign_first_req;
  signFirstRequest.bizId = biz_id;
  const sign_party_one_first_message_result = await instance.post(
    '/bitverse/wallet/v1/private/mpc/ecdsa/sign/first',
    signFirstRequest
  );
  console.log(
    'sign_party_one_first_message_result',
    sign_party_one_first_message_result
  );
  if (sign_party_one_first_message_result.data.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  const sign_party_one_first_message =
    sign_party_one_first_message_result.data.result;

  console.log('sign_party_one_first_message', sign_party_one_first_message);

  //   const c_message_le_hex = '1234'; //自定义消息 msg 必须 16进制
  const c_x_pos = coinId || '60'; // coin id
  const c_y_pos = '1'; // 固定1

  const signFirstHandleResult = await ecdsa_sign_first_handle(
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
    '/bitverse/wallet/v1/private/mpc/ecdsa/sign/second',
    signFirstHandleResult.sign_second_request
  );
  console.log(
    'sign_party_one_second_message_result',
    sign_party_one_second_message_result
  );

  if (sign_party_one_second_message_result.data.retCode != 0) {
    //TODO 处理失败请求
    return;
  }
  const signature = sign_party_one_second_message_result.data.result;

  console.log('签名结果=========>', signature);
}
