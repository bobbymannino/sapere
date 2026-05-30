use sqlx::Row;

use crate::db::Db;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    id: u32,
    password_hash: String,
}

impl User {
    pub async fn find_all(db: &Db) -> anyhow::Result<Vec<User>> {
        let rows = sqlx::query("select id, password_hash from users").fetch_all(&db.conn).await?;

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
}
