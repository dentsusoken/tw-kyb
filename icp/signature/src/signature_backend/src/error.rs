use core::num::ParseIntError;
use ic_cdk::api::call::RejectionCode;
//use std::str::FromStr;
//use std::u64;

#[derive(Debug)]
#[allow(dead_code)]
pub enum SignatureError {
    FetchError((RejectionCode, String)),
    NonNumericMaxAge(ParseIntError),
    MaxAgeValueEmpty,
    NoMaxAgeSpecified,
    NoCacheControlHeader,
}
