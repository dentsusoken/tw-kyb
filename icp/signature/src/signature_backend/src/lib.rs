use ic_cdk::{
    api::management_canister::ecdsa::{
        ecdsa_public_key, sign_with_ecdsa, EcdsaCurve, EcdsaKeyId, EcdsaPublicKeyArgument,
        SignWithEcdsaArgument,
    },
    export_candid, update,
};
//use std::str::FromStr;

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
    return Ok(res.public_key);
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

export_candid!();
