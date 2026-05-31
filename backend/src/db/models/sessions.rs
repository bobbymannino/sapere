use std::time::Duration;

use anyhow::Result;
use chrono::{DateTime, Utc};
use rand::RngExt;
use sha2::{Digest, Sha256};
use uuid::Uuid;

use crate::db::Db;

pub struct NewSession {
    token: String,
    expires_at: DateTime<Utc>,
}

impl NewSession {
    pub fn token(&self) -> &str {
        &self.token
    }

    pub fn expires_at(&self) -> &DateTime<Utc> {
        &self.expires_at
    }
}

pub struct Session {
    id: Uuid,
    user_id: i32,
    token_hash: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl Session {
    pub async fn create(db: &Db, user_id: i32, session_duration: Duration) -> Result<NewSession> {
        let bytes: [u8; 40] = rand::rng().random();
        let token = hex::encode(bytes);
        let token_hash = hex::encode(Sha256::digest(token.as_bytes()));
        let expires_at = Utc::now() + session_duration;

        sqlx::query("INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)")
            .bind(user_id)
            .bind(&token_hash)
            .bind(expires_at)
            .execute(&db.conn)
            .await?;

        Ok(NewSession { token, expires_at })
    }
}
