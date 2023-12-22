use crate::error::{ExpectedActual, SignatureError};
use crate::jwk_keys::{JwkKey, JwkKeys};
use crate::rsa::{rsassa_pkcs1_v15_verify, RSAPublicKey};
use base64::{engine::general_purpose, Engine as _};
use serde::{de::DeserializeOwned, Deserialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Deserialize)]
pub struct Header {
    pub alg: String,
    pub kid: String,
}

impl Header {
    fn verify<'a>(&self, jwk_keys: &'a JwkKeys) -> Result<&'a JwkKey, SignatureError> {
        if self.alg != *"RS256" {
            return Err(SignatureError::InvalidAlg(ExpectedActual {
                expected: "RS256".to_string(),
                actual: self.alg.clone(),
            }));
        }
        let key = jwk_keys
            .get_key(&self.kid)
            .ok_or(SignatureError::KidNotFound)?;
        if key.alg != *"RS256" {
            return Err(SignatureError::InvalidAlg(ExpectedActual {
                expected: "RS256".to_string(),
                actual: key.alg.clone(),
            }));
        }
        Ok(key)

        //     if key.alg != *"RS256" {
        //         return Err(SignatureError::InvalidAlg(ExpectedActual {
        //             expected: "RS256".to_string(),
        //             actual: key.alg.clone(),
        //         }));
        //     }
        //     Ok(key)
        // }
    }
}

#[derive(Deserialize)]
pub struct Payload {
    pub iss: String,
    pub aud: String,
    pub sub: String,
    pub exp: u64,
    pub iat: u64,
    pub auth_time: u64,
}

const SKEW_TIME: u64 = 300;

impl Payload {
    fn verify(&self, project_id: &str, now: &SystemTime) -> Result<Vec<u8>, SignatureError> {
        let expected_iss = iss(project_id);
        if self.iss != expected_iss {
            return Err(SignatureError::InvalidIss(ExpectedActual {
                expected: expected_iss,
                actual: self.iss.clone(),
            }));
        }

        if self.aud != *project_id {
            return Err(SignatureError::InvalidAud(ExpectedActual {
                expected: project_id.to_string(),
                actual: self.aud.clone(),
            }));
        }

        if self.sub.is_empty() {
            return Err(SignatureError::SubEmpty);
        }

        let now_secs = now.duration_since(UNIX_EPOCH).unwrap().as_secs();

        if self.auth_time > now_secs + SKEW_TIME {
            return Err(SignatureError::AuthTimeFuture(self.auth_time));
        }

        if self.iat > now_secs + SKEW_TIME {
            return Err(SignatureError::IatFuture(self.iat));
        }

        if self.exp <= now_secs - SKEW_TIME {
            return Err(SignatureError::IdTokenExpired(self.exp));
        }

        Ok(derivation_path(&self.iss, &self.sub))
    }
}

fn split3(token: &str) -> Result<[&str; 3], SignatureError> {
    let parts: Vec<&str> = token.split('.').collect();
    parts
        .try_into()
        .map_err(|_| SignatureError::IdTokenNotThreeParts)
}

fn decode<T: DeserializeOwned>(b64: &str) -> Result<T, SignatureError> {
    let bytes = general_purpose::URL_SAFE_NO_PAD
        .decode(b64)
        .map_err(|e| SignatureError::Base64Error(e.to_string()))?;
    //println!("{:?}", String::from_utf8(bytes.clone()));
    serde_json::from_slice(bytes.as_slice()).map_err(|e| SignatureError::SerdeError(e.to_string()))
}

fn derivation_path(iss: &str, sub: &str) -> Vec<u8> {
    format!("{} {}", iss, sub).into_bytes()
}

fn iss(project_id: &str) -> String {
    format!("https://securetoken.google.com/{}", project_id)
}

