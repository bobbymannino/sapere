pub mod app_error;
mod app_router;
pub mod app_state;

use std::sync::Arc;

use anyhow::bail;
use tracing::{error, info};

use crate::app::{app_router::AppRouter, app_state::AppState};

pub struct App {
    app_state: Arc<AppState>,
}

impl App {
    pub fn new(app_state: AppState) -> Self {
        App {
            app_state: Arc::new(app_state),
        }
    }

    pub async fn run(self, port: u16) -> anyhow::Result<()> {
        let router = AppRouter::router(self.app_state.clone());

        let listen_on = format!("0.0.0.0:{port}");
        let Ok(listener) = tokio::net::TcpListener::bind(listen_on).await else {
            error!("Failed to bind to port {port}");
            bail!("Failed to bind to port {port}");
        };
        info!("Starting API on port {port}");
        axum::serve(listener, router)
            .with_graceful_shutdown(shutdown_signal())
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        info!("Closing database connection");
        self.app_state.db().close().await;
        Ok(())
    }
}

async fn shutdown_signal() {
    if let Err(err) = tokio::signal::ctrl_c().await {
        error!("Failed to install ctrl+c handler: {err}");
    }
    info!("Shutdown signal received");
}
