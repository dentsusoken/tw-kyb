use std::time::SystemTime;

use crate::error::SignatureError;
use crate::http_request::Fetch;
use crate::jwk_keys::{JwkKey, JwkKeys, JwkKeysNewArgument};
use crate::max_age;
use crate::now::Now;
use async_trait::async_trait;
use ic_cdk::api::management_canister::http_request::{
    CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse,
};
use serde::{Deserialize, Serialize};

const KEYS_URL: &str =
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

#[derive(Debug, Serialize, Deserialize)]
struct KeyResponse {
    keys: Vec<JwkKey>,
}

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait FetchKeys {
    async fn fetch_keys(&self) -> Result<JwkKeys, SignatureError> {
        let response = self.fetch_keys_internal().await?;
        let keys = self.body_to_keys(&response.body)?;
        let cache_control_value = self.find_cache_control_value(&response.headers);
        let fetch_time = self.now();
        let max_age = max_age::get_max_age(cache_control_value)?;

        Ok(JwkKeys::new(JwkKeysNewArgument {
            keys,
            fetch_time,
            max_age,
        }))
    }

    async fn fetch_keys_internal(&self) -> Result<HttpResponse, SignatureError>;

    fn now(&self) -> SystemTime;

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

pub struct KeysFetcher<F, N>
where
    F: Fetch,
    N: Now,
{
    fetch: F,
    now: N,
}

pub struct KeysFetcherNewArgument<F, N>
where
    F: Fetch,
    N: Now,
{
    pub fetch: F,
    pub now: N,
}

impl<F, N> KeysFetcher<F, N>
where
    F: Fetch,
    N: Now,
{
    pub fn new(arg: KeysFetcherNewArgument<F, N>) -> Self {
        Self {
            fetch: arg.fetch,
            now: arg.now,
        }
    }
}

#[async_trait]
impl<F, N> FetchKeys for KeysFetcher<F, N>
where
    F: Fetch,
    N: Now,
{
    async fn fetch_keys_internal(&self) -> Result<HttpResponse, SignatureError> {
        let arg = CanisterHttpRequestArgument {
            url: KEYS_URL.to_owned(),
            max_response_bytes: Some(3000),
            method: HttpMethod::GET,
            headers: vec![],
            body: None,
            transform: None,
        };

        let response = self.fetch.fetch(arg).await?;

        Ok(response)
    }

    fn now(&self) -> SystemTime {
        self.now.now()
    }
}

// async fn fetch_keys_internal2() -> Result<(Vec<JwkKey>, Option<String>), SignatureError> {
//     let arg = CanisterHttpRequestArgument {
//         url: KEYS_URL.to_owned(),
//         max_response_bytes: Some(3000),
//         method: HttpMethod::GET,
//         headers: vec![],
//         body: None,
//         transform: None,
//     };

//     let response = self.fetch.fetch(arg).await?;
//     let keys = body_to_keys(&response.body)?;
//     let cache_control_value = find_cache_control_value(&response.headers);

//     Ok((keys, cache_control_value))
// }

#[cfg(test)]
mod tests {
    use super::*;
    use crate::http_request::MockFetch;
    use crate::now::MockNow;
    use candid::Nat;

    mockall::mock! {
        FetchKeysTestStuct {}

        #[async_trait]
        impl FetchKeys for FetchKeysTestStuct {
            async fn fetch_keys_internal(&self) -> Result<HttpResponse, SignatureError>;

            fn now(&self) -> SystemTime;
        }
    }

    #[test]
    fn test_keys_fetcher_new() {
        let _ = KeysFetcher::new(KeysFetcherNewArgument {
            fetch: MockFetch::new(),
            now: MockNow::new(),
        });
    }

    #[tokio::test]
    async fn test_fetch_keys_internal() {
        let key = JwkKey {
            e: "e".to_owned(),
            alg: "alg".to_owned(),
            kty: "kty".to_owned(),
            kid: "kid".to_owned(),
            n: "n".to_owned(),
        };
        let keys = vec![key];
        let key_res = KeyResponse { keys };
        let mut body: Vec<u8> = Vec::new();
        serde_json::to_writer(&mut body, &key_res).unwrap();
        let res = HttpResponse {
            status: Nat::from(200_u8),
            body,
            headers: vec![],
        };

        let mut mock = MockFetchKeys::new();
        mock.expect_fetch_keys_internal()
            .return_once(move || Ok(res));

        let ret = mock.fetch_keys_internal().await;
        assert!(ret.is_ok());
    }

    #[test]
    fn test_now() {
        let now = SystemTime::now();
        let mut mock = MockFetchKeys::new();
        mock.expect_now().return_const(now);
        assert_eq!(now, mock.now());
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
        let keys = vec![key.clone()];
        let key_res = KeyResponse { keys: keys.clone() };
        let mut body: Vec<u8> = Vec::new();
        serde_json::to_writer(&mut body, &key_res).unwrap();

        let mock = MockFetchKeysTestStuct::new();
        assert_eq!(keys, mock.body_to_keys(&body).unwrap());
    }

    #[test]
    fn test_serde_json() {
        let key = JwkKey {
            e: "e".to_owned(),
            alg: "alg".to_owned(),
            kty: "kty".to_owned(),
            kid: "kid".to_owned(),
            n: "n".to_owned(),
        };
        let keys = vec![key.clone()];
        let key_res = KeyResponse { keys: keys.clone() };
        let json = serde_json::to_string(&key_res).unwrap();
        let body = json.into_bytes();
        let key_res2: KeyResponse = serde_json::from_slice(&body).unwrap();
        assert_eq!(keys, key_res2.keys);
    }

    #[test]
    fn test_find_cache_control_value() {
        let value = "public, max-age=19204, must-revalidate, no-transform";
        let headers = vec![HttpHeader {
            name: "cache-control".to_owned(),
            value: value.to_owned(),
        }];

        let mock = MockFetchKeysTestStuct::new();
        let cache_control_value = mock.find_cache_control_value(&headers);
        assert_eq!(value.to_owned(), cache_control_value.unwrap());
    }

    #[test]
    fn test_find_cache_control_value_is_none() {
        let headers = vec![HttpHeader {
            name: "aaa".to_owned(),
            value: "bbb".to_owned(),
        }];

        let mock = MockFetchKeysTestStuct::new();
        let cache_control_value = mock.find_cache_control_value(&headers);
        assert!(cache_control_value.is_none());
    }

    #[tokio::test]
    async fn test_fetch_keys() {
        let key = JwkKey {
            e: "e".to_owned(),
            alg: "alg".to_owned(),
            kty: "kty".to_owned(),
            kid: "kid".to_owned(),
            n: "n".to_owned(),
        };
        let keys = vec![key.clone()];
        let key_res = KeyResponse { keys };
        let mut body: Vec<u8> = Vec::new();
        serde_json::to_writer(&mut body, &key_res).unwrap();
        let value = "public, max-age=19204, must-revalidate, no-transform";
        let headers = vec![HttpHeader {
            name: "cache-control".to_owned(),
            value: value.to_owned(),
        }];
        let res = HttpResponse {
            status: Nat::from(200_u8),
            body,
            headers,
        };
        let now = SystemTime::now();

        let mut mock = MockFetchKeysTestStuct::new();
        mock.expect_fetch_keys_internal()
            .return_once(move || Ok(res));
        mock.expect_now().return_const(now);

        // let ret = mock.fetch_keys().await;
        // println!("{:?}", ret);
        let keys = mock.fetch_keys().await.unwrap();
        assert!(keys.is_valid());
        assert_eq!(&key, keys.get_key("kid").unwrap());
    }
}
