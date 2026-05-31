use std::{sync::Arc, time::Duration};

use axum::{Json, Router, extract::State, http::StatusCode, routing::post};
use serde::Deserialize;
use serde_json::{Value, json};
use validator::Validate;

use crate::{
    app::{app_error::AppError, app_state::AppState},
    db::models::{
        sessions::Session,
        users::{CreateUserError, User},
    },
    regexes::{PATTERN_PASSWORD, PATTERN_USERNAME},
};

pub struct SignupRouter;

impl SignupRouter {
    pub fn router() -> Router<Arc<AppState>> {
        Router::new().route("/email", post(signup_with_email))
    }
}

#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
struct SignupWithEmailBody {
    #[validate(email)]
    email: String,
    #[validate(length(min = 3, max = 32), regex(path = PATTERN_USERNAME))]
    username: String,
    #[validate(length(min = 8, max = 255), regex(path = PATTERN_PASSWORD))]
    password: String,
}

async fn signup_with_email(
    State(state): State<Arc<AppState>>,
    Json(body): Json<SignupWithEmailBody>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    body.validate()?;

    let user = User::create(state.db(), &body.email, &body.username, &body.password)
        .await
        .map_err(|e| match e {
            CreateUserError::EmailTaken => AppError::Conflict("Email already exists"),
            CreateUserError::UsernameTaken => AppError::Conflict("Username already exists"),
            CreateUserError::Other(err) => AppError::Internal(err),
        })?;

    let session = Session::create(state.db(), user.id(), Duration::from_hours(12)).await?;

    Ok((
        StatusCode::CREATED,
        Json(json!({ "id": user.id(), "token": session.token(), "session_expires_at": session.expires_at() })),
    ))
}
