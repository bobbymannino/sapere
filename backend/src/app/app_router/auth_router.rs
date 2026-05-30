use std::sync::Arc;

use axum::Router;

use crate::app::app_state::AppState;

pub struct AuthRouter;

impl AuthRouter {
    pub fn new() -> Router<Arc<AppState>> {
        Router::new()
    }
}
