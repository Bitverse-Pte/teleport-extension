import { useEffect } from 'react';
import './Popup.css';
// import { keygenMPC } from '../mpc.utils';

export default function () {
  useEffect(() => {
    console.log('Hello from the popup!');
  }, []);

  const handler = async (e) => {
    console.log('click');
    // const rtn = await keygenMPC('yyyyyy');
    // console.log('------', rtn);
  };
  return (
    <div>
      <img src="/icon-with-shadow.svg" />
      <h1 onClick={handler}>vite-plugin-web-extension</h1>
      <p>
        Template: <code>react-ts</code>
      </p>
    </div>
  );
}
