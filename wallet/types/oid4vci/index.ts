export type CredentialOffer = {
    "credential_issuer": string;
    "credentials": unknown[];
    "grants": {
        "authorization_code"?: {
            "issuer_state"?: string;
        },
        "urn:ietf:params:oauth:grant-type:pre-authorized_code"?: {
            "pre-authorized_code": string;
            "user_bin_required"?: boolean;
        }
    }
}