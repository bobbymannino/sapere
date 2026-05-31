use sqlx::Row;

use anyhow::Result;

use crate::db::Db;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    id: u32,
    password_hash: String,
}

impl User {
    pub async fn find_all(db: &Db) -> Result<Vec<User>> {
        let rows = sqlx::query("select id, password_hash from users")
            .fetch_all(&db.conn)
            .await?;

        let users = rows
            .iter()
            .map(|row| {
                let id: i32 = row.try_get("id").unwrap();
                let password_hash: String = row.try_get("password_hash").unwrap();
                User {
                    id: id as u32,
                    password_hash,
                }
            })
            .collect::<Vec<User>>();

        Ok(users)
    }

    pub async fn does_username_exist(db: &Db, username: String) -> Result<bool> {
        let count_row = sqlx::query("select count(*) from users where username = $1")
            .bind(username)
            .fetch_one(&db.conn)
            .await?;
        let count: i64 = count_row.try_get("count")?;
        Ok(count > 0)
    }

    pub async fn does_email_exist(db: &Db, email: String) -> Result<bool> {
        let count_row = sqlx::query("select count(*) from users where email = $1")
            .bind(email)
            .fetch_one(&db.conn)
            .await?;
        let count: i64 = count_row.try_get("count")?;
        Ok(count > 0)
    }
}
