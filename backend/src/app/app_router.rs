mod auth_router;
mod workspaces_router;

use std::sync::Arc;

use axum::Router;

use crate::app::{
    app_router::{auth_router::AuthRouter, workspaces_router::WorkspacesRouter},
    app_state::AppState,
};

pub struct AppRouter;

impl AppRouter {
    pub fn router(app_state: Arc<AppState>) -> Router {
        let auth_router = AuthRouter::router();
        let workspaces_router = WorkspacesRouter::router();

        let router = Router::new()
            .nest("/auth", auth_router)
            .nest("/workspaces", workspaces_router);

        Router::new().nest("/api", router).with_state(app_state)
    }
}
