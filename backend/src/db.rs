pub mod models;

use std::time::Duration;

use sqlx::PgPool;
use sqlx::postgres::PgPoolOptions;
use tracing::{error, info};

pub struct Db {
    conn: PgPool,
}

impl Db {
    pub async fn new(database_url: &str) -> anyhow::Result<Self> {
        info!("Connecting to database");
        let conn = PgPoolOptions::new()
            .max_connections(50)
            .min_connections(5)
            .acquire_timeout(Duration::from_secs(5))
            .idle_timeout(Duration::from_mins(10))
            .connect(database_url)
            .await
            .inspect_err(|e| error!("Failed to connect to database: {e:?}"))?;
        Ok(Db { conn })
    }

    /// Create a new database from `env.DATABASE_URL`
    pub async fn from_database_url() -> anyhow::Result<Self> {
        let database_url =
            std::env::var("DATABASE_URL").inspect_err(|_| error!("DATABASE_URL is not defined"))?;
        Db::new(&database_url).await
    }

    pub async fn run_migrations(&self) -> anyhow::Result<()> {
        info!("Running migrations");
        sqlx::migrate!("./migrations")
            .run(&self.conn)
            .await
            .inspect_err(|e| error!("Failed to run migrations: {e:?}"))?;
        Ok(())
    }

    pub async fn close(&self) {
        self.conn.close().await;
    }
}
