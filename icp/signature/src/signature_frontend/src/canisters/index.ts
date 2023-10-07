import { createActor } from '@/canisters/actorUtils';

import { _SERVICE as SIGNATURE_BACKEND_SERVICE } from '../../../src/declarations/signature_backend/signature_backend.did';

const signatureBackendCanisterId = (process.env
  .NEXT_PUBLIC_SIGNATURE_BACKEND_CANISTER_ID ||
  process.env.SIGNATURE_BACKEND_CANISTER_ID) as string;
const signatureBackendIdlFactory =
  require('../../../src/declarations/signature_backend/signature_backend.did.js').idlFactory;

export const signatureBackend = createActor<SIGNATURE_BACKEND_SERVICE>(
  signatureBackendCanisterId,
  signatureBackendIdlFactory
);
