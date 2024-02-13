import elliptic from 'elliptic';
import * as u8a from 'uint8arrays';

const secp256k1 = new elliptic.ec('secp256k1');
const p256 = new elliptic.ec('p256');

type KeyPair = {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
};

type PUBLIC_KEY_PARAMS = {
  x: string;
  y: string;
};

type PRIVATE_KEY_PARAMS = PUBLIC_KEY_PARAMS & {
  d: string;
};

type COMMON_JWK = {
  kty: string;
  crv: string;
};

type PublicJwk = COMMON_JWK & PUBLIC_KEY_PARAMS;
type PrivateJwk = COMMON_JWK & PRIVATE_KEY_PARAMS;

export interface Alg {
  genKeyPair: () => KeyPair;

  sign: (privateKey: Uint8Array, msgHash: Uint8Array) => Uint8Array;

  verify: (
    publicKey: Uint8Array,
    msgHash: Uint8Array,
    signature: Uint8Array,
  ) => boolean;

  jwkFromPublicKey: (publicKey: Uint8Array) => PublicJwk;

  jwkFromPrivateKey: (privateKey: Uint8Array) => PrivateJwk;
}

export const secp256k1Alg: Alg = {
  genKeyPair: (): KeyPair => {
    return genKeyPair(secp256k1);
  },

  sign: (privateKey: Uint8Array, msgHash: Uint8Array): Uint8Array => {
    return sign(secp256k1, privateKey, msgHash);
  },

  verify: (
    publicKey: Uint8Array,
    msgHash: Uint8Array,
    signature: Uint8Array,
  ): boolean => {
    return verify(secp256k1, publicKey, msgHash, signature);
  },

  jwkFromPublicKey: (publicKey: Uint8Array): PublicJwk => {
    const { x, y } = xyFromPublicKey(secp256k1, publicKey);
    return {
      kty: 'EC',
      crv: 'secp256k1',
      x,
      y,
    };
  },

  jwkFromPrivateKey: (privateKey: Uint8Array): PrivateJwk => {
    const { x, y, d } = xydFromPrivateKey(secp256k1, privateKey);
    return {
      kty: 'EC',
      crv: 'secp256k1',
      x,
      y,
      d,
    };
  },
};

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
