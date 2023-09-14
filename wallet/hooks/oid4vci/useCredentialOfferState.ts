import { useRecoilState } from 'recoil';
import { CredentialOfferState } from '@/states/oid4vci';
import { CredentialOffer } from '@/types/oid4vci';
import { Alert } from 'react-native';
import { openAuthSessionAsync } from '@/auth-session/authSession';
import * as Linking from 'expo-linking';

export const useCredentialOfferState = () => {
  const [credentialOfferParams, setCredentialOfferParams] =
    useRecoilState(CredentialOfferState);
  const redirectUri = Linking.createURL('', {
    scheme: 'openid-credential-offer',
  });

  const execCredentialOffer = async () => {
    const uri = `https://tw-isid-test.web.app/api/offer/issue?redirect_uri=${redirectUri}`;
    const result = await openAuthSessionAsync(uri, redirectUri);
    result.url && parseUri(result.url);
  };

  const parseUri = async (uri: string): Promise<void> => {
    try {
      setCredentialOfferParams(() => undefined);
      const [_, query] = uri.split('?');
      const [method, str] = decodeURIComponent(query).split('=');
      if (method === 'credential_offer') {
        const params = JSON.parse(str);
        validateParams(params) && setCredentialOfferParams(() => params);
      } else if (method === 'credential_offer_uri') {
        const res = await fetch(str);
        const params = await res.json();
        validateParams(params) && setCredentialOfferParams(() => params);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const validateParams = (params: unknown): params is CredentialOffer => {
    const isValid =
      'credential_issuer' in (params as CredentialOffer) &&
      'credentials' in (params as CredentialOffer) &&
      (params as CredentialOffer).credentials.length > 0 &&
      'grants' in (params as CredentialOffer) &&
      ('authorization_code' in (params as CredentialOffer).grants ||
        'urn:ietf:params:oauth:grant-type:pre-authorized_code' in
          (params as CredentialOffer).grants);
    if (!isValid) {
      Alert.alert('invalid_credentil_offer', 'Required paraeters are missing.');
    }
    return isValid;
  };

  return {
    credentialOfferParams,
    parseUri,
    execCredentialOffer,
  };
};
