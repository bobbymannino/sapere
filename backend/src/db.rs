pub mod models;

use anyhow::bail;
use sqlx::PgPool;
use tracing::{error, info};

pub struct Db {
    conn: PgPool,
}

impl Db {
    pub async fn new(database_url: &str) -> anyhow::Result<Self> {
        info!("Connecting to database");
        let result = PgPool::connect(database_url).await;
        if result.is_err() {
            error!("Failed to connect to database: {:?}", result);
            bail!(result.err().unwrap())
        }
        Ok(Db { conn: result? })
    }

    /// Create a new database from env.DATABASE_URL
    pub async fn from_database_url() -> anyhow::Result<Self> {
        let database_url = std::env::var("DATABASE_URL");
        let Ok(database_url) = database_url else {
            error!("DATABASE_URL is not defined");
            bail!(database_url.err().unwrap());
        };
        Ok(Db::new(&database_url).await?)
    }

    pub async fn run_migrations(&self) -> anyhow::Result<()> {
        info!("Running migrations");
        let result = sqlx::migrate!("./migrations").run(&self.conn).await;
        if result.is_err() {
            error!("Failed to run migrations: {:?}", result);
            bail!(result.err().unwrap())
        }
        Ok(())
    }

    pub async fn close(&self) {
        self.conn.close().await
    }
}
