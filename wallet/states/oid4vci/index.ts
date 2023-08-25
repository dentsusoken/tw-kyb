import { atom } from 'recoil';
import { CredentialOffer } from '@/types/oid4vci';

export const CredentialOfferState = atom<CredentialOffer>({
    key: 'credentialOffer',
    default: {
        "credential_issuer": '',
        "credentials": [],
        "grants": {
            "authorization_code": {
                "issuer_state": '',
            },
            "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
                "pre-authorized_code": '',
                "user_bin_required": false,
            }
        }

    },
});