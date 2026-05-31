use chrono::{DateTime, Utc};
use sqlx::Row;

use anyhow::Result;

use crate::{db::Db, password::hash_password};

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    id: i32,
    email: String,
    username: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    password_hash: String,
}

impl User {
    pub fn id(&self) -> i32 {
        self.id
    }

    pub async fn does_username_exist(db: &Db, username: &String) -> Result<bool> {
        let count_row = sqlx::query("select count(*) from users where username = $1")
            .bind(username)
            .fetch_one(&db.conn)
            .await?;
        let count: i64 = count_row.try_get("count")?;
        Ok(count > 0)
    }

    pub async fn does_email_exist(db: &Db, email: &String) -> Result<bool> {
        let count_row = sqlx::query("select count(*) from users where email = $1")
            .bind(email)
            .fetch_one(&db.conn)
            .await?;
        let count: i64 = count_row.try_get("count")?;
        Ok(count > 0)
    }

    pub async fn new(db: &Db, email: String, username: String, password: String) -> Result<Self> {
        let password_hash = hash_password(password.as_str())?;
        let user = sqlx::query(
            "insert into users (username, email, password_hash) values ($1, $2, $3) returning id, created_at, updated_at",
        )
        .bind(&username)
        .bind(&email)
        .bind(&password_hash)
        .fetch_one(&db.conn).await?;

        Ok(User {
            id: user.try_get("id")?,
            username,
            email,
            password_hash,
            created_at: user.try_get("created_at")?,
            updated_at: user.try_get("updated_at")?,
        })
    }
}
