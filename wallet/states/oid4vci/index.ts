import { atom } from 'recoil';
import { CredentialOffer } from '@/types/oid4vci';
import { AuthTokenResponse } from '@/auth-session/tokenRequest';

export const CredentialOfferState = atom<CredentialOffer | undefined>({
  key: 'credentialOff er',
  default: undefined,
});

export const tokenState = atom<AuthTokenResponse | undefined>({
  key: 'token',
  default: undefined,
});
