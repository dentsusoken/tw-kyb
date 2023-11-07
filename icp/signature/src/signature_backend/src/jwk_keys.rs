use crate::now;
use serde::Deserialize;
use std::collections::HashMap;
use std::time::{Duration, SystemTime};

#[derive(Debug, Deserialize, Eq, PartialEq, Clone)]
pub struct JwkKey {
    pub e: String,
    pub alg: String,
    pub kty: String,
    pub kid: String,
    pub n: String,
}

#[derive(Debug)]
pub struct JwkKeys {
    max_age: Duration,
    key_map: HashMap<String, JwkKey>,
    fetch_time: SystemTime,
}

fn keys_to_map(keys: Vec<JwkKey>) -> HashMap<String, JwkKey> {
    let mut map = HashMap::new();
    for key in keys {
        map.insert(String::clone(&key.kid), key);
    }
    map
}

impl JwkKeys {
    pub fn new(max_age: Duration, keys: Vec<JwkKey>) -> Self {
        JwkKeys {
            max_age,
            key_map: keys_to_map(keys),
            fetch_time: now::now(),
        }
    }

    pub fn get_key(&self, kid: &str) -> Option<&JwkKey> {
        self.key_map.get(kid)
    }

    pub fn is_valid(&self) -> bool {
        self.fetch_time.elapsed().unwrap() <= self.max_age
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;

    #[test]
    fn test_keys_to_map() {
        let key1 = JwkKey {
            kid: "1".to_owned(),
            e: "AQAB".to_owned(),
            alg: "RS256".to_owned(),
            kty: "RSA".to_owned(),
            n: "n".to_owned(),
        };
        let key2 = JwkKey {
            kid: "2".to_owned(),
            e: "AQAB".to_owned(),
            alg: "RS256".to_owned(),
            kty: "RSA".to_owned(),
            n: "n".to_owned(),
        };
        let map = keys_to_map(vec![key1.clone(), key2.clone()]);
        assert_eq!(&key1, map.get(&key1.kid).unwrap());
        assert_eq!(&key2, map.get(&key2.kid).unwrap());
    }

    #[test]
    fn test_jwk_keys_get_key() {
        let key1 = JwkKey {
            kid: "1".to_owned(),
            e: "AQAB".to_owned(),
            alg: "RS256".to_owned(),
            kty: "RSA".to_owned(),
            n: "n".to_owned(),
        };
        let key2 = JwkKey {
            kid: "2".to_owned(),
            e: "AQAB".to_owned(),
            alg: "RS256".to_owned(),
            kty: "RSA".to_owned(),
            n: "n".to_owned(),
        };
        let keys = JwkKeys::new(Duration::from_secs(60), vec![key1.clone(), key2.clone()]);
        assert_eq!(&key1, keys.get_key(&key1.kid).unwrap());
        assert_eq!(&key2, keys.get_key(&key2.kid).unwrap());
        assert_eq!(true, keys.get_key(&"xxx".to_owned()).is_none());
    }

    #[test]
    fn test_jwk_keys_is_valid() {
        let key1 = JwkKey {
            kid: "1".to_owned(),
            e: "AQAB".to_owned(),
            alg: "RS256".to_owned(),
            kty: "RSA".to_owned(),
            n: "n".to_owned(),
        };
        let key2 = JwkKey {
            kid: "2".to_owned(),
            e: "AQAB".to_owned(),
            alg: "RS256".to_owned(),
            kty: "RSA".to_owned(),
            n: "n".to_owned(),
        };
        let keys = JwkKeys::new(Duration::from_secs(1), vec![key1.clone(), key2.clone()]);
        assert_eq!(true, keys.is_valid());

        let two_sec = Duration::from_secs(2);
        thread::sleep(two_sec);
        assert_eq!(false, keys.is_valid());
    }
}
