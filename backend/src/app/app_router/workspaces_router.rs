use std::sync::Arc;

use axum::{
    Json, Router,
    extract::{Query, State},
    http::StatusCode,
    routing::post,
};
use serde::Deserialize;
use validator::Validate;

use crate::{
    app::{app_error::AppError, app_state::AppState, auth::AuthUser},
    db::models::workspaces::{CreateWorkspaceError, Workspace},
    pagination::{Paginated, Pagination},
    regexes::{PATTERN_SLUG, PATTERN_TITLE},
};

pub struct WorkspacesRouter;

impl WorkspacesRouter {
    pub fn router() -> Router<Arc<AppState>> {
        Router::new().route("/", post(create_workspace).get(list_workspaces))
    }
}

#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
struct CreateWorkspaceBody {
    #[validate(length(min = 1, max = 100), regex(path = PATTERN_TITLE))]
    title: String,
    #[validate(length(min = 1, max = 50), regex(path = PATTERN_SLUG))]
    slug: String,
    #[validate(length(max = 1000))]
    description: Option<String>,
}

#[derive(Debug, Default, Clone, Copy, Deserialize)]
enum WorkspaceSortBy {
    #[serde(rename = "-createdAt")]
    CreatedAtDesc,
    #[serde(rename = "createdAt")]
    CreatedAtAsc,
    #[serde(rename = "-updatedAt")]
    #[default]
    UpdatedAtDesc,
    #[serde(rename = "updatedAt")]
    UpdatedAtAsc,
    #[serde(rename = "-title")]
    TitleDesc,
    #[serde(rename = "title")]
    TitleAsc,
}

impl WorkspaceSortBy {
    fn order_by_clause(self) -> &'static str {
        match self {
            Self::CreatedAtDesc => "w.created_at DESC",
            Self::CreatedAtAsc => "w.created_at ASC",
            Self::UpdatedAtDesc => "w.updated_at DESC",
            Self::UpdatedAtAsc => "w.updated_at ASC",
            Self::TitleDesc => "w.title DESC",
            Self::TitleAsc => "w.title ASC",
        }
    }
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WorkspaceSortQuery {
    #[serde(default)]
    sort_by: WorkspaceSortBy,
}

async fn create_workspace(
    State(state): State<Arc<AppState>>,
    AuthUser(user): AuthUser,
    Json(body): Json<CreateWorkspaceBody>,
) -> Result<(StatusCode, Json<Workspace>), AppError> {
    body.validate()?;

    let workspace = Workspace::create(state.db(), user.id(), &body.title, &body.slug, &body.description.map(|v|v.to_string()))
        .await
        .map_err(|e| match e {
            CreateWorkspaceError::TitleTaken => AppError::Conflict("You already have a workspace with this title"),
            CreateWorkspaceError::SlugTaken => AppError::Conflict("You already have a workspace with this slug"),
            CreateWorkspaceError::Other(err) => AppError::Internal(err),
        })?;

    Ok((StatusCode::CREATED, Json(workspace)))
}

async fn list_workspaces(
    State(state): State<Arc<AppState>>,
    AuthUser(user): AuthUser,
    Query(pagination): Query<Pagination>,
    Query(WorkspaceSortQuery { sort_by }): Query<WorkspaceSortQuery>,
) -> Result<Json<Paginated<Workspace>>, AppError> {
    pagination.validate()?;

    let (items, total) =
        Workspace::find_paginated_by_user(state.db(), user.id(), pagination, sort_by.order_by_clause()).await?;

    Ok(Json(Paginated::new(items, pagination, total)))
}
