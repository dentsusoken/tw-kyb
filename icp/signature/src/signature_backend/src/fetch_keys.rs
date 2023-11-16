use crate::error::SignatureError;
#[allow(unused_imports)]
use crate::http_request;
use crate::jwk_keys::{JwkKey, JwkKeys};

#[allow(unused_imports)]
use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpHeader, HttpMethod,
};
#[cfg(test)]
use reqwest::header::HeaderMap;
use serde::Deserialize;
use std::num::ParseIntError;
use std::time::Duration;

const KEYS_URL: &str =
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct KeyResponse {
    keys: Vec<JwkKey>,
}

pub async fn fetch_keys() -> Result<JwkKeys, SignatureError> {
    let (keys, cache_control_value) = fetch_keys_internal().await?;
    let max_age = get_max_age(cache_control_value)?;

    Ok(JwkKeys::new(max_age, keys))

    //String::from_utf8(response.body).unwrap()
}

#[cfg(not(test))]
async fn fetch_keys_internal() -> Result<(Vec<JwkKey>, Option<String>), SignatureError> {
    let arg = CanisterHttpRequestArgument {
        url: KEYS_URL.to_owned(),
        max_response_bytes: Some(3000),
        method: HttpMethod::GET,
        headers: vec![],
        body: None,
        transform: None,
    };

    let response = http_request::fetch(arg).await?;
    let keys = body_to_keys(&response.body)?;
    let cache_control_value = find_cache_control_value(&response.headers);

    Ok((keys, cache_control_value))
}

#[cfg(test)]
async fn fetch_keys_internal() -> Result<(Vec<JwkKey>, Option<String>), SignatureError> {
    let response = reqwest::get(KEYS_URL.to_owned())
        .await
        .map_err(|e| SignatureError::FetchError(e.to_string()))?;

    let cache_control_value = find_cache_control_value_for_reqwest(response.headers());
    println!("{:?}", cache_control_value);
    let keys = response
        .json::<KeyResponse>()
        .await
        .map_err(|e| SignatureError::SerdeError(e.to_string()))?
        .keys;

    Ok((keys, cache_control_value))
}

fn body_to_keys(body: &[u8]) -> Result<Vec<JwkKey>, SignatureError> {
    serde_json::from_slice(body).map_err(|e| SignatureError::SerdeError(e.to_string()))
}

fn find_cache_control_value(headers: &[HttpHeader]) -> Option<String> {
    let cache_control_header = headers
        .iter()
        .find(|&h| String::from("cache-control").eq(&h.name.to_lowercase()));

    cache_control_header.map(|header| header.value.to_owned())
    // match cache_control_header {
    //     Some(header) => Some(header.value.to_owned()),
    //     None => None,
    // }
}

#[cfg(test)]
fn find_cache_control_value_for_reqwest(headers: &HeaderMap) -> Option<String> {
    headers
        .get("cache-control")
        .map(|v| v.to_str().unwrap_or_default().to_owned())

    // let cache_control_header = headers
    //     .iter()
    //     .find(|&h| String::from("cache-control").eq(&h.0.to_lowercase()));

    // cache_control_header.map(|header| header.value.to_owned())
    // match cache_control_header {
    //     Some(header) => Some(header.value.to_owned()),
    //     None => None,
    // }
}

fn get_max_age(cache_control_value: Option<String>) -> Result<Duration, SignatureError> {
    match cache_control_value {
        Some(v) => parse_max_age_value(&v),
        None => Err(SignatureError::NoCacheControlHeader),
    }
}

fn parse_max_age_value(s: &str) -> Result<Duration, SignatureError> {
    let tokens: Vec<&str> = s.split(',').collect();
    for token in tokens {
        let key_value: Vec<&str> = token.split('=').map(|s| s.trim()).collect();
        let key = key_value.first().unwrap();
        let val = key_value.get(1);

        if String::from("max-age").eq(&key.to_lowercase()) {
            match val {
                Some(value) => {
                    return Ok(Duration::from_secs(value.parse().map_err(
                        |e: ParseIntError| SignatureError::NonNumericMaxAge(e.to_string()),
                    )?))
                }
                None => return Err(SignatureError::MaxAgeValueEmpty),
            }
        }
    }
    Err(SignatureError::NoMaxAgeSpecified)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_fetch_keys_internal() {
        let ret = fetch_keys_internal().await;
        assert!(ret.is_ok());
    }

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
    fn test_body_to_keys() {
        let key = JwkKey {
            e: "e".to_owned(),
            alg: "alg".to_owned(),
            kty: "kty".to_owned(),
            kid: "kid".to_owned(),
            n: "n".to_owned(),
        };
        let keys = vec![key];
        let mut body: Vec<u8> = Vec::new();
        serde_json::to_writer(&mut body, &keys).unwrap();

        assert_eq!(keys, body_to_keys(&body).unwrap());
    }

    #[test]
    fn test_find_cache_control_value() {
        let value = "public, max-age=19204, must-revalidate, no-transform";
        let headers = vec![HttpHeader {
            name: "cache-control".to_owned(),
            value: value.to_owned(),
        }];

        let cache_control_value = find_cache_control_value(&headers);
        assert_eq!(value.to_owned(), cache_control_value.unwrap());
    }

    #[test]
    fn test_find_cache_control_value_is_none() {
        let headers = vec![HttpHeader {
            name: "aaa".to_owned(),
            value: "bbb".to_owned(),
        }];

        let cache_control_value = find_cache_control_value(&headers);
        assert!(cache_control_value.is_none());
    }

    #[test]
    fn test_find_cache_control_value_for_reqwest() {
        let value = "public, max-age=19204, must-revalidate, no-transform";
        let mut headers = HeaderMap::new();
        headers.insert("cache-control", value.parse().unwrap());

        let cache_control_value = find_cache_control_value_for_reqwest(&headers);
        assert_eq!(value.to_owned(), cache_control_value.unwrap());
    }

    #[test]
    fn test_get_max_age() {
        let value = "public, max-age=19204, must-revalidate, no-transform";
        assert_eq!(
            Duration::from_secs(19204),
            get_max_age(Some(value.to_owned())).unwrap()
        );
    }

    #[test]
    fn test_get_max_age_no_cache_control_header_err() -> Result<(), String> {
        let err = get_max_age(None).unwrap_err();
        match err {
            SignatureError::NoCacheControlHeader => Ok(()),
            _ => Err("NoCacheControlHeader did not occur".to_owned()),
        }
    }

    #[tokio::test]
    async fn test_reqwest() -> Result<(), Box<dyn std::error::Error>> {
        let resp = reqwest::get("https://httpbin.org/ip").await?;
        let headers = resp.headers().clone();
        let map = resp.json::<HashMap<String, String>>().await?;

        assert_eq!("application/json", headers.get("content-type").unwrap());
        assert_eq!("175.111.121.27", map.get("origin").unwrap());
        Ok(())
    }
}
