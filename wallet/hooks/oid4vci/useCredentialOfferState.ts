import { useRecoilState } from 'recoil';
import { CredentialOfferState } from '@/states/oid4vci';
import { CredentialOffer } from '@/types/oid4vci';
import { Alert } from 'react-native';
import { openAuthSessionAsync } from '@/auth-session/authSession';
import { getQueryParams } from '@/auth-session/queryParams';
import * as Linking from 'expo-linking';

export const useCredentialOfferState = () => {
  const [credentialOfferParams, setCredentialOfferParams] =
    useRecoilState(CredentialOfferState);
  const redirectUri = Linking.createURL('');

  const execCredentialOffer = async () => {
    setCredentialOfferParams(() => undefined);
    const uri = `https://tw-isid-test.web.app/api/offer/issue?redirect_uri=${redirectUri}`;
    const result = await openAuthSessionAsync(uri, redirectUri);
    result.url && parseUri(result.url);
  };

  const parseUri = async (uri: string): Promise<void> => {
    try {
      setCredentialOfferParams(() => undefined);
      const query = getQueryParams(uri);
      if ('credential_offer' in query) {
        const params = JSON.parse(query.credential_offer);
        validateParams(params) && setCredentialOfferParams(() => params);
      } else if ('credential_offer_uri' in query) {
        const res = await fetch(query.credential_offer_uri);
        const params = await res.json();
        validateParams(params) && setCredentialOfferParams(() => params);
      } else {
        throw new Error('invalid parameter');
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
