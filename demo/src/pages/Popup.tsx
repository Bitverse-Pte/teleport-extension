import { useEffect } from 'react';
// import './Popup.css';
// import { keygenMPC } from '../mpc.utils';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// import init, {
//   initThreadPool,
//   test,
//   ecdsa_keygen_first_handle,
//   ecdsa_keygen_second_handle,
//   test_key_gen_first_msg,
//   ecdsa_chaincode_first_handle,
//   ecdsa_chaincode_second_handle_and_return_master_key,
//   ecdsa_build_sign_first_request,
//   ecdsa_sign_first_handle,
// } from '../mpc_wallet_core_wasm/pkg';

import { keygenMPC } from '../mpc.utils';

export default function () {
  useEffect(() => {
    // console.log('Hello from the popup!');
  }, []);

  const handler = async (e: any) => {
    console.log('click1');
    // console.log('------', rtn);
    // var a = test('333');

    var a = keygenMPC('99999999');
    console.log(a);
  };
  return (
    <div>
      <img onClick={handler} src="/icon-with-shadow.svg" />
      <h1>vite-plugin-web-extension</h1>
      <p>
        Template: <code>react-ts</code>
      </p>
    </div>
  );
}
