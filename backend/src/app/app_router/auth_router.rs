mod login_router;
mod signup_router;

use std::sync::Arc;

use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    routing::{delete, get},
};

use crate::{
    app::{
        app_error::AppError,
        app_router::auth_router::{login_router::LoginRouter, signup_router::SignupRouter},
        app_state::AppState,
        auth::{AuthUser, BearerToken},
    },
    db::models::{sessions::Session, users::User},
};

pub struct AuthRouter;

impl AuthRouter {
    pub fn router() -> Router<Arc<AppState>> {
        Router::new()
            .nest("/signup", SignupRouter::router())
            .nest("/login", LoginRouter::router())
            .route("/me", get(get_me))
            .route("/logout", delete(logout))
    }
}

async fn get_me(AuthUser(user): AuthUser) -> Json<User> {
    Json(user)
}

async fn logout(State(state): State<Arc<AppState>>, BearerToken(token): BearerToken) -> Result<StatusCode, AppError> {
    Session::delete_by_token(state.db(), &token).await?;

    Ok(StatusCode::NO_CONTENT)
}
