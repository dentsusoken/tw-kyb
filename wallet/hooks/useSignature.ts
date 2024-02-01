import { useEffect, useState } from 'react';
import sha256 from 'fast-sha256';
import { ecdsaVerify } from 'secp256k1';
import { auth } from '@/firebaseConfig';
import * as u8a from 'uint8arrays';

const BACKEND_URL = 'https://bf3rp-yyaaa-aaaag-achoq-cai.raw.icp0.io';

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

          const req_body = { token: idToken };
          console.log(req_body);

          const res2 = await fetch(`${BACKEND_URL}/public_key`, {
            method: 'POST',
            body: JSON.stringify(req_body),
          });
          const res2_json = await res2.json();
          if (res2_json.error) {
            console.error(res2_json.error);
          } else {
            const pub_key = u8a.fromString(res2_json.pub_key, 'base64url');
            setPublickey(pub_key);
            console.log('fetch publicKey:', pub_key);
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

  const onMessageChange = (v: string) => {
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

          const req_body = {
            token: idToken,
            message_hash: u8a.toString(hash, 'base64url'),
          };
          console.log(req_body);

          const res2 = await fetch(`${BACKEND_URL}/sign`, {
            method: 'POST',
            body: JSON.stringify(req_body),
          });
          const res2_json = await res2.json();
          if (res2_json.error) {
            console.error(res2_json.error);
          } else {
            const signature = u8a.fromString(res2_json.signature, 'base64url');
            setSignature(signature);
            console.log('fetch signature:', signature);
          }
        }
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
