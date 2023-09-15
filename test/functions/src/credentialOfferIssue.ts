import * as functions from 'firebase-functions';
import * as logger from 'firebase-functions/logger';
import * as crypto from 'crypto';

type Grants = {
  authorization_code?: {
    issuer_state?: string;
  };
  'urn:ietf:params:oauth:grant-type:pre-authorized_code'?: {
    'pre-authorized_code': string;
    user_bin_required?: boolean;
  };
};

export const credentialOfferIssue = functions
  .region('asia-northeast1')
  .https.onRequest((request, response) => {
    const bodyJson = JSON.parse(request.body);
    logger.log('method:', request.method);
    if (request.method !== 'POST') {
      response.status(400).send('error=The medhod should be POST');
      return;
    }

    logger.log('body:', request.body);
    if (!request.body && !bodyJson.credentials && !bodyJson.endpoint) {
      response.status(400).send('error=Illegal body');
      return;
    }

    try {
      const S =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const N = 16;
      const grants: Grants = {};

      if (bodyJson.authCodeGrant) {
        grants.authorization_code = {};
        if (bodyJson.issuerState) {
          grants.authorization_code.issuer_state = Array.from(
            crypto.getRandomValues(new Uint8Array(N))
          )
            .map((n) => S[n % S.length])
            .join('');
        }
      }
      if (bodyJson.preAuthCodeGrant) {
        grants['urn:ietf:params:oauth:grant-type:pre-authorized_code'] = {
          'pre-authorized_code': Array.from(
            crypto.getRandomValues(new Uint8Array(N))
          )
            .map((n) => S[n % S.length])
            .join(''),
        };
        if (bodyJson.pinReq) {
          grants[
            'urn:ietf:params:oauth:grant-type:pre-authorized_code'
          ].user_bin_required = true;
        }
      }

      const credentialOffer = {
        credential_issuer: 'https://tw-isid-test.web.app/',
        credentials: JSON.parse(bodyJson.credentials),
        grants,
      };

      const uri = `${bodyJson.endpoint}?credential_offer=${encodeURIComponent(
        JSON.stringify(credentialOffer)
      )}`;
      response.status(200).send(uri);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      response.status(400).send(`error=${e.message}`);
    }
  });
