use std::time::{Duration, SystemTime};

use crate::error::SignatureError;
use crate::http_request::Fetch;
use crate::jwk_keys::{JwkKey, JwkKeys};
use crate::max_age;
use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse,
};
use serde::{Deserialize, Serialize};

const KEYS_URL: &str =
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const FALLBACK_MAX_AGE: Duration = Duration::from_secs(0);

#[derive(Debug, Serialize, Deserialize)]
pub struct KeyResponse {
    pub keys: Vec<JwkKey>,
}

pub struct KeysFetcher<'a, F>
where
    F: Fetch,
{
    fetch: &'a F,
}

impl<'a, F> KeysFetcher<'a, F>
where
    F: Fetch,
{
    pub fn new(fetch: &'a F) -> Self {
        Self { fetch }
    }

    pub async fn fetch_keys(&self, fetch_time: SystemTime) -> Result<JwkKeys, SignatureError> {
        let response = self.fetch_keys_internal().await?;
        let keys = self.body_to_keys(&response.body)?;
        let cache_control_value = self.find_cache_control_value(&response.headers);
        let max_age = max_age::get_max_age(cache_control_value).unwrap_or(FALLBACK_MAX_AGE);

        Ok(JwkKeys::new(keys, fetch_time, max_age))
    }

    async fn fetch_keys_internal(&self) -> Result<HttpResponse, SignatureError> {
        let arg = CanisterHttpRequestArgument {
            url: KEYS_URL.to_string(),
            max_response_bytes: Some(3000),
            method: HttpMethod::GET,
            headers: vec![],
            body: None,
            transform: None,
        };

        let response = self.fetch.fetch(arg).await?;

        Ok(response)
    }

    fn body_to_keys(&self, body: &[u8]) -> Result<Vec<JwkKey>, SignatureError> {
        let key_res: KeyResponse =
            serde_json::from_slice(body).map_err(|e| SignatureError::SerdeError(e.to_string()))?;
        Ok(key_res.keys)
    }

    fn find_cache_control_value(&self, headers: &[HttpHeader]) -> Option<String> {
        let cache_control_header = headers
            .iter()
            .find(|&h| String::from("cache-control").eq(&h.name.to_lowercase()));

        cache_control_header.map(|header| header.value.to_owned())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::http_request::MockFetch;
    use candid::Nat;

    #[test]
    fn test_keys_fetcher_new() {
        let _ = KeysFetcher::new(&MockFetch::new());
    }

    #[tokio::test]
    async fn test_fetch_keys_internal() {
        let key = JwkKey {
            e: "e".to_owned(),
            alg: "alg".to_string(),
            kty: "kty".to_string(),
            kid: "kid".to_string(),
            n: "n".to_string(),
        };
        let keys = vec![key];
        let key_res = KeyResponse { keys };
        let body = serde_json::to_string(&key_res).unwrap().into_bytes();
        let res = HttpResponse {
            status: Nat::from(200_u8),
            body,
            headers: vec![],
        };
        let mut mock_fetch = MockFetch::new();
        mock_fetch.expect_fetch().return_once(|_| Ok(res));
        let fetcher = KeysFetcher::new(&mock_fetch);

        let ret = fetcher.fetch_keys_internal().await;
        assert!(ret.is_ok());
    }

    #[test]
    fn test_body_to_keys() {
        let key = JwkKey {
            e: "e".to_owned(),
            alg: "alg".to_string(),
            kty: "kty".to_string(),
            kid: "kid".to_string(),
            n: "n".to_string(),
        };
        let keys = vec![key.clone()];
        let key_res = KeyResponse { keys: keys.clone() };
        let mut body: Vec<u8> = Vec::new();
        serde_json::to_writer(&mut body, &key_res).unwrap();
        let mock_fetch = MockFetch::new();
        let fetcher = KeysFetcher::new(&mock_fetch);
        assert_eq!(keys, fetcher.body_to_keys(&body).unwrap());
    }

    #[test]
    fn test_serde_json() {
        let key = JwkKey {
            e: "e".to_string(),
            alg: "alg".to_string(),
            kty: "kty".to_string(),
            kid: "kid".to_string(),
            n: "n".to_string(),
        };
        let keys = vec![key.clone()];
        let key_res = KeyResponse { keys: keys.clone() };
        let body = serde_json::to_string(&key_res).unwrap().into_bytes();
        let key_res2: KeyResponse = serde_json::from_slice(&body).unwrap();
        assert_eq!(keys, key_res2.keys);
    }

    #[test]
    fn test_find_cache_control_value() {
        let value = "public, max-age=19204, must-revalidate, no-transform";
        let headers = vec![HttpHeader {
            name: "cache-control".to_string(),
            value: value.to_string(),
        }];
        let mock_fetch = MockFetch::new();
        let fetcher = KeysFetcher::new(&mock_fetch);
        let cache_control_value = fetcher.find_cache_control_value(&headers);
        assert_eq!(value.to_string(), cache_control_value.unwrap());
    }

    #[test]
    fn test_find_cache_control_value_is_none() {
        let headers = vec![HttpHeader {
            name: "aaa".to_string(),
            value: "bbb".to_string(),
        }];
        let mock_fetch = MockFetch::new();
        let fetcher = KeysFetcher::new(&mock_fetch);
        let cache_control_value = fetcher.find_cache_control_value(&headers);
        assert!(cache_control_value.is_none());
    }

    #[tokio::test]
    async fn test_fetch_keys() {
        let key = JwkKey {
            e: "e".to_string(),
            alg: "alg".to_string(),
            kty: "kty".to_string(),
            kid: "kid".to_string(),
            n: "n".to_string(),
        };
        let keys = vec![key.clone()];
        let key_res = KeyResponse { keys };
        let body = serde_json::to_string(&key_res).unwrap().into_bytes();
        let value = "public, max-age=19204, must-revalidate, no-transform".to_string();
        let headers = vec![HttpHeader {
            name: "cache-control".to_string(),
            value,
        }];
        let res = HttpResponse {
            status: Nat::from(200_u8),
            body,
            headers,
        };
        let now = SystemTime::now();

        let mut mock_fetch = MockFetch::new();
        mock_fetch.expect_fetch().return_once(|_| Ok(res));
        let fetcher = KeysFetcher::new(&mock_fetch);

        let keys = fetcher.fetch_keys(now).await.unwrap();
        assert!(keys.is_valid(&now));
        assert!(!keys.is_fetchable(&now));
        assert_eq!(&key, keys.get_key("kid").unwrap());
    }
}
