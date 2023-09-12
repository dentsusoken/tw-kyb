import { makeAuthDetail4VcSdJwt } from './authDetail';
import type { Crypto } from './crypto';
import { buildCodeAsync } from './pkce';
import { Params, buildQueryString } from './queryParams';

type MakeAuthRequestInput = {
  baseUri: string;
  clientId: string;
  redirectUri: string;
  issuerState?: string;
  crypto: Crypto;
};

type MakeAuthRequestOutput = {
  url: string;
  codeVerifier: string;
  redirectUri: string;
};

export const makeAuthRequestAsync = async ({
  baseUri,
  clientId,
  redirectUri,
  issuerState,
  crypto,
}: MakeAuthRequestInput): Promise<MakeAuthRequestOutput> => {
  const { codeVerifier, codeChallenge } = await buildCodeAsync(128, crypto);
  const authDetails = JSON.stringify([makeAuthDetail4VcSdJwt()]);
  const params: Params = {
    response_type: 'code',
    client_id: clientId,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    authorization_details: authDetails,
    redirect_uri: redirectUri,
  };

  if (issuerState) {
    params.issuer_state = issuerState;
  }
  const url = `${baseUri}?${buildQueryString(params)}`;

  return { url, codeVerifier, redirectUri };
};
