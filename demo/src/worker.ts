import init, {
  test_wasm,
  ecdsa_keygen_first_handle,
  ecdsa_keygen_second_handle,
  test_key_gen_first_msg,
  ecdsa_chaincode_first_handle,
  ecdsa_chaincode_second_handle_and_return_master_key,
  ecdsa_build_sign_first_request,
  ecdsa_sign_first_handle,
  // } from '../../background/mpc_wallet_core_wasm/pkg';
} from './rookie';
// import init, { greet } from '../../background/hello-wasm/pkg';
// import { greet } from './hello-wasm/pkg';
import * as Comlink from 'comlink';

// Temporary hack for getRandomValues() error
const getRandomValues = crypto.getRandomValues;
crypto.getRandomValues = function <T extends ArrayBufferView | null>(
  array: T
): T {
  const buffer = new Uint8Array((array as unknown) as Uint8Array);
  const value = getRandomValues.call(crypto, buffer);
  ((array as unknown) as Uint8Array).set(value);
  return array;
};

// const tt = function () {
//     let s = test("Hello");
//     console.log(s)
// }
console.log('Worker is initializing...1');
void (async function () {
  console.log('Worker is initializing...2');
  await init();
  console.log('Worker is initialized...');
  //await initThreadPool(navigator.hardwareConcurrency);
  // await initThreadPool(1);
  self.postMessage({ ready: true });
})();

const obj = {
  counter: 0,
  inc() {
    console.log('-----obj', this.counter);
    this.counter++;
  },
};

// Comlink.expose({ test_wasm });

Comlink.expose({
  test_wasm,
  ecdsa_keygen_first_handle,
  ecdsa_keygen_second_handle,
  test_key_gen_first_msg,
  ecdsa_chaincode_first_handle,
  ecdsa_chaincode_second_handle_and_return_master_key,
  ecdsa_build_sign_first_request,
  ecdsa_sign_first_handle,
  // party_two_key_gen_first_message_handle,
  // party_two_key_gen_second_message_handle,
  // party_two_chain_code_first_message_handle,
  // party_two_chain_code_second_message_handle,
  // party_two_compute_chain_code_handle,
  // party_two_set_master_key_handle,
  // party_two_sign_first_message_handle,
  // party_two_sign_second_message_handle,
  // test_protoc_1,
  // bit_any_pre_sign,
  // bit_any_pre_test,
  // e_invoke
});
