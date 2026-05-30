use crate::db::Db;

pub struct AppState {
    db: Db,
}

impl AppState {
    pub fn new(db: Db) -> Self {
        AppState { db }
    }

    pub fn db(&self) -> &Db {
        &self.db
    }
}
