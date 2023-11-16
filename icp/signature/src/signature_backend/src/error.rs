use candid::CandidType;
use std::error;
use std::fmt;
//use std::str::FromStr;
//use std::u64;

#[derive(Debug, CandidType)]
#[allow(dead_code)]
pub enum SignatureError {
    FetchError(String),
    NonNumericMaxAge(String),
    MaxAgeValueEmpty,
    NoMaxAgeSpecified,
    NoCacheControlHeader,
    SerdeError(String),
}

impl fmt::Display for SignatureError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            Self::FetchError(ref err) => write!(f, "FetchError: {}", err),
            Self::NonNumericMaxAge(ref err) => write!(f, "NonNumericMaxAge: {}", err),
            Self::MaxAgeValueEmpty => write!(f, "MaxAgeValueEmpty"),
            Self::NoMaxAgeSpecified => write!(f, "NoMaxAgeSpecified"),
            Self::NoCacheControlHeader => write!(f, "NoCacheControlHeader"),
            Self::SerdeError(ref err) => write!(f, "SerdeError: {}", err),
        }
    }
}

impl error::Error for SignatureError {
    fn description(&self) -> &str {
        match *self {
            Self::FetchError(_) => "FetchError",
            Self::NonNumericMaxAge(_) => "NonNumericMaxAge",
            Self::MaxAgeValueEmpty => "MaxAgeValueEmpty",
            Self::NoMaxAgeSpecified => "NoMaxAgeSpecified",
            Self::NoCacheControlHeader => "NoCacheControlHeader",
            Self::SerdeError(_) => "SerdeError",
        }
    }

    fn cause(&self) -> Option<&dyn error::Error> {
        None
    }
}
