use std::{sync::Arc, time::Duration};

use axum::{Json, Router, extract::State, http::StatusCode, routing::post};
use serde::Deserialize;
use serde_json::{Value, json};
use validator::Validate;

use crate::{
    app::{app_error::AppError, app_state::AppState},
    db::models::{sessions::Session, users::User},
    regexes::{PATTERN_PASSWORD, PATTERN_USERNAME},
};

pub struct LoginRouter;

impl LoginRouter {
    pub fn router() -> Router<Arc<AppState>> {
        Router::new().route("/email", post(login_with_email))
    }
}

#[derive(Debug, Deserialize, Validate)]
#[serde(rename_all = "camelCase")]
struct LoginWithEmailBody {
    #[validate(email)]
    email: Option<String>,
    #[validate(length(min = 3, max = 32), regex(path = PATTERN_USERNAME))]
    username: Option<String>,
    #[validate(length(min = 8, max = 50), regex(path = PATTERN_PASSWORD))]
    password: String,
}

async fn login_with_email(
    State(state): State<Arc<AppState>>,
    Json(body): Json<LoginWithEmailBody>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    body.validate()?;

    let user = match (body.email, body.username) {
        (None, None) => {
            return Err(AppError::BadRequest("Please provide a username or email"));
        }
        (None, Some(username)) => User::find_by_username(state.db(), username.as_str()).await,
        (Some(email), None | Some(_)) => User::find_by_email(state.db(), email.as_str()).await,
    }?;
    let Some(user) = user else {
        return Err(AppError::NotFound("There is no user by those credentials"));
    };

    if !user.verify_password(&body.password)? {
        return Err(AppError::Unauthorized("Invalid email or password"));
    }

    let session = Session::create(state.db(), user.id(), Duration::from_hours(12)).await?;

    Ok((
        StatusCode::OK,
        Json(json!({ "id": user.id(), "token": session.token(), "session_expires_at": session.expires_at() })),
    ))
}
