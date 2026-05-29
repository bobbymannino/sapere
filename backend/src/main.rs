mod db;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt().init();

    let db = db::Db::from_database_url().await.unwrap();
    db.run_migrations().await.unwrap();

    println!("Hello, world!");
}
