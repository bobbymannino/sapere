use std::sync::Arc;

use axum::{Json, Router, extract::State, http::StatusCode, routing::post};
use serde::Deserialize;
use serde_json::{Value, json};

use crate::{
    app::{app_error::AppError, app_state::AppState},
    db::models::users::User,
};

pub struct SignupRouter;

impl SignupRouter {
    pub fn router() -> Router<Arc<AppState>> {
        Router::new().route("/email", post(signup_with_email))
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SignupWithEmailBody {
    email: String,
    username: String,
    password: String,
}

async fn signup_with_email(
    State(state): State<Arc<AppState>>,
    Json(body): Json<SignupWithEmailBody>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    if User::does_username_exist(state.db(), body.username).await? {
        return Err(AppError::Conflict("Username already exists"));
    }

    if User::does_email_exist(state.db(), body.email).await? {
        return Err(AppError::Conflict("Email already exists"));
    }

    // TODO validate inputs
    // TODO create user, return id

    Ok((StatusCode::CREATED, Json(json!({}))))
}