pub fn verify(
    id_token: &str,
    jwk_keys: &JwkKeys,
    project_id: &str,
    now: &SystemTime,
) -> Result<Vec<u8>, SignatureError> {
    let parts = split3(id_token)?;
    let header = decode::<Header>(parts[0])?;
    let jwk_key = header.verify(jwk_keys)?;
    let payload = decode::<Payload>(parts[1])?;
    let path = payload.verify(project_id, now)?;
    let pub_key = RSAPublicKey::new(jwk_key.n.as_bytes(), jwk_key.e.as_bytes());
    let m = format!("{}.{}", parts[0], parts[1]);
    let _ = rsassa_pkcs1_v15_verify(&pub_key, m.as_bytes(), parts[2].as_bytes())
        .map_err(SignatureError::VerifyError);

    Ok(path)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::jwk_keys::JwkKeysNewArgument;
    use rsa::{
        pkcs1v15::SigningKey, sha2::Sha256, signature::Signer, traits::PublicKeyParts,
        RsaPrivateKey,
    };
    use std::time::Duration;

    const B64_HEADER: &str =
        "eyJhbGciOiJSUzI1NiIsImtpZCI6ImRhMGI1ZDQyNDRjY2ZiNzViMjcwODQxNjI5NWYwNWQ1MThjYTY5MDMifQ";

    const PAYLOAD: &[u8] = r#"{"iss": "https://securetoken.google.com/YOUR_PROJECT_ID",
  "provider_id": "anonymous",
  "aud": "YOUR_PROJECT_ID",
  "auth_time": 1501381779,
  "user_id": "USER_ID",
  "sub": "USER_ID",
  "iat": 1501654829,
  "exp": 1501658429,
  "firebase": {
    "identities": {},
    "sign_in_provider": "anonymous"
  }
}"#
    .as_bytes();

    const B64_PAYLOAD: &str = "eyJpc3MiOiAiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL1lPVVJfUFJPSkVDVF9JRCIsCiAgInByb3ZpZGVyX2lkIjogImFub255bW91cyIsCiAgImF1ZCI6ICJZT1VSX1BST0pFQ1RfSUQiLAogICJhdXRoX3RpbWUiOiAxNTAxMzgxNzc5LAogICJ1c2VyX2lkIjogIlVTRVJfSUQiLAogICJzdWIiOiAiVVNFUl9JRCIsCiAgImlhdCI6IDE1MDE2NTQ4MjksCiAgImV4cCI6IDE1MDE2NTg0MjksCiAgImZpcmViYXNlIjogewogICAgImlkZW50aXRpZXMiOiB7fSwKICAgICJzaWduX2luX3Byb3ZpZGVyIjogImFub255bW91cyIKICB9Cn0";

    #[test]
    fn test_split3() {
        let parts = split3("a.b.c").unwrap();
        assert_eq!(["a", "b", "c"], parts);
    }

    #[test]
    fn test_split3_err() {
        let r = split3("a.b");
        //println!("{:?}", r);
        assert!(r.is_err());
        assert_eq!("IdTokenNotThreeParts", r.err().unwrap().to_string());
    }

    #[test]
    fn test_decode_header() {
        let header = decode::<Header>(B64_HEADER).unwrap();
        assert_eq!("RS256", header.alg);
        assert_eq!("da0b5d4244ccfb75b2708416295f05d518ca6903", header.kid);
    }

    #[test]
    fn test_decode_payload() {
        let payload = decode::<Payload>(B64_PAYLOAD).unwrap();
        assert_eq!(
            "https://securetoken.google.com/YOUR_PROJECT_ID",
            payload.iss
        );
        assert_eq!("YOUR_PROJECT_ID", payload.aud);
        assert_eq!("USER_ID", payload.sub);
        assert_eq!(1501654829, payload.iat);
        assert_eq!(1501658429, payload.exp);
        assert_eq!(1501381779, payload.auth_time);
    }

    #[test]
    fn test_derivation_path() {
        assert_eq!("iss sub".as_bytes(), derivation_path("iss", "sub"));
    }

    #[test]
    fn test_payload() {
        //println!("{}", String::from(PAYLOAD.to_vec()));
        let encoded = general_purpose::URL_SAFE_NO_PAD.encode(PAYLOAD);
        //println!("encoded: {}", encoded);
        assert_eq!(encoded, B64_PAYLOAD);
        let original = general_purpose::URL_SAFE_NO_PAD.decode(encoded).unwrap();
        //println!("original: {}", String::from_utf8(original).unwrap());
        assert_eq!(PAYLOAD, &original);
        // let header = decode_header(B64_HEADER).unwrap();
        // assert_eq!("RS256", header.alg);
        // assert_eq!("da0b5d4244ccfb75b2708416295f05d518ca6903", header.kid);
    }

    #[test]
    fn test_verify_header() {
        let header = decode::<Header>(B64_HEADER).unwrap();

        let key1 = JwkKey {
            kid: header.kid.clone(),
            e: "AQAB".to_owned(),
            alg: "RS256".to_owned(),
            kty: "RSA".to_owned(),
            n: "n".to_owned(),
        };
        let jwk_keys = JwkKeys::new(JwkKeysNewArgument {
            keys: vec![key1.clone()],
            fetch_time: SystemTime::now(),
            max_age: Duration::from_secs(600),
        });
        let jwk_key = header.verify(&jwk_keys).unwrap();

        assert_eq!(key1, *jwk_key);
    }

    #[test]
    fn test_verify_header_kid_error() {
        let header = decode::<Header>(B64_HEADER).unwrap();

        let jwk_keys = JwkKeys::new(JwkKeysNewArgument {
            keys: vec![],
            fetch_time: SystemTime::now(),
            max_age: Duration::from_secs(600),
        });
        let ret = header.verify(&jwk_keys);

        assert!(ret.is_err());
        assert_eq!(SignatureError::KidNotFound, ret.err().unwrap());
    }

    #[test]
    fn test_verify_header_invalid_arg() {
        let mut header = decode::<Header>(B64_HEADER).unwrap();
        header.alg = "RS256xxx".to_string();

        let jwk_keys = JwkKeys::new(JwkKeysNewArgument {
            keys: vec![],
            fetch_time: SystemTime::now(),
            max_age: Duration::from_secs(600),
        });
        let ret = header.verify(&jwk_keys);

        assert!(ret.is_err());
        assert_eq!(
            SignatureError::InvalidAlg(ExpectedActual {
                expected: "RS256".to_string(),
                actual: "RS256xxx".to_string(),
            }),
            ret.err().unwrap()
        );
    }

    #[test]
    fn test_verify_header_invalid_arg2() {
        let header = decode::<Header>(B64_HEADER).unwrap();

        let key1 = JwkKey {
            kid: header.kid.clone(),
            e: "AQAB".to_owned(),
            alg: "RS256xxx".to_owned(),
            kty: "RSA".to_owned(),
            n: "n".to_owned(),
        };
        let jwk_keys = JwkKeys::new(JwkKeysNewArgument {
            keys: vec![key1.clone()],
            fetch_time: SystemTime::now(),
            max_age: Duration::from_secs(600),
        });
        let ret = header.verify(&jwk_keys);

        assert!(ret.is_err());
        assert_eq!(
            SignatureError::InvalidAlg(ExpectedActual {
                expected: "RS256".to_string(),
                actual: "RS256xxx".to_string(),
            }),
            ret.err().unwrap()
        );
    }

    #[test]
    fn test_verify_payload() {
        let payload = decode::<Payload>(B64_PAYLOAD).unwrap();

        let expected = derivation_path(&payload.iss, &payload.sub);
        let now = UNIX_EPOCH + Duration::from_secs(payload.iat + 1);

        assert_eq!(expected, payload.verify("YOUR_PROJECT_ID", &now).unwrap());
    }

    #[test]
    fn test_verify_payload_iss_error() {
        let mut payload = decode::<Payload>(B64_PAYLOAD).unwrap();
        payload.iss = "hoge".to_string();
        let now = UNIX_EPOCH + Duration::from_secs(payload.iat + 1);

        let ret = payload.verify("YOUR_PROJECT_ID", &now);
        assert!(ret.is_err());
        assert_eq!(
            SignatureError::InvalidIss(ExpectedActual {
                expected: iss("YOUR_PROJECT_ID"),
                actual: "hoge".to_string(),
            }),
            ret.err().unwrap()
        );
    }

    #[test]
    fn test_verify_payload_aud_error() {
        let mut payload = decode::<Payload>(B64_PAYLOAD).unwrap();
        payload.aud = "hoge".to_string();
        let now = UNIX_EPOCH + Duration::from_secs(payload.iat + 1);

        let ret = payload.verify("YOUR_PROJECT_ID", &now);
        assert!(ret.is_err());
        assert_eq!(
            SignatureError::InvalidAud(ExpectedActual {
                expected: "YOUR_PROJECT_ID".to_string(),
                actual: "hoge".to_string(),
            }),
            ret.err().unwrap()
        );
    }

    #[test]
    fn test_verify_payload_sub_error() {
        let mut payload = decode::<Payload>(B64_PAYLOAD).unwrap();
        payload.sub = "".to_string();
        let now = UNIX_EPOCH + Duration::from_secs(payload.iat + 1);

        let ret = payload.verify("YOUR_PROJECT_ID", &now);
        assert!(ret.is_err());
        assert_eq!(SignatureError::SubEmpty, ret.err().unwrap());
    }

    #[test]
    fn test_verify_payload_auth_time_error() {
        let payload = decode::<Payload>(B64_PAYLOAD).unwrap();
        let now = UNIX_EPOCH + Duration::from_secs(payload.auth_time - SKEW_TIME - 1);

        let ret = payload.verify("YOUR_PROJECT_ID", &now);
        assert!(ret.is_err());
        assert_eq!(
            SignatureError::AuthTimeFuture(payload.auth_time),
            ret.err().unwrap()
        );
    }

    #[test]
    fn test_verify_payload_iat_error() {
        let payload = decode::<Payload>(B64_PAYLOAD).unwrap();
        let now = UNIX_EPOCH + Duration::from_secs(payload.auth_time - SKEW_TIME);

        let ret = payload.verify("YOUR_PROJECT_ID", &now);
        assert!(ret.is_err());
        assert_eq!(SignatureError::IatFuture(payload.iat), ret.err().unwrap());
    }

    #[test]
    fn test_verify_payload_exp_error() {
        let payload = decode::<Payload>(B64_PAYLOAD).unwrap();
        let now = UNIX_EPOCH + Duration::from_secs(payload.exp + SKEW_TIME);

        let ret = payload.verify("YOUR_PROJECT_ID", &now);
        assert!(ret.is_err());
        assert_eq!(
            SignatureError::IdTokenExpired(payload.exp),
            ret.err().unwrap()
        );
    }

    #[test]
    fn test_verify() {
        let mut rng = rand::thread_rng();
        let bits = 2048;
        let private_key = RsaPrivateKey::new(&mut rng, bits).unwrap();
        let public_key = private_key.to_public_key();

        let n_bytes = public_key.n().to_bytes_be();
        let e_bytes = public_key.e().to_bytes_be();
        let b64_n = general_purpose::URL_SAFE_NO_PAD.encode(n_bytes);
        let b64_e = general_purpose::URL_SAFE_NO_PAD.encode(e_bytes);

        let signing_key = SigningKey::<Sha256>::new(private_key);

        let data = format!("{}.{}", B64_HEADER, B64_PAYLOAD);
        let sig_bytes: Box<[u8]> = signing_key.sign(data.as_bytes()).into();
        let b64_sig = general_purpose::URL_SAFE_NO_PAD.encode(&sig_bytes);
        let id_token = format!("{}.{}", data, b64_sig);

        let header = decode::<Header>(B64_HEADER).unwrap();
        let key1 = JwkKey {
            kid: header.kid.clone(),
            e: b64_e,
            alg: "RS256".to_owned(),
            kty: "RSA".to_owned(),
            n: b64_n,
        };
        let jwk_keys = JwkKeys::new(JwkKeysNewArgument {
            keys: vec![key1.clone()],
            fetch_time: SystemTime::now(),
            max_age: Duration::from_secs(600),
        });

        let payload = decode::<Payload>(B64_PAYLOAD).unwrap();
        let project_id = payload.aud.clone();
        let now = UNIX_EPOCH + Duration::from_secs(payload.iat + 1);

        let path = verify(&id_token, &jwk_keys, &project_id, &now).unwrap();
        assert_eq!(derivation_path(&payload.iss, &payload.sub), path);
    }

    #[test]
    fn test_verify_header_error() {
        let mut rng = rand::thread_rng();
        let bits = 2048;
        let private_key = RsaPrivateKey::new(&mut rng, bits).unwrap();

        let signing_key = SigningKey::<Sha256>::new(private_key);

        let data = format!("{}.{}", B64_HEADER, B64_PAYLOAD);
        let sig_bytes: Box<[u8]> = signing_key.sign(data.as_bytes()).into();
        let b64_sig = general_purpose::URL_SAFE_NO_PAD.encode(&sig_bytes);
        let id_token = format!("{}.{}", data, b64_sig);

        let jwk_keys = JwkKeys::new(JwkKeysNewArgument {
            keys: vec![],
            fetch_time: SystemTime::now(),
            max_age: Duration::from_secs(600),
        });

        let payload = decode::<Payload>(B64_PAYLOAD).unwrap();
        let project_id = payload.aud.clone();
        let now = UNIX_EPOCH + Duration::from_secs(payload.iat + 1);

        let ret = verify(&id_token, &jwk_keys, &project_id, &now);
        assert!(ret.is_err());
    }

    #[test]
    fn test_verify_payload_error() {
        let mut rng = rand::thread_rng();
        let bits = 2048;
        let private_key = RsaPrivateKey::new(&mut rng, bits).unwrap();
        let public_key = private_key.to_public_key();

        let n_bytes = public_key.n().to_bytes_be();
        let e_bytes = public_key.e().to_bytes_be();
        let b64_n = general_purpose::URL_SAFE_NO_PAD.encode(n_bytes);
        let b64_e = general_purpose::URL_SAFE_NO_PAD.encode(e_bytes);

        let signing_key = SigningKey::<Sha256>::new(private_key);

        let data = format!("{}.{}", B64_HEADER, B64_PAYLOAD);
        let sig_bytes: Box<[u8]> = signing_key.sign(data.as_bytes()).into();
        let b64_sig = general_purpose::URL_SAFE_NO_PAD.encode(&sig_bytes);
        let id_token = format!("{}.{}", data, b64_sig);

        let header = decode::<Header>(B64_HEADER).unwrap();
        let key1 = JwkKey {
            kid: header.kid.clone(),
            e: b64_e,
            alg: "RS256".to_owned(),
            kty: "RSA".to_owned(),
            n: b64_n,
        };
        let jwk_keys = JwkKeys::new(JwkKeysNewArgument {
            keys: vec![key1.clone()],
            fetch_time: SystemTime::now(),
            max_age: Duration::from_secs(600),
        });

        let payload = decode::<Payload>(B64_PAYLOAD).unwrap();
        let now = UNIX_EPOCH + Duration::from_secs(payload.iat + 1);

        let ret = verify(&id_token, &jwk_keys, "", &now);
        assert!(ret.is_err());
    }
}
