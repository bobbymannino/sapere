pub mod app_state;

use std::sync::Arc;

use axum::{Json, Router, extract::State, routing::get};
use tracing::{error, info};

use crate::{app::app_state::AppState, db::models::users::User};

pub struct App {
    app_state: Arc<AppState>,
}

impl App {
    pub fn new(app_state: AppState) -> Self {
        App {
            app_state: Arc::new(app_state),
        }
    }

    pub async fn run(self, port: u16) {
        let app = Router::new().route("/", get(|| async { "Hello, World!" }));

        let app = app.route("/users", get(get_users)).with_state(self.app_state.clone());

        let listen_on = format!("0.0.0.0:{port}");
        let Ok(listener) = tokio::net::TcpListener::bind(listen_on).await else {
            error!("Failed to bind to port {port}");
            panic!("Failed to bind to port {port}");
        };
        info!("Starting API on port {port}");
        axum::serve(listener, app).with_graceful_shutdown(shutdown_signal()).await.unwrap();

        info!("Closing database connection");
        self.app_state.db().close().await;
    }
}

async fn shutdown_signal() {
    if let Err(err) = tokio::signal::ctrl_c().await {
        error!("Failed to install ctrl+c handler: {err}");
    }
    info!("Shutdown signal received");
}

async fn get_users(State(state): State<Arc<AppState>>) -> Json<Vec<User>> {
    let users = User::find_all(state.db()).await.unwrap();

    Json(users)
}
