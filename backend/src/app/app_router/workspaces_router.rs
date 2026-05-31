use std::sync::Arc;

use axum::{Json, Router, extract::State, http::StatusCode, routing::post};
use serde::Deserialize;
use validator::Validate;

use crate::{
    app::{app_error::AppError, app_state::AppState, auth::AuthUser},
    db::models::workspaces::{CreateWorkspaceError, Workspace},
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
}

async fn create_workspace(
    State(state): State<Arc<AppState>>,
    AuthUser(user): AuthUser,
    Json(body): Json<CreateWorkspaceBody>,
) -> Result<(StatusCode, Json<Workspace>), AppError> {
    body.validate()?;

    let workspace = Workspace::create(state.db(), user.id(), &body.title, &body.slug)
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
) -> Result<Json<Vec<Workspace>>, AppError> {
    let workspaces = Workspace::find_all_by_user(state.db(), user.id()).await?;

    Ok(Json(workspaces))
}
