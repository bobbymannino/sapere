use std::sync::Arc;

use axum::{Router, routing::post};

use crate::app::app_state::AppState;

pub struct SignupRouter;

impl SignupRouter {
    pub fn new() -> Router<Arc<AppState>> {
        Router::new().route("/email", post(signup_with_email))
    }
}

async fn signup_with_email() -> &'static str {
    "signed up"
}
