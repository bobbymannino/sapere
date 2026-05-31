use anyhow::{Result, anyhow};
use argon2::{
    Argon2,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};

pub fn hash_password(password: &str) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|e| anyhow!("failed to hash password: {e}"))
}

pub fn verify_password(password: &str, hash: &str) -> Result<bool> {
    let parsed = PasswordHash::new(hash).map_err(|e| anyhow!("invalid password hash: {e}"))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hash_and_verify_correct_password() {
        let hash = hash_password("hunter2").expect("hashing failed");
        assert!(verify_password("hunter2", &hash).expect("verify failed"));
    }

    #[test]
    fn verify_wrong_password_returns_false() {
        let hash = hash_password("hunter2").expect("hashing failed");
        assert!(!verify_password("wrong", &hash).expect("verify failed"));
    }

    #[test]
    fn hashes_are_unique_per_call() {
        let h1 = hash_password("same").expect("hashing failed");
        let h2 = hash_password("same").expect("hashing failed");
        assert_ne!(h1, h2);
    }
}
