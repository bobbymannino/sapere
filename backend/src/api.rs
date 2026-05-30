use axum::{Router, routing::get};
use tracing::{error, info};

use crate::db::Db;

pub struct App {
    db: Db,
}

impl App {
    pub fn new(db: Db) -> Self {
        App { db }
    }

    pub async fn run(self, port: u16) {
        let app = Router::new().route("/", get(|| async { "Hello, World!" }));

        let listen_on = format!("0.0.0.0:{port}");
        let Ok(listener) = tokio::net::TcpListener::bind(listen_on).await else {
            error!("Failed to bind to port {port}");
            panic!("Failed to bind to port {port}");
        };
        info!("Starting API on port {port}");
        axum::serve(listener, app).await.unwrap();
        self.db.close().await;
    }
}
