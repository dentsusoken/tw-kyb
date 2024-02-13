import elliptic from 'elliptic';
import * as u8a from 'uint8arrays';
import { KeyPair, PUBLIC_KEY_PARAMS, PRIVATE_KEY_PARAMS } from './types';

export const genKeyPair = (ec: elliptic.ec): KeyPair => {
  const keyPair = ec.genKeyPair();
  const privateKey = u8a.fromString(keyPair.getPrivate('hex'), 'hex');
  const publicKey = Uint8Array.from(keyPair.getPublic().encodeCompressed());

  return { publicKey, privateKey };
};

export const xyFromPublicKey = (
  ec: elliptic.ec,
  publicKey: Uint8Array,
): PUBLIC_KEY_PARAMS => {
  const key = ec.keyFromPublic(publicKey);
  const pub = key.getPublic();
  const x = u8a.toString(Uint8Array.from(pub.getX().toArray()), 'base64url');
  const y = u8a.toString(Uint8Array.from(pub.getY().toArray()), 'base64url');

  return { x, y };
};

export const xydFromPrivateKey = (
  ec: elliptic.ec,
  privateKey: Uint8Array,
): PRIVATE_KEY_PARAMS => {
  const key = ec.keyFromPrivate(privateKey);
  const pub = key.getPublic();
  const x = u8a.toString(Uint8Array.from(pub.getX().toArray()), 'base64url');
  const y = u8a.toString(Uint8Array.from(pub.getY().toArray()), 'base64url');
  const d = u8a.toString(privateKey, 'base64url');

  return { x, y, d };
};

export const sign = (
  ec: elliptic.ec,
  privateKey: Uint8Array,
  msgHash: Uint8Array,
): Uint8Array => {
  const key = ec.keyFromPrivate(privateKey);
  const sig = key.sign(msgHash);
  const r = Uint8Array.from(sig.r.toArray());
  const s = Uint8Array.from(sig.s.toArray());
  const signature = new Uint8Array(r.length + s.length);
  signature.set(r, 0);
  signature.set(s, r.length);

  return signature;
};

export const verify = (
  ec: elliptic.ec,
  publicKey: Uint8Array,
  msgHash: Uint8Array,
  signature: Uint8Array,
): boolean => {
  const key = ec.keyFromPublic(publicKey);
  const mid = signature.length / 2;
  const r = signature.slice(0, mid);
  const s = signature.slice(mid);

  return key.verify(msgHash, { r, s });
};
