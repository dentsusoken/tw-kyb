use crate::error::SignatureError;
use async_trait::async_trait;
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpResponse,
};
#[cfg(test)]
use mockall::automock;

#[cfg_attr(test, automock)]
#[async_trait]
pub trait Fetch: Send + Sync {
    async fn fetch(&self, req: CanisterHttpRequestArgument)
        -> Result<HttpResponse, SignatureError>;
}

pub struct Fetcher;

#[async_trait]
impl Fetch for Fetcher {
    async fn fetch(
        &self,
        req: CanisterHttpRequestArgument,
    ) -> Result<HttpResponse, SignatureError> {
        let cycles = http_request_required_cycles(&req);
        let response = http_request(req, cycles)
            .await
            .map_err(|e| SignatureError::FetchError(e.1))
            .unwrap()
            .0;
        assert_eq!(response.status, 200);

        Ok(response)
    }
}

fn http_request_required_cycles(arg: &CanisterHttpRequestArgument) -> u128 {
    let max_response_bytes = match arg.max_response_bytes {
        Some(ref n) => *n as u128,
        None => 2 * 1024 * 1024u128, // default 2MiB
    };
    let arg_raw = candid::utils::encode_args((arg,)).expect("Failed to encode arguments.");
    // The fee is for a 13-node subnet to demonstrate a typical usage.
    (3_000_000u128
        + 60_000u128 * 13
        + (arg_raw.len() as u128 + "http_request".len() as u128) * 400
        + max_response_bytes * 800)
        * 13
}

#[cfg(test)]
mod tests {
    use super::*;
    use candid::Nat;
    use ic_cdk::api::management_canister::http_request::{HttpMethod, HttpResponse};

    #[tokio::test]
    async fn test_fetch() {
        let req = CanisterHttpRequestArgument {
            url: "url".to_owned(),
            max_response_bytes: Some(3000),
            method: HttpMethod::GET,
            headers: vec![],
            body: None,
            transform: None,
        };
        let res = HttpResponse {
            status: Nat::from(200_u8),
            body: vec![],
            headers: vec![],
        };
        let mut mock = MockFetch::new();
        mock.expect_fetch().return_once(move |_| Ok(res));
        assert_eq!(Nat::from(200_u8), mock.fetch(req).await.unwrap().status,);
    }
}
