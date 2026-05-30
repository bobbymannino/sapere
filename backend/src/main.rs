mod api;
mod db;

use tracing::error;

use crate::api::App;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt().init();

    let db = db::Db::from_database_url().await.unwrap();
    db.run_migrations().await.unwrap();

    let app = App::new(db);
    let port = std::env::var("PORT").unwrap_or("3000".to_string());
    let Ok(port) = port.parse::<u16>() else {
        error!("PORT must be a u16, received: {port}");
        panic!("PORT must be a u16, received: {port}");
    };
    app.run(port).await;
}
