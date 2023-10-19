import { CredentialOffer } from '@/types/oid4vci';
import * as Linking from 'expo-linking';
import { makeAuthRequestAsync } from 'auth-session/authRequest';
import {
  checkAuthResponse,
  parseAuthResponseUrl,
} from 'auth-session/authResponse';
import { nativeCrypto as crypto } from 'auth-session/nativeCrypto';
import { openAuthSessionAsync } from '@/auth-session/authSession';
import { functionsBaseUri } from '@/consts';

const redirectUri = Linking.createURL('');
const endpointUri = `${functionsBaseUri}/authorization`;

export const useAuthorization = (
  CredentialOfferState: CredentialOffer | undefined,
) => {
  const authorization = async () => {
    console.log('redirectUri :>> ', redirectUri);
    const req = await makeAuthRequestAsync({
      baseUrl: endpointUri,
      clientId: 'hoge',
      redirectUri,
      issuerState:
        CredentialOfferState?.grants.authorization_code?.issuer_state,
      crypto,
    });
    const ret = await openAuthSessionAsync(req.url, req.redirectUri);
    const url = checkAuthResponse(ret);
    return {
      result: parseAuthResponseUrl(url ? url : ''),
      codeVerifier: req.codeVerifier,
    };
  };
  return { authorization };
};
