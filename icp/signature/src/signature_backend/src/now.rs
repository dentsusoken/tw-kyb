#[allow(unused_imports)]
use ic_cdk::api as ic_api;
#[allow(unused_imports)]
use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[cfg(test)]
pub fn now() -> SystemTime {
    SystemTime::now()
}

#[cfg(not(test))]
pub fn now() -> SystemTime {
    let now = ic_api::time();
    let secs = now / 1_000_000_000;
    let sub_nanos = (now % 1_000_000_000) as u32;
    UNIX_EPOCH + Duration::new(secs, sub_nanos)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_now() {
        assert!(now() > UNIX_EPOCH);
    }
}
