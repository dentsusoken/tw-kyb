import { describe, it, expect } from 'vitest';

import { makeAuthRequestAsync } from './authRequest';
import { nodeCrypto as crypto } from './nodeCrypto';

describe('authRequest', () => {
  it('makeAuthRequestAsync', async () => {
    const baseUri = 'https://issuer.com/authorize';
    const clientId = 'hoge';
    const redirectUri = 'haip://';
    const issuerState = 'abc';
    const authReq = await makeAuthRequestAsync({
      baseUri,
      clientId,
      redirectUri,
      issuerState,
      crypto,
    });
    console.log(authReq);
    expect(authReq).toBeDefined();
    expect(
      authReq.uri.startsWith(
        'https://issuer.com/authorize?response_type=code&client_id=hoge',
      ),
    ).toBeTruthy();
    expect(authReq.uri.indexOf('&code_challenge=') >= 0).toBeTruthy();
    expect(
      authReq.uri.indexOf(
        '&code_challenge_method=S256&authorization_details=%5B%7B%22type%22%3A%22openid_credential%22%2C%22format%22%3A%22vc%2Bsd-jwt%22%2C%22credential_definition%22%3A%7B%22type%22%3A%5B%22IdentityCredential%22%5D%7D%7D%5D&redirect_uri=haip%3A%2F%2F&issuer_state=abc',
      ) >= 0,
    ).toBeTruthy();
    expect(authReq.codeVerifier).toBeDefined();
  });
});
