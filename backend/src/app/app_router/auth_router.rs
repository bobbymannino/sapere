mod login_router;
mod signup_router;

use std::sync::Arc;

use axum::{Json, Router, routing::get};

use crate::{
    app::{
        app_router::auth_router::{login_router::LoginRouter, signup_router::SignupRouter},
        app_state::AppState,
        auth::AuthUser,
    },
    db::models::users::User,
};

pub struct AuthRouter;

impl AuthRouter {
    pub fn router() -> Router<Arc<AppState>> {
        Router::new()
            .nest("/signup", SignupRouter::router())
            .nest("/login", LoginRouter::router())
            .route("/me", get(get_me))
    }
}

async fn get_me(AuthUser(user): AuthUser) -> Json<User> {
    Json(user)
}
