use crate::error::SignatureError;
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpResponse,
};

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

#[allow(dead_code)]
pub async fn fetch(arg: CanisterHttpRequestArgument) -> Result<HttpResponse, SignatureError> {
    let cycles = http_request_required_cycles(&arg);
    let response = http_request(arg.clone(), cycles)
        .await
        .map_err(|e| SignatureError::FetchError(e.1))
        .unwrap()
        .0;
    assert_eq!(response.status, 200);

    Ok(response)
}
