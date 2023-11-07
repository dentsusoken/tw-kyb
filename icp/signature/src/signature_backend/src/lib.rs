use ic_cdk::{
    api::management_canister::ecdsa::{
        ecdsa_public_key, sign_with_ecdsa, EcdsaCurve, EcdsaKeyId, EcdsaPublicKeyArgument,
        SignWithEcdsaArgument,
    },
    export_candid, query, update,
};
//use std::cell::RefCell;
use std::time::SystemTime;

//use std::str::FromStr;

//mod firebase_auth;
//mod structs;
mod error;
mod fetch_keys;
mod http_request;
mod jwk_keys;
mod now;

// thread_local! {
//     static NOW: RefCell<u64> = RefCell::new(ic_api::time());
// }

#[update]
async fn public_key() -> Result<Vec<u8>, String> {
    let key_id = EcdsaKeyId {
        curve: EcdsaCurve::Secp256k1,
        name: "dfx_test_key".to_string(),
    };
    let derivation_path = vec![];
    let arg = EcdsaPublicKeyArgument {
        canister_id: None,
        derivation_path: derivation_path.clone(),
        key_id: key_id.clone(),
    };
    let res = ecdsa_public_key(arg).await.unwrap().0;
    Ok(res.public_key)
}

#[update]
async fn sign(message_hash: Vec<u8>) -> Result<Vec<u8>, String> {
    assert!(message_hash.len() == 32);
    let key_id = EcdsaKeyId {
        curve: EcdsaCurve::Secp256k1,
        name: "dfx_test_key".to_string(),
    };
    let derivation_path = vec![];
    let arg = SignWithEcdsaArgument {
        message_hash,
        derivation_path,
        key_id,
    };
    let res = sign_with_ecdsa(arg).await.unwrap().0;
    Ok(res.signature)
}

#[update]
async fn fetch_keys() -> String {
    format!("{:?}", fetch_keys::fetch_keys().await.unwrap())
}

#[query]
async fn now() -> SystemTime {
    now::now()
}

// #[query]
// async fn now2() -> String {
//     let now = ic_api::time();
//     let secs = now / 1000_000_000;
//     let sub_nanos = (now % 1000_000_000) as u32;
//     let now2 = UNIX_EPOCH + Duration::new(secs, sub_nanos);
//     let now2_nanos = now2
//         .duration_since(UNIX_EPOCH)
//         .expect("Time went backwards")
//         .as_nanos();
//     format!("now: {:?}, now2: {:?}", now, now2_nanos)
// }

export_candid!();
