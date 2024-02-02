import { describe, it, expect } from 'vitest';

import { getPubKey, sign } from './tECDSA';
import sha256 from 'fast-sha256';

const idToken =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY5NjI5NzU5NmJiNWQ4N2NjOTc2Y2E2YmY0Mzc3NGE3YWE5OTMxMjkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vdHctc2lnbmF0dXJlIiwiYXVkIjoidHctc2lnbmF0dXJlIiwiYXV0aF90aW1lIjoxNzA2NzQ1MjM4LCJ1c2VyX2lkIjoiZzVxbFQ0bk1RTlJ3RUFYZWU2NjRzd3pkMTE0MyIsInN1YiI6Imc1cWxUNG5NUU5Sd0VBWGVlNjY0c3d6ZDExNDMiLCJpYXQiOjE3MDY4MzYxOTcsImV4cCI6MTcwNjgzOTc5NywiZW1haWwiOiJlYmlzYXdhLnJ5b2hlaUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiZWJpc2F3YS5yeW9oZWlAZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.gDU6eoGER3vPC_cgnIBd8aTM2WAex5pTQl6F9FoJRAHhhXNKIZSApBiWsqXRuA75v3Zcoo8W3FadfEeRUuHadZO8H4N1sDna_CJyppQQhhbx1TQ5QP4-9_89AhVjqtHsSe2_FteAggh7T9h5U5x-3NTqThGNcIM5KNeMHq15C-fkd5xBjGrjO-o7PlE_jhuK_CbFOsk1_kF3odEpyEekxPl18HHxmL2YgHQf3LsBAHmQtyXWsSx-NCN0xNjbsOFKZ19xq8GOEE3R_O1u2zWVkfad6C3H0i4qtd21UC5bUZ5LUDiXFgHuQantlWty4JDMbyHLgZGuRpwg3aIz6YmRaA';
const msg = 'LPJNul-wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ';

describe('tECDSA', () => {
  it('getPubKey should work', async () => {
    const pub_key = await getPubKey(idToken);

    expect(pub_key).toBeDefined();
  }, 100000);

  it('sign should work', async () => {
    const signature = await sign(
      idToken,
      sha256(new TextEncoder().encode(msg)),
    );

    expect(signature).toBeDefined();
  });
}, 100000);
