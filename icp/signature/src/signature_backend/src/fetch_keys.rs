use crate::error::SignatureError;
use crate::http_request;
use crate::jwk_keys::{JwkKey, JwkKeys};

use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpHeader, HttpMethod,
};
use serde::Deserialize;
use std::time::Duration;

const KEYS_URL: &str =
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct KeyResponse {
    keys: Vec<JwkKey>,
}

pub async fn fetch_keys() -> Result<JwkKeys, SignatureError> {
    let arg = CanisterHttpRequestArgument {
        url: KEYS_URL.to_owned(),
        max_response_bytes: Some(3000),
        method: HttpMethod::GET,
        headers: vec![],
        body: None,
        transform: None,
    };

    let response = http_request::fetch(arg.clone()).await?;
    let max_age = get_max_age(&response.headers)?;
    let res: KeyResponse = serde_json::from_slice(&response.body).unwrap();

    Ok(JwkKeys::new(max_age, res.keys))

    //String::from_utf8(response.body).unwrap()
}

fn get_max_age(headers: &Vec<HttpHeader>) -> Result<Duration, SignatureError> {
    let cache_control_header = headers
        .iter()
        .find(|&h| String::from("cache-control").eq(&h.name.to_lowercase()));

    match cache_control_header {
        Some(header) => return parse_max_age_value(&header.value),
        None => return Err(SignatureError::NoCacheControlHeader),
    }
}

fn parse_max_age_value(s: &str) -> Result<Duration, SignatureError> {
    let tokens: Vec<&str> = s.split(",").collect();
    for token in tokens {
        let key_value: Vec<&str> = token.split("=").map(|s| s.trim()).collect();
        let key = key_value.first().unwrap();
        let val = key_value.get(1);

        if String::from("max-age").eq(&key.to_lowercase()) {
            match val {
                Some(value) => {
                    return Ok(Duration::from_secs(
                        value
                            .parse()
                            .map_err(|e| SignatureError::NonNumericMaxAge(e))?,
                    ))
                }
                None => return Err(SignatureError::MaxAgeValueEmpty),
            }
        }
    }
    return Err(SignatureError::NoMaxAgeSpecified);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_max_age_value() {
        let value = "public, max-age=19204, must-revalidate, no-transform";
        assert_eq!(
            Duration::from_secs(19204),
            parse_max_age_value(value).unwrap()
        );
    }

    #[test]
    fn test_parse_max_age_value_non_numeric_max_age_err() -> Result<(), String> {
        let value = "public, max-age=19a204, must-revalidate, no-transform";
        let err = parse_max_age_value(value).unwrap_err();
        match err {
            SignatureError::NonNumericMaxAge(_) => Ok(()),
            _ => Err("NonNumericMaxAge did not occur".to_owned()),
        }
    }

    #[test]
    fn test_parse_max_age_value_non_numeric_max_age_empty_err() -> Result<(), String> {
        let value = "public, max-age=, must-revalidate, no-transform";
        let err = parse_max_age_value(value).unwrap_err();
        match err {
            SignatureError::NonNumericMaxAge(_) => Ok(()),
            _ => Err("NonNumericMaxAge did not occur".to_owned()),
        }
    }

    #[test]
    fn test_parse_max_age_value_no_max_age_specified_err() -> Result<(), String> {
        let value = "public, must-revalidate, no-transform";
        let err = parse_max_age_value(value).unwrap_err();
        match err {
            SignatureError::NoMaxAgeSpecified => Ok(()),
            _ => Err("NoMaxAgeSpecified did not occur".to_owned()),
        }
    }

    #[test]
    fn test_get_max_age() {
        let headers = vec![HttpHeader {
            name: "cache-control".to_owned(),
            value: "public, max-age=19204, must-revalidate, no-transform".to_owned(),
        }];
        assert_eq!(Duration::from_secs(19204), get_max_age(&headers).unwrap());
    }

    #[test]
    fn test_get_max_age_no_cache_control_header_err() -> Result<(), String> {
        let headers = vec![HttpHeader {
            name: "aaa".to_owned(),
            value: "bbb".to_owned(),
        }];
        let err = get_max_age(&headers).unwrap_err();
        match err {
            SignatureError::NoCacheControlHeader => Ok(()),
            _ => Err("NoCacheControlHeader did not occur".to_owned()),
        }
    }
}
