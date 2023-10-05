import { ParsedAuthResponseUrl } from '@/auth-session/authResponse';
import { tokenState } from '@/states/oid4vci';
import { useRecoilState } from 'recoil';
import {
  makeAuthTokenRequest,
  makePreAuthTokenRequest,
  fetchAuthTokenRequestAsync,
} from 'auth-session/tokenRequest';
import * as Linking from 'expo-linking';
import { functionsBaseUri } from '@/consts';

const redirectUri = Linking.createURL('');
const endpointUri = `${functionsBaseUri}/token`;

export const useToken = () => {
  const [token, setToken] = useRecoilState(tokenState);

  const AuthTokenRequest = async (
    authResponse: ParsedAuthResponseUrl,
    codeVerifier: string,
  ) => {
    const req = makeAuthTokenRequest({
      clientId: 'hoge',
      code: authResponse.code,
      codeVerifier,
      redirectUri: redirectUri,
    });

    const result = await fetchAuthTokenRequestAsync(endpointUri, req);

    setToken(result);
    return result;
  };

  const PreAuthTokenRequest = async (
    preAuthorizedCode: string,
    userPin?: string,
  ) => {
    const req = makePreAuthTokenRequest({
      clientId: 'hoge',
      preAuthorizedCode,
      userPin,
    });

    const result = await fetchAuthTokenRequestAsync(endpointUri, req);

    setToken(result);
    return result;
  };

  return { token, AuthTokenRequest, PreAuthTokenRequest };
};
