import CryptoJS from 'crypto-js';

export function resolveSignature(
  _accessKeyId: string,
  _accessKeySecret: string,
  base64Content: string,
  serverTime: number
) {
  if (_accessKeySecret === '' || _accessKeyId === '') {
    return '';
  }
  const hmacSha256 = CryptoJS.algo.HMAC.create(
    CryptoJS.algo.SHA256,
    _accessKeySecret
  );
  const content = `${_accessKeyId}${base64Content}${serverTime}`;
  console.log(`[resolveSignature] serverTime = `, serverTime);
  console.log(`[resolveSignature] content = `, content);
  const signature = hmacSha256.update(content).finalize().toString();
  return signature;
}
