use chrono::{DateTime, Utc};
use uuid::Uuid;

pub struct Session {
    id: Uuid,
    user_id: i32,
    token_hash: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

impl Session {}
