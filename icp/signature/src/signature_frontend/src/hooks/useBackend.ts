import { useEffect, useState } from 'react';

import { signatureBackend } from '@/canisters';

import { isOk } from '@/utils/variantUtils';

export const useBackend = () => {
  const [error, setError] = useState('');
  const [publicKey, setPublickey] = useState<Uint8Array | undefined>(undefined);

  useEffect(() => {
    const f = async () => {
      try {
        const res = await signatureBackend.public_key();
        if (isOk(res)) {
          setPublickey(res.Ok.public_key as Uint8Array);
        } else {
          setError(res.Err);
        }
      } catch (e: any) {
        setError(e.message);
      }
    };
    f();
  }, []);

  return { publicKey, error };
};
