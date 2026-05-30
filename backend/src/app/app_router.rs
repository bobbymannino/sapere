mod auth_router;

use std::sync::Arc;

use axum::Router;

use crate::app::app_state::AppState;

pub struct AppRouter;

impl AppRouter {
    pub fn new(app_state: Arc<AppState>) -> Router {
        let auth_router = auth_router::AuthRouter::new();

        let router = Router::new().nest("/auth", auth_router);

        Router::new().nest("/api", router).with_state(app_state)
    }
}
