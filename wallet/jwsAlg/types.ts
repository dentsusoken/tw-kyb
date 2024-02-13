export type KeyPair = {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
};

export type PUBLIC_KEY_PARAMS = {
  x: string;
  y: string;
};

export type PRIVATE_KEY_PARAMS = PUBLIC_KEY_PARAMS & {
  d: string;
};

type COMMON_JWK = {
  kty: string;
  crv: string;
};

export type PublicJwk = COMMON_JWK & PUBLIC_KEY_PARAMS;
export type PrivateJwk = COMMON_JWK & PRIVATE_KEY_PARAMS;

export interface Alg {
  alg: () => string;
  crv: () => string;
  kty: () => string;

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
