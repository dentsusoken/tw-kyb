import elliptic from 'elliptic';
import * as u8a from 'uint8arrays';
import { Alg, KeyPair, PublicJwk, PrivateJwk } from './types';
import * as ecdsa from './ecdsa';

export const ec = new elliptic.ec('secp256k1');
export const ALG = 'ES256K';
export const CRV = 'secp256k1';
export const KTY = 'EC';

export const es256k: Alg = {
  alg: (): string => {
    return ALG;
  },

  crv: (): string => {
    return CRV;
  },

  kty: (): string => {
    return KTY;
  },

  genKeyPair: (): KeyPair => {
    return ecdsa.genKeyPair(ec);
  },

  sign: (privateKey: Uint8Array, msgHash: Uint8Array): Uint8Array => {
    return ecdsa.sign(ec, privateKey, msgHash);
  },

  verify: (
    publicKey: Uint8Array,
    msgHash: Uint8Array,
    signature: Uint8Array,
  ): boolean => {
    return ecdsa.verify(ec, publicKey, msgHash, signature);
  },

  jwkFromPublicKey: (publicKey: Uint8Array): PublicJwk => {
    const { x, y } = ecdsa.xyFromPublicKey(ec, publicKey);
    return {
      kty: 'EC',
      crv: CRV,
      x,
      y,
    };
  },

  jwkFromPrivateKey: (privateKey: Uint8Array): PrivateJwk => {
    const { x, y, d } = ecdsa.xydFromPrivateKey(ec, privateKey);
    return {
      kty: 'EC',
      crv: CRV,
      x,
      y,
      d,
    };
  },
};
