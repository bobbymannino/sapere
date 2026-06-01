use anyhow::{Result, anyhow};
use chrono::{DateTime, Utc};
use sqlx::error::ErrorKind;

use crate::{db::Db, pagination::Pagination};

#[derive(Debug, Clone, sqlx::FromRow, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Workspace {
    id: i32,
    author_id: i32,
    owner_id: i32,
    title: String,
    slug: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug)]
pub enum CreateWorkspaceError {
    TitleTaken,
    SlugTaken,
    Other(anyhow::Error),
}

impl From<anyhow::Error> for CreateWorkspaceError {
    fn from(err: anyhow::Error) -> Self {
        CreateWorkspaceError::Other(err)
    }
}

impl From<sqlx::Error> for CreateWorkspaceError {
    fn from(err: sqlx::Error) -> Self {
        CreateWorkspaceError::Other(anyhow!(err))
    }
}

impl Workspace {
    pub async fn create(db: &Db, user_id: i32, title: &str, slug: &str) -> Result<Self, CreateWorkspaceError> {
        let mut tx = db.conn.begin().await?;

        let workspace_result = sqlx::query_as::<_, Workspace>(
            "INSERT INTO workspaces (author_id, owner_id, title, slug) VALUES ($1, $1, $2, $3) \
             RETURNING id, author_id, owner_id, title, slug, created_at, updated_at",
        )
        .bind(user_id)
        .bind(title)
        .bind(slug)
        .fetch_one(&mut *tx)
        .await;

        let workspace = match workspace_result {
            Ok(w) => w,
            Err(sqlx::Error::Database(db_err)) if db_err.kind() == ErrorKind::UniqueViolation => {
                return Err(match db_err.constraint() {
                    Some(name) if name.contains("slug") => CreateWorkspaceError::SlugTaken,
                    Some(name) if name.contains("title") => CreateWorkspaceError::TitleTaken,
                    _ => CreateWorkspaceError::Other(anyhow!(sqlx::Error::Database(db_err))),
                });
            }
            Err(e) => return Err(CreateWorkspaceError::Other(anyhow!(e))),
        };

        sqlx::query("INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'admin')")
            .bind(workspace.id)
            .bind(user_id)
            .execute(&mut *tx)
            .await?;

        tx.commit().await?;
        Ok(workspace)
    }

    pub async fn find_paginated_by_user(
        db: &Db,
        user_id: i32,
        pagination: Pagination,
        order_by: &'static str,
    ) -> Result<(Vec<Self>, i64)> {
        let sql = format!(
            "SELECT w.id, w.author_id, w.owner_id, w.title, w.slug, w.created_at, w.updated_at \
             FROM workspaces w \
             INNER JOIN workspace_members m ON m.workspace_id = w.id \
             WHERE m.user_id = $1 \
             ORDER BY {order_by} \
             LIMIT $2 OFFSET $3"
        );

        let items_query = sqlx::query_as::<_, Workspace>(sqlx::AssertSqlSafe(sql))
            .bind(user_id)
            .bind(pagination.limit())
            .bind(pagination.offset())
            .fetch_all(&db.conn);

        let count_query =
            sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM workspace_members WHERE user_id = $1")
                .bind(user_id)
                .fetch_one(&db.conn);

        let (items, total) = tokio::try_join!(items_query, count_query)?;
        Ok((items, total))
    }
}
