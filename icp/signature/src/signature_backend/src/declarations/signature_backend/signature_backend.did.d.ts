import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface ExpectedActual { 'actual' : string, 'expected' : string }
export type Result = { 'Ok' : Uint8Array | number[] } |
  { 'Err' : SignatureError };
export type SignatureError = { 'NoMaxAgeSpecified' : null } |
  { 'IdTokenNotThreeParts' : null } |
  { 'IatFuture' : bigint } |
  { 'IdTokenExpired' : bigint } |
  { 'NonNumericMaxAge' : string } |
  { 'KidNotFound' : null } |
  { 'AuthTimeFuture' : bigint } |
  { 'InvalidAlg' : ExpectedActual } |
  { 'InvalidAud' : ExpectedActual } |
  { 'InvalidIss' : ExpectedActual } |
  { 'VerifyError' : string } |
  { 'ICError' : string } |
  { 'MaxAgeValueEmpty' : null } |
  { 'SerdeError' : string } |
  { 'SubEmpty' : null } |
  { 'NoCacheControlHeader' : null } |
  { 'Base64Error' : string };
export interface _SERVICE {
  'public_key' : ActorMethod<[string], Result>,
  'sign' : ActorMethod<[Uint8Array | number[], string], Result>,
}
