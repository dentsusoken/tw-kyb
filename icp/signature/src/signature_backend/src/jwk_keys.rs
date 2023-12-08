use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[derive(Debug, Deserialize, Serialize, Eq, PartialEq, Clone)]
pub struct JwkKey {
    pub e: String,
    pub alg: String,
    pub kty: String,
    pub kid: String,
    pub n: String,
}

#[derive(Debug)]
pub struct JwkKeys {
    key_map: HashMap<String, JwkKey>,
    fetch_time: SystemTime,
    max_age: Duration,
}

fn keys_as_map(keys: Vec<JwkKey>) -> HashMap<String, JwkKey> {
    let mut map = HashMap::new();
    for key in keys {
        map.insert(String::clone(&key.kid), key);
    }
    map
}

pub struct JwkKeysNewArgument {
    pub keys: Vec<JwkKey>,
    pub fetch_time: SystemTime,
    pub max_age: Duration,
}

impl JwkKeys {
    pub fn new(args: JwkKeysNewArgument) -> Self {
        JwkKeys {
            key_map: keys_as_map(args.keys),
            fetch_time: args.fetch_time,
            max_age: args.max_age,
        }
    }

    pub fn get_key(&self, kid: &str) -> Option<&JwkKey> {
        self.key_map.get(kid)
    }

    pub fn is_valid(&self) -> bool {
        !self.key_map.is_empty() && self.fetch_time.elapsed().unwrap() <= self.max_age
    }
}

impl Default for JwkKeys {
    fn default() -> Self {
        Self {
            max_age: Duration::new(0, 0),
            key_map: HashMap::new(),
            fetch_time: UNIX_EPOCH,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread;

    #[test]
    fn test_keys_as_map() {
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
        let map = keys_as_map(vec![key1.clone(), key2.clone()]);
        assert_eq!(&key1, map.get(&key1.kid).unwrap());
        assert_eq!(&key2, map.get(&key2.kid).unwrap());
    }

    #[test]
    fn test_jwk_keys_new() {
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
        let keys = JwkKeys::new(JwkKeysNewArgument {
            keys: vec![key1.clone(), key2.clone()],
            fetch_time: SystemTime::now(),
            max_age: Duration::from_secs(60),
        });
        assert_eq!(&key1, keys.key_map.get(&key1.kid).unwrap());
        assert_eq!(&key2, keys.key_map.get(&key2.kid).unwrap());
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
        let keys = JwkKeys::new(JwkKeysNewArgument {
            keys: vec![key1.clone(), key2.clone()],
            fetch_time: SystemTime::now(),
            max_age: Duration::from_secs(60),
        });
        assert_eq!(&key1, keys.get_key(&key1.kid).unwrap());
        assert_eq!(&key2, keys.get_key(&key2.kid).unwrap());
        assert!(keys.get_key("xxx").is_none());
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
        let keys = JwkKeys::new(JwkKeysNewArgument {
            keys: vec![key1.clone(), key2.clone()],
            fetch_time: SystemTime::now(),
            max_age: Duration::from_secs(1),
        });
        assert!(keys.is_valid());

        let two_sec = Duration::from_secs(2);
        thread::sleep(two_sec);
        assert!(!keys.is_valid());
    }

    #[test]
    fn test_jwk_keys_default() {
        let keys = JwkKeys::default();
        assert!(!keys.is_valid());
    }
}
