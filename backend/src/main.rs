mod app;
mod db;
mod pagination;
mod password;
mod regexes;

use anyhow::bail;
use tracing::error;

use crate::app::{App, app_state::AppState};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt().init();

    let db = db::Db::from_database_url().await?;
    db.run_migrations().await?;
    let app_state = AppState::new(db);
    let app = App::new(app_state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let Ok(port) = port.parse::<u16>() else {
        error!("PORT must be a u16, received: {port}");
        bail!("PORT must be a u16, received: {port}");
    };
    app.run(port).await?;
    Ok(())
}
