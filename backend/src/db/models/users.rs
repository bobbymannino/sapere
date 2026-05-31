use anyhow::{Result, anyhow};
use chrono::{DateTime, Utc};
use sqlx::error::ErrorKind;

use crate::{
    db::Db,
    password::{hash_password, verify_password},
};

#[derive(Debug, Clone, sqlx::FromRow, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    id: i32,
    email: String,
    username: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    #[serde(skip)]
    password_hash: String,
}

#[derive(Debug)]
pub enum CreateUserError {
    EmailTaken,
    UsernameTaken,
    Other(anyhow::Error),
}

impl From<anyhow::Error> for CreateUserError {
    fn from(err: anyhow::Error) -> Self {
        CreateUserError::Other(err)
    }
}

impl User {
    pub fn id(&self) -> i32 {
        self.id
    }

    pub async fn find_by_email(db: &Db, email: &str) -> Result<Option<Self>> {
        sqlx::query_as::<_, User>(
            "SELECT id, email, username, password_hash, created_at, updated_at \
             FROM users WHERE email = $1 LIMIT 1",
        )
        .bind(email)
        .fetch_optional(&db.conn)
        .await
        .map_err(Into::into)
    }

    pub async fn find_by_username(db: &Db, username: &str) -> Result<Option<Self>> {
        sqlx::query_as::<_, User>(
            "SELECT id, email, username, password_hash, created_at, updated_at \
             FROM users WHERE username = $1 LIMIT 1",
        )
        .bind(username)
        .fetch_optional(&db.conn)
        .await
        .map_err(Into::into)
    }

    pub async fn create(db: &Db, email: &str, username: &str, password: &str) -> Result<Self, CreateUserError> {
        let password_hash = hash_password(password)?;

        let result = sqlx::query_as::<_, User>(
            "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) \
             RETURNING id, email, username, password_hash, created_at, updated_at",
        )
        .bind(email)
        .bind(username)
        .bind(&password_hash)
        .fetch_one(&db.conn)
        .await;

        match result {
            Ok(user) => Ok(user),
            Err(sqlx::Error::Database(db_err)) if db_err.kind() == ErrorKind::UniqueViolation => {
                match db_err.constraint() {
                    Some("users_email_key") => Err(CreateUserError::EmailTaken),
                    Some("users_username_key") => Err(CreateUserError::UsernameTaken),
                    _ => Err(CreateUserError::Other(anyhow!(sqlx::Error::Database(db_err)))),
                }
            }
            Err(e) => Err(CreateUserError::Other(anyhow!(e))),
        }
    }

    pub fn verify_password(&self, password: &str) -> Result<bool> {
        verify_password(password, &self.password_hash)
    }
}
