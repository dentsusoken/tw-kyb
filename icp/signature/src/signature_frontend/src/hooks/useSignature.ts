import { useEffect, useState, ChangeEventHandler } from 'react';
import sha256 from 'fast-sha256';
import { ecdsaVerify } from 'secp256k1';
import { signatureBackend } from '@/canisters';

import { isOk } from '@/utils/variantUtils';
import { auth } from '@/firebaseConfig';

const parseIdToken = (idToken: string) => {
  console.log('IdToken:', idToken);
  const [headerBase64, bodyBase64, signature] = idToken.split('.');
  const header = JSON.parse(Buffer.from(headerBase64, 'base64').toString());
  const body = JSON.parse(Buffer.from(bodyBase64, 'base64').toString());

  console.log('Header:', header);
  console.log('Body:', body);
};

export const useSignature = () => {
  const [publicKey, setPublickey] = useState<Uint8Array | undefined>();
  const [publicKeyQuering, setPublickeyQuering] = useState(false);
  const [_, setMessage] = useState<string | undefined>();
  const [hash, setHash] = useState<Uint8Array | undefined>();
  const [signature, setSignature] = useState<Uint8Array | undefined>();
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');

  useEffect(() => {
    const f = async () => {
      setError('');
      setPublickeyQuering(true);
      try {
        if (auth.currentUser) {
          const idToken = await auth.currentUser.getIdToken(true);
          parseIdToken(idToken);
          const res = await signatureBackend.public_key(idToken);
          if (isOk(res)) {
            console.log('publicKey:', res.Ok);
            setPublickey(res.Ok as Uint8Array);
          } else {
            setError(res.Err.toString());
          }
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setPublickeyQuering(false);
      }
    };
    f();
  }, []);

  const onMessageChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const v = e.target.value;
    setMessage(v);

    if (v && v.length > 0) {
      setHash(sha256(new TextEncoder().encode(v)));
    } else {
      setHash(undefined);
    }
  };

  const onSignClick = async () => {
    if (hash) {
      setError('');
      setSigning(true);
      setSignature(undefined);
      try {
        if (auth.currentUser) {
          const idToken = await auth.currentUser.getIdToken(true);
          parseIdToken(idToken);
          const res = await signatureBackend.sign(hash, idToken);
          if (isOk(res)) {
            console.log('signature:', res.Ok);
            setSignature(res.Ok as Uint8Array);
          } else {
            setError(res.Err.toString());
          }
        }
        // const res = await signatureBackend.sign(hash);
        // if (isOk(res)) {
        //   console.log('signature:', res.Ok);
        //   setSignature(res.Ok as Uint8Array);
        // } else {
        //   setError(res.Err);
        // }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setSigning(false);
      }
    }
  };

  const onVerifyClick = () => {
    setVerifyMessage('');
    if (!signature || !hash || !publicKey) {
      return;
    }

    if (ecdsaVerify(signature, hash, publicKey)) {
      setVerifyMessage('Signature is verified');
    } else {
      setVerifyMessage('Signature fails to verify');
    }
  };

  return {
    publicKey,
    publicKeyQuering,
    hash,
    signature,
    signing,
    error,
    verifyMessage,
    onMessageChange,
    onSignClick,
    onVerifyClick,
  };
};
