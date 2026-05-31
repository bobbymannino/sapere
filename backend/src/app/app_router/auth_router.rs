mod login_router;
mod signup_router;

use std::sync::Arc;

use axum::Router;

use crate::app::{
    app_router::auth_router::{login_router::LoginRouter, signup_router::SignupRouter},
    app_state::AppState,
};

pub struct AuthRouter;

impl AuthRouter {
    pub fn router() -> Router<Arc<AppState>> {
        Router::new()
            .nest("/signup", SignupRouter::router())
            .nest("/login", LoginRouter::router())
    }
}
