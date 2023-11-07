use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use std::time::Duration;

use crate::structs::{FirebaseUser, JwkConfiguration, JwkKeys, KeyResponse, PublicKeysError};

const FALLBACK_TIMEOUT: Duration = Duration::from_secs(60);
const JWK_URL: &str =
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

pub fn get_configuration(project_id: &str) -> JwkConfiguration {
    JwkConfiguration {
        jwk_url: JWK_URL.to_owned(),
        audience: project_id.to_owned(),
        issuer: format!("https://securetoken.google.com/{}", project_id),
    }
}

fn parse_max_age_value(cache_control_value: &str) -> Result<Duration, PublicKeysError> {
    let tokens: Vec<(&str, &str)> = cache_control_value
        .split(',')
        .map(|s| s.split('=').map(|ss| ss.trim()).collect::<Vec<&str>>())
        .map(|ss| {
            let key = ss.first().unwrap_or(&"");
            let val = ss.get(1).unwrap_or(&"");
            (*key, *val)
        })
        .collect();
    match tokens
        .iter()
        .find(|(key, _)| key.to_lowercase() == *"max-age")
    {
        None => Err(PublicKeysError::NoMaxAgeSpecified),
        Some((_, str_val)) => Ok(Duration::from_secs(
            str_val
                .parse()
                .map_err(|_| PublicKeysError::NonNumericMaxAge)?,
        )),
    }
}

async fn get_public_keys() -> Result<JwkKeys, PublicKeysError> {
    let response = reqwest::get(JWK_URL)
        .await
        .map_err(|_| PublicKeysError::NoCacheControlHeader)?;

    let cache_control = match response.headers().get("Cache-Control") {
        Some(header_value) => header_value.to_str(),
        None => return Err(PublicKeysError::NoCacheControlHeader),
    };

    let max_age = match cache_control {
        Ok(v) => parse_max_age_value(v),
        Err(_) => return Err(PublicKeysError::MaxAgeValueEmpty),
    };

    let public_keys = response
        .json::<KeyResponse>()
        .await
        .map_err(|_| PublicKeysError::CannotParsePublicKey)?;

    Ok(JwkKeys {
        keys: public_keys.keys,
        max_age: max_age.unwrap_or(FALLBACK_TIMEOUT),
    })
}

#[derive(Debug)]
pub enum VerificationError {
    InvalidSignature,
    UnkownKeyAlgorithm,
    NoKidHeader,
    NotfoundMatchKid,
    CannotDecodePublicKeys,
}

pub fn verify_id_token_with_project_id(
    config: &JwkConfiguration,
    public_keys: &JwkKeys,
    token: &str,
) -> Result<FirebaseUser, VerificationError> {
    let header = decode_header(token).map_err(|_| VerificationError::UnkownKeyAlgorithm)?;

    if header.alg != Algorithm::RS256 {
        return Err(VerificationError::UnkownKeyAlgorithm);
    }

    let kid = match header.kid {
        Some(v) => v,
        None => return Err(VerificationError::NoKidHeader),
    };

    let public_key = match public_keys.keys.iter().find(|v| v.kid == kid) {
        Some(v) => v,
        None => return Err(VerificationError::NotfoundMatchKid),
    };
    let decoding_key = DecodingKey::from_rsa_components(&public_key.n, &public_key.e)
        .map_err(|_| VerificationError::CannotDecodePublicKeys)?;

    let mut validation = Validation::new(Algorithm::RS256);
    validation.set_audience(&[config.audience.to_owned()]);
    validation.set_issuer(&[config.issuer.to_owned()]);

    let user = decode::<FirebaseUser>(token, &decoding_key, &validation)
        .map_err(|_| VerificationError::InvalidSignature)?
        .claims;
    Ok(user)
}
