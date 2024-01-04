export const idlFactory = ({ IDL }) => {
  const ExpectedActual = IDL.Record({
    'actual' : IDL.Text,
    'expected' : IDL.Text,
  });
  const SignatureError = IDL.Variant({
    'NoMaxAgeSpecified' : IDL.Null,
    'IdTokenNotThreeParts' : IDL.Null,
    'IatFuture' : IDL.Nat64,
    'IdTokenExpired' : IDL.Nat64,
    'NonNumericMaxAge' : IDL.Text,
    'KidNotFound' : IDL.Null,
    'AuthTimeFuture' : IDL.Nat64,
    'InvalidAlg' : ExpectedActual,
    'InvalidAud' : ExpectedActual,
    'InvalidIss' : ExpectedActual,
    'VerifyError' : IDL.Text,
    'ICError' : IDL.Text,
    'MaxAgeValueEmpty' : IDL.Null,
    'SerdeError' : IDL.Text,
    'SubEmpty' : IDL.Null,
    'NoCacheControlHeader' : IDL.Null,
    'Base64Error' : IDL.Text,
  });
  const Result = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Nat8),
    'Err' : SignatureError,
  });
  return IDL.Service({
    'public_key' : IDL.Func([IDL.Text], [Result], []),
    'sign' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
