type CredentialConfiguration = {
  format: string;
  claims: {
    [index: string]: any;
  };
  scope: string;
  [index: string]: any;
};

export type IssuerMetadata = {
  credential_issuer: string;
  credential_endpoint: string;
  batch_credential_endpoint?: string;
  deferred_credential_endpoint?: string;
  credential_configurations_supported: {
    [index: string]: CredentialConfiguration;
  };
};

export type OpenidConfiguration = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  introspection_endpoint: string;
  pushed_authorization_request_endpoint: string;
  [index: string]: any;
};

export type TokenRequest4PreAuthorizedCodeFlow = {
  tokenEndpoint: string;
  clientId: string;
  preAuthorizedCode: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
  refresh_token?: string;
  c_nonce: string;
  c_nonce_expires_in: number;
};

export type CredentialRequest4VcSdJwt = {
  credentialEndpoint: string;
  accessToken: string;
  vct: string;
  keyProofJwt: string;
};

export type CredentialResponse = {
  credential: string;
  c_nonce: string;
  c_nonce_expires_in: number;
};
