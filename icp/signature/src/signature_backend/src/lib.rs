use crate::error::SignatureError;
use ic_cdk::{
    api::management_canister::{
        ecdsa::{
            ecdsa_public_key, sign_with_ecdsa, EcdsaCurve, EcdsaKeyId, EcdsaPublicKeyArgument,
            SignWithEcdsaArgument,
        },
        http_request::{HttpResponse, TransformArgs, TransformContext},
    },
    export_candid, query, update,
};
use std::time::SystemTime;

mod b64;
mod error;
mod fetch_keys;
mod http_request;
mod id_token;
mod jwk_keys;
mod jwk_keys_store;
//mod max_age;
mod now;
mod rsa;

use fetch_keys::normalize_body;
use http_request::{Fetch, Fetcher};
use now::{ICNow, Now};

const PROJECT_ID: &str = "tw-signature";

#[update]
async fn public_key(token: String) -> Result<Vec<u8>, SignatureError> {
    let derivation_path = verify_id_token(token).await?;
    let arg = EcdsaPublicKeyArgument {
        canister_id: None,
        derivation_path,
        key_id: ecdsa_key_id(),
    };
    //let res = ecdsa_public_key(arg).await.unwrap().0;
    let res = ecdsa_public_key(arg)
        .await
        .map_err(|e| SignatureError::ICError(format!("{:?} {}", e.0, e.1)))?
        .0;
    Ok(res.public_key)
}

#[update]
async fn sign(message_hash: Vec<u8>, token: String) -> Result<Vec<u8>, SignatureError> {
    assert!(message_hash.len() == 32);
    let derivation_path = verify_id_token(token).await?;
    let arg = SignWithEcdsaArgument {
        message_hash,
        derivation_path,
        key_id: ecdsa_key_id(),
    };
    //let res = sign_with_ecdsa(arg).await.unwrap().0;
    let res = sign_with_ecdsa(arg)
        .await
        .map_err(|e| SignatureError::ICError(format!("{:?} {}", e.0, e.1)))?
        .0;
    Ok(res.signature)
}

#[query]
fn dfx_network() -> &'static str {
    option_env!("DFX_NETWORK").unwrap_or("local")
}

#[query]
fn ecdsa_key_name() -> &'static str {
    match dfx_network() {
        "ic" => "key_1",
        "playground" => "test_key_1",
        _ => "dfx_test_key",
    }
}

#[query(name = "transformx")]
pub fn transformx(args: TransformArgs) -> HttpResponse {
    HttpResponse {
        status: args.response.status.clone(),
        body: normalize_body(&args.response.body).unwrap_or(args.response.body),
        // Strip headers as they contain the Date which is not necessarily the same
        // and will prevent consensus on the result.
        headers: Vec::new(),
    }
}

#[update]
async fn fetch_keys() -> Result<HttpResponse, SignatureError> {
    const KEYS_URL: &str =
        "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

    let fetch = Fetcher;

    let arg = ic_cdk::api::management_canister::http_request::CanisterHttpRequestArgument {
        url: KEYS_URL.to_string(),
        max_response_bytes: Some(3000),
        method: ic_cdk::api::management_canister::http_request::HttpMethod::GET,
        headers: vec![],
        body: None,
        transform: Some(TransformContext::from_name(
            "transformx".to_string(),
            vec![],
        )),
    };

    let response = fetch.fetch(arg).await?;

    Ok(response)
}

fn ecdsa_key_id() -> EcdsaKeyId {
    EcdsaKeyId {
        curve: EcdsaCurve::Secp256k1,
        name: ecdsa_key_name().to_string(),
    }
}

fn now() -> SystemTime {
    let now = ICNow;
    now.now()
}

async fn verify_id_token(token: String) -> Result<Vec<Vec<u8>>, SignatureError> {
    let now = now();
    jwk_keys_store::verify_id_token(&token, PROJECT_ID, &now).await
    // refresh_keys(&now).await?;
    // let v_ret = id_token::decode_verify(&token, PROJECT_ID, &now);
    // if v_ret.is_ok() {
    //     Ok(v_ret.unwrap().1.delivation_path())
    // } else {
    //     // match v_ret.err().unwrap() {
    //     //     SignatureError::KidNotFound(_) => {}
    //     //     _ => _,
    //     // }
    //     Err(v_ret.err().unwrap())
    // }
}

export_candid!();
