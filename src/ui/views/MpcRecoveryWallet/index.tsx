import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ACCOUNT_CREATE_TYPE } from '../../../constants/index';
import walletLogo from 'assets/Logo.svg';
import { ReactComponent as TlpTextLogo } from 'assets/teleportText.svg';
import axios from 'axios';
import { data } from './recover';
import JSEncrypt from 'jsencrypt';

import './style.less';
import { CustomButton } from 'ui/components/Widgets';
import skynet from 'utils/skynet';
import { useDarkmode } from 'ui/hooks/useDarkMode';
import clsx from 'clsx';
import { browser } from 'webextension-polyfill-ts';
const { sensors } = skynet;
import NodeRSA from 'node-rsa';

const typeMap = {
  1: 'iCloud',
  2: 'Google Drive',
  3: 'Drop Box',
};

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDEENDaHcsWMngB
BJfNxqRmzqrAxBeDS3mQP+ePsHkZhTrNcJ8QEIwPc2dq4lgaaN0b5vmovsjesjv8
JyfBoVGY4EWdglIL1zC+7+itVfkRzbWBxC5Gl8PyzEy3mQOYHC/aBIbK09k7DLWU
HjDLyr1HxJRoi3/u0wB6DeyUCoge6qfCWAakEgbOvxKJvoGAl2ftgGaf0YyD1fbx
kk0I15t8/bCLkJUeqSkTFkDDZEZO+hVhYOCsRzIWQdQzXPfI1AYth5x5OV+FHKQ+
Mqna3oLvF4uIjJJjJz51GuvAJfu7kKziqBomIBOsst8QPZW5O+Z+uhNVMrBYDWnw
1Bw1BhpvAgMBAAECggEAPtWQyUYhDrUP5mudZtIRX+09pddyHZ6zj7obMN6CgN5E
sRA1ucVDzbPTYdq2F4ihy85jFmRGJbCDLtUxlYloiBDf3pGkT60gLyDdtadG0iDV
2YeQuQjsQESfFXvRPg9SepFWzWvFQ3pYOubOBpGrxXNHiJWkY1p13afWuL8DTrye
8hCgefZvXhBXqxsYdRfOMtHq+88gb03NieF2D/SsTwPW8y5kHpue9L9lv5OJRVnl
rqZSRrr18ozUfSNzp6iE3mhKmtlWN+b9Lv8KMGaU8MnRAi16V2RBof+Pefp5mtNU
AAavKWyY6NDpVPh+C7FGXxGNwOI21nthpT1k86M6WQKBgQD0Qqxksj6dMSPa7y0L
XE4PG+8HsoFdQTXlqnEXH0fG7jkJsJQkzxUoEqbf4r7VJxjuen5GbjzIVz1OcfTW
lm1JnfpFS8O5E8eb4lF8YKphVMZSLY0y2XCTPCQ1k01pvygx74GjiSEFgJangqB+
jOtxuWmmtAXgw2g5u9oFTwglxQKBgQDNfSouf3jh/2mKB94SsQnwBkIiXVBs59c2
FFn5ZwLzHl/A/OD5TNCAfcq6GXE6Mrm1dGV2L/vy77PCa1GFp7Qdzan4ww144/b1
fa0eB2N32IT0nG7VNacagKfO4yppFs9LXFSoBmtr3LDLvsj+gDe2VGxKOkcz7yf4
zTOX88y2owKBgQCj0buxZWJdJsH3agX54pRvybpMnUnp83xkZiWm7lHDd65Fc2pI
LaLw12GYMojuiGROPVVHg1O8wdXaMM+WxBjUEOHza9b+3+c2A1nHY0WiNas1Hlve
yLqZ5PIcBIkc7RnWM93sgmHlQNLJ0fA2L+kQwtu69G4kyqmyXuzgNpsuSQKBgQCK
vbyyQl0C8il3CdLV+fTEu+UBQNHhhjOXjuwk6XljXxm1usfHaybH6qbrOexqJ/+d
VWaAAuvw3gkX9s/HFzEUgl0F2eSJwBlpLR6qzMBLFcTHR6vJhv05dq5WkKh85eq2
bjO2cwcqf4pbNoiM1VNIZv3qrCiRFyN86Eeyi+inUwKBgFwn3KViRyrJ2YMMXOvv
JdlKnc/6XV2WuqP3hvJGA5N1pf9X0lZmXHun+tI6gQ8RX6mEdm2G1tOqeIC0phXW
gi5Eau2cCOc4gX0h3/kL+mlQmsOp7353Nbvt38VOjRI8oBpYJaZDp+KeNwfXfDCF
GnaL9vMtSEcgJXsKcyvFiD6i
-----END PRIVATE KEY-----`;

const b =
  '716fccdaa7d65b542abc3d215626a23b36d7b1b7bbbe61a2f18f79129c43e791feaaf52c819ee12bf2f419772bfc4da92ab552c6a7e84010a6b2a5128b62a51f60ddd3b0b6e4212bfa8363521699ab9bc26501d4e14903b1fde706d104ccc797f8310cb429b8965700445282e79b36f43b0bc7d88e75eb98738b87f6fda22d188d0914d93e5abe4ab8838ea05657e199fc782dfe0c99a7d39ba9b9659c6c21d61ef709ca6d990d23e89cec6b4f706659c6f015ac60f292988c381481a5e6fb9dedd38e072171a7eb048ddb8366f59075b3f68b1133342c06b4ccb4c441d52d5401e6043aa866b821bb5746cd1838b2bd7f428bcb3d38c834102b1dd820dad8a248ee65395c042333ede43c88537ad8eed8a86d7f268c2f272e858626eb039b2ac5611c072dcb337f0bcb75290d94333426b216986ec7ef9d467acf1c2caffba952d0c17225828559a4b47483ddbd6c6b9fde4adbc0a66978ad4de3e3a3a62e87e23618245443a4eac0a59661e3e739730d104ae5e72b467461e0b2d4092f8960645c11d17bc0bddf6a49a373be7b1a3bdb06ff270855d01c2c7a7a4b70df049d3aa0de639deb46da3957cdea3dcd221c630178854246551a31792359ceb83f9c68d60b397bedc7d4a82a8235d7d857dbed7656e883915cbe4ec5f62fe4090ed6a688719461c8d786bf52909c5b66231d5e207dad0fc1d67edf425b18d1a10b952dd3cf26402dc533c9d8951c5a704d54cf1e6366c29a68809739b457f74d7ec183d142efc19fe5abdaa6a4b066b63019361f9e41bcaf97d09fc40f657de8d90431d8b073d71b67f404616a74036be83e754ea7dee2cbdace91aead662d2f05a77b845da2c62df981eee74270a1b1ab9472cb5171d3bf3c2cdab914dc9bba2cdfc32f11dde19dd835087df75d96809ac8caba901fcf6d0d6ea270b9d89f4cbfc5ae894bb2134669934f83487629e55fc61f14452b5c833662305d8812b13a53b12593d612868a15b4bee02a645b634b59b82ee6eee438d826af8dd7a28c647bbcfd8dead3490328b65ecbe7cc2a184a9e65b476395a05abc1c62bb789e95b890c3718b047e974234f7f04602353a8d136d07d153aca5af506535998b39fe4bd241caec7a54df5fb155dc2ccb16eaf745baebd1d61edd9307f757c6c2b04e2641d2f22551abd01517fd2cad929890dadbf33818820b1fea309fb3a51e4c64b6dd375512110b8770345e1b4d6e4111211f1a6e5620eb38166ce5bdee7f3d0c0dc499882e411368668df4f78c0ac8e0da692ea19da1446508ce80786ac29c53c379a8c8f7e2a359bae7169e5f837f65812eafb4e4859972db0eb2b9c9c34a4e537d205db8434fca40fcb633285cd998dd1666af4f206ebdc3bcd9aa9df4933df1eaf9d5ddddb0051a4cfd1642165bd81d066b8e906bf84641722e98cacb781225b05817e5a6ae7b5302cf09092b4fd7127a655914981ef1bdce97120f69509063b7f229a3042f25996ebfb61877d4dbed50f2b72dfc97ca4d7d726297ac6b411d92cb496fe9c5f362a46ab86966293af15eeee9989f9d01466dc3c5000ea5371e8593e38b92b455a5982f4ae22c2ee5459f71797a0e72c9988f27579c31b29694b09a6ac7c8b4f86383b85b02f40b4ec54494ef56e13294236e4710a343c4d022cdfe8e8ec7a67d89596c1d42470cb5c384217953d5c8e782afaa4683756c91b03218f1f4897713965bac4fbed7360eaa0c9bd7f8e51ddc004522f14b4bc40a0524b00781b7b227fca8436d37809a48a6b1e4327f0a35da238653cfd5fde278deeb328baf5f489eb6bf48fc8d63cb9bca51a30ffebc9b2dd729dfd472a81f4e1c55f6efc67ff0a689b7386ad06087b1f97508287426d7de93ce7d42177a6d885b5e0548dfe934abcefbc86dd7ae614e14c0c7ab87d4459196a329adaeea421f264826acec5f4473e8360f14f938edb77141cc8522b71edf9bc1d60d9ba24c4768ed857544563a044db1b6218ac38f43dfa8e0ecf4419411f8c723404c591922f1d585762f77e3012974da36ed1f06a0b1d99b7fcc7b18be773a272d91685e040b27497f7ee0b0c94c1d379b2400bd8856f2fb177585bdee6f91b4d0f0525982d0af71037ee641b6fee45e72c62cf573ca64ff91245918dc70d461705db378a480e1607bda8721450e5712dbb577dae1e8e6d9258b3887ef56a7da60be6bccb1d1c2172a38b0cb1f1f55ad88f504fcd7937b02a8ead8992e11c4a8e027d2d5af957b68773ec4910d4be8edb62cbfe1060bbaecf8e309ce3c0bb03c6d2dacbade066fc673638680f71f81733961581159b5238060023fea3f42f88dcd91feef55fdc52129d6e12d2a09a02db5c9baa5889b6bbed94a9783168bf292a3ffadf0b8e9186319e345e8fe96f847bbf765a1aa39f51c65cf10c56442617926973141d6f1d0f15e7f3bb658899ceba60ab8509277716262aff369457085151925e0d1d8291a6b6c931eb3d6f3872ffbe82872d9ca0f4132b86ff18a94b881cdc196b45f831736da860ed7b5d579399211ccca64dd0378d6177d8b79355a47ccd54514dd23eb365e58b1ffbe9a6f047299422f6a1b74767cae6434d8a2bf1eafdbabac7b8ee5d401b602f0a6b987fe07dfbd4f330671cfcb68272ac24775648defb361edae3a085e5b91320e5d0cdf3717e548a8e27cd6942af79794fbe8f6f9fe794c5a4126bcd6366d62e94fe1d3f38afd134c86e7287305721c90f480a959372bdace5391955d6023ab932fd3c8179895300e576d9fe7a4e29c608ee99a2bd695400695511fd1dc0ad99576af862789444c32bb7e9bd80384498e5978fd8a6a502cb452a93ad01470dce3c30d63f081682b7afdd400901a4c8941fabddc2b4459c224417de6c223473cffcbe6077266d163d656fa1f571578530883fd8de637d08fdd65cab3427b44266abf34c1bcc7eb619180d1ba5b8e859c2f70bb0b4dfd0bcb728794d5fb4943ea48319f536540d83298eef8f7fe57381a5197acbfbcdbc765a87e0a2810b49a9db6793bcaa2e6835bd0bae8a3567117bdbeaab402d8d0df9290168f29dd3b8e9735458f824021daff29660eb420d0b7eb038e2f1a4533a8f0e97b8c6d0010d13010dc22c14b157025f67422d78ddc83813d2e7b315d0a3cd1659b13ab8ab7d265abf700402b8cd0ff0a243ff1a1b29601c59bd212e8d1d1744986c817494020d94de0533ee857000947ccdb60568c8c5ef27c5b8bafd6369c74c8dc32768d68620a3fc33d40824ba92f80b13da3e696e9ab646060c76eff7cb361b4b0af6e917af8d1830ad2850193d4bf5d47c9c2d0ff10fd23650db676d2addd0f00b4db8318d87a68ed504f7cac05e97194751e98b822068349d323a8c3f1ce306c2a7e68a1cc5d7692fe3fbb4929eda2393a8ee7f2227e816ac553bb248f62fdb401793ca7b581f7d7967d901b5dc93ffbb109bee111ac7fda6ff3b34a7a1755ee2cfb3b4a9fd87f1596fac1915866f210e46cab5d196dd84b2f636a402f4a8babdc1719902bfb29b574c679f6bdc62b55195bf613838ded7b35d8ad852107eede76cce1fdf795fd30e93625ec90e6de9486c7ec2ba4b4480da5add1886ecfbce6fb1a4042cbe94606a1468658a27e8772c011d4089b895b0873485753c81f6e8442a53fb79c942c8d7637c14a3b98429e0dbfdd761344bc39f1eecae0fafd997890b1fb6399a26378319b0eb6e14c761ecf23bb5605850c0347f1d00979911dd78e52238566f0c8d1fc9355ab18589a9b14bb955913a95f39f6d1baca0fee3f129d76843a5d79751225843e42803c4decc99187080f026bc185738a40abf6348004d6b59adbf2c9b6ba3eb726d9d1fbd5fa4fbd6ced16571123230750ff651efdb32b455d95085d6ae8f5d0131d484a87f082b7c0b4968b43413283702ae428751963bfadeaecfddd350bebca48372064090e2ddab8e2654a2959773fb9798fd7c0a73c66068e72e4a624d9eeaff7751bba5f33620d605a3c3833a5fb87d2175e2fd51725de8db2252aefe50ef538da0b3134cde60b2bdfe6d91fe6c5454459e57d2522bc36b388ad34e99c5858159bb30215383e1153c9fbbb9653859c77f1257cf3bf2ca459cf750107a37765b32063a6c4513249fe5cefe40465d4390a7824aa23e0e536d5eaaddfac106a4413d9ce7fc594d1459d83bad9c8940184387855f0e199042a30a237e8270e7fdea9eb4fae1ce80f8f6639f80410c4d29ffbfcae33f62528d46ec6ac7b6e22da2993ee2a822b42ebd0457764e08da26cd3ddd3941be30136abee3f1bad5218d4379df6479921bb5f9f6e6eff5c56ebd04c69b5a';
function decryptRSA(str: string) {
  try {
    const key = new NodeRSA(privateKey);
    const buffer = Buffer.from(b, 'hex');

    const decrypted = key.decrypt(buffer, 'utf8');

    const base64 = key.decrypt(buffer, 'base64');
    console.log(base64, 'base64');
    return decrypted;
    // const encryptor = new JSEncrypt(); // 新建JSEncrypt对象
    // // const privateKey = privateKeyObj[name]; // 私钥串
    // encryptor.setPrivateKey(privateKey); // 设置私钥
    // const buffer = Buffer.from(str, 'hex');
    // const _s = buffer.toString('base64');
    // console.log(buffer, _s);
    // const decrytStr = encryptor.decrypt(_s);
    // return decrytStr;
  } catch (error) {
    console.log(error);
    return 'error';
  }
}

const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const k = item[key];
    if (!acc[k]) {
      acc[k] = [];
    }
    acc[k].push(item);
    return acc;
  }, {});

const Welcome = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { isDarkMode } = useDarkmode();
  const [wallets, setWallets] = useState([]);
  const [getEmail, setGetEmail] = useState([]);
  browser.storage.local.get('email').then((data) => setGetEmail(data.email));

  const handleBtnClick = (mpcClientMasterKeys) => {
    const mpcClientMasterKey = mpcClientMasterKeys.find(
      (i) => i.walletAlgorithmType === 1
    );
    // browser.storage.local.set({ ['dream']: '11' });
    // console.log(mpcClientMasterKey);
    // browser.storage.local.get('dream').then((data) => console.log(data));
    const a = decryptRSA(b);
    console.log(a);
  };
  const formattedData = (result) => {
    const walletsMap = groupBy(result.wallets, 'walletId');
    const wallets: any = [];
    Object.keys(walletsMap).forEach((key) => {
      if (walletsMap[key].length > 0) {
        const defaultWallet = walletsMap[key][0];
        wallets.push({
          walletId: defaultWallet.walletId,
          walletName: defaultWallet.walletName,
          cloudDisk: walletsMap[key],
        });
      }
    });
    setWallets(wallets);
    console.log(wallets);
  };
  const getWalletRecovery = async () => {
    // axios.post(
    //   'http://api2.bitverse-dev-1.bitverse.zone/bitverse/wallet/v1/private/kms/wallet/recovery',
    //   {},
    //   {
    //     headers: {
    //       userToken:
    //         'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhcHBJZCI6ImJpdHZlcnNlX2FwcCIsInVzZXJJZCI6MjA4ODU3MDAwMDAxMDAxNiwicGxhdGZvcm0iOjEsImlzc3VlZF9hdCI6MTY4NDUwMjQ4ODA3MCwiZ2VuX3RzIjoxNjg0NTg4ODg4MDcwLCJleHBpcmVzX2F0IjoxNjg3MDk0NDg4MDcwLCJpYXQiOjE2ODQ1MDI0ODgsImV4cCI6MTY4NzE4MDg4OH0.MEYCIQDhojcAsdpQBeru2W9wp7LatcuTRy0ilogR2qSh4s4G5wIhAIhSTk9EYkjw0wkgj_fFnCHSUQ8bT6igIMeWxHVVSuSr',
    //       platform: 'android',
    //       'device-id': '634d410360b2b599152e1125',
    //       'User-Agent': 'bitverse_app/2.0.4/iphone14',
    //     },
    //   }
    // );
    if (data.retCode === 0) {
      formattedData(data.result);
    }
  };
  useEffect(() => {
    getWalletRecovery();
  }, []);
  return (
    <div className="opeinIndex-wrap mpc-recovery-wallet">
      <div className="header">
        <div>The cloud disk associated with</div>
        <div className="email">{getEmail}</div>
      </div>
      {wallets.map((item: any) => {
        return (
          <div key={item.walletId} className="item g-item-list">
            <div className="wallet-name">{item.walletName}</div>
            {item.cloudDisk.map((i) => {
              return (
                <div className="cloud-disk-item" key={i.cloudDiskType}>
                  <div
                    className={`icon-wrap ${typeMap[i.cloudDiskType].replace(
                      ' ',
                      ''
                    )}`}
                  ></div>
                  <div className="disk-name">{typeMap[i.cloudDiskType]}</div>
                  <CustomButton
                    type="primary"
                    disabled={i.cloudDiskType !== 2}
                    onClick={() => handleBtnClick(i.mpcClientMasterKey)}
                  >
                    立即同步
                  </CustomButton>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Welcome;
