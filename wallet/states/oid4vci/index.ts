import { atom } from 'recoil';
import { CredentialOffer } from '@/types/oid4vci';

export const CredentialOfferState = atom<CredentialOffer | undefined>({
    key: 'credentialOffer',
    default: undefined,
});