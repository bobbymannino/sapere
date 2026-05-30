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
        let conn = PgPool::connect(database_url).await;
        let conn = match conn {
            Ok(conn) => conn,
            Err(e) => {
                error!("Failed to connect to database: {:?}", e);
                bail!(e)
            }
        };
        Ok(Db { conn })
    }

    /// Create a new database from `env.DATABASE_URL`
    pub async fn from_database_url() -> anyhow::Result<Self> {
        let database_url = std::env::var("DATABASE_URL");
        let database_url = match database_url {
            Ok(url) => url,
            Err(e) => {
                error!("DATABASE_URL is not defined");
                bail!(e);
            }
        };
        Db::new(&database_url).await
    }

    pub async fn run_migrations(&self) -> anyhow::Result<()> {
        info!("Running migrations");
        let result = sqlx::migrate!("./migrations").run(&self.conn).await;
        match result {
            Ok(()) => Ok(()),
            Err(e) => {
                error!("Failed to run migrations: {:?}", e);
                bail!(e)
            }
        }
    }

    pub async fn close(&self) {
        self.conn.close().await;
    }
}
