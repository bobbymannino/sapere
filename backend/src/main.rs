mod app;
mod db;

use tracing::error;

use crate::app::{App, app_state::AppState};

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt().init();

    let db = db::Db::from_database_url().await.unwrap();
    db.run_migrations().await.unwrap();
    let app_state = AppState::new(db);
    let app = App::new(app_state);

    let port = std::env::var("PORT").unwrap_or("3000".to_string());
    let Ok(port) = port.parse::<u16>() else {
        error!("PORT must be a u16, received: {port}");
        panic!("PORT must be a u16, received: {port}");
    };
    app.run(port).await;
}
