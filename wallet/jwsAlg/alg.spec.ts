import { describe, it, expect } from 'vitest';
import sha256 from 'fast-sha256';
import * as u8a from 'uint8arrays';
import { Alg } from './types';
import { es256k } from './es256k';
import { es256 } from './es256';

const testGenKeyPair = (alg: Alg) => {
  const keyPair = alg.genKeyPair();

  expect(keyPair.publicKey.length).toEqual(33);
  expect(keyPair.privateKey.length).toEqual(32);
};

const testSignAndVerify = (alg: Alg) => {
  const keyPair = alg.genKeyPair();
  const msgHash = sha256(new TextEncoder().encode('hello'));
  const signature = alg.sign(keyPair.privateKey, msgHash);

  expect(alg.verify(keyPair.publicKey, msgHash, signature)).toBeTruthy;
};

const testJwkFromPublicKey = (alg: Alg) => {
  const publicKey = alg.genKeyPair().publicKey;
  const jwk = alg.jwkFromPublicKey(publicKey);

  expect(jwk.kty).toEqual('EC');
  expect(jwk.crv).toEqual(alg.crv());

  const xU8a = u8a.fromString(jwk.x, 'base64url');
  const yU8a = u8a.fromString(jwk.y, 'base64url');
  const isOdd = yU8a[yU8a.length - 1] & 1;
  const publicKey2 = new Uint8Array(33);
  publicKey2[0] = isOdd ? 3 : 2;
  publicKey2.set(xU8a, 1);
  expect(publicKey).toEqual(publicKey2);
};

const testJwkFromPrivateKey = (alg: Alg) => {
  const { publicKey, privateKey } = alg.genKeyPair();
  const jwk = alg.jwkFromPrivateKey(privateKey);

  expect(jwk.kty).toEqual('EC');
  expect(jwk.crv).toEqual(alg.crv());

  const xU8a = u8a.fromString(jwk.x, 'base64url');
  const yU8a = u8a.fromString(jwk.y, 'base64url');
  const isOdd = yU8a[yU8a.length - 1] & 1;
  const publicKey2 = new Uint8Array(33);
  publicKey2[0] = isOdd ? 3 : 2;
  publicKey2.set(xU8a, 1);
  expect(publicKey).toEqual(publicKey2);

  const privateKey2 = u8a.fromString(jwk.d!, 'base64url');
  expect(privateKey).toEqual(privateKey2);
};

describe('alg', () => {
  it('genKeyPair', () => {
    testGenKeyPair(es256k);
    testGenKeyPair(es256);
  });

  it('sign & alg.verify', () => {
    testSignAndVerify(es256k);
    testSignAndVerify(es256);
  });

  it('jwkFromPublicKey', () => {
    testJwkFromPublicKey(es256k);
    testJwkFromPublicKey(es256);
  });

  it('jwkFromPrivateKey', () => {
    testJwkFromPrivateKey(es256k);
    testJwkFromPrivateKey(es256);
  });
});
