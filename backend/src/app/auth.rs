use std::sync::Arc;

use axum::{
    extract::FromRequestParts,
    http::{header::AUTHORIZATION, request::Parts},
};
use sha2::{Digest, Sha256};

use crate::{
    app::{app_error::AppError, app_state::AppState},
    db::models::users::User,
};

pub struct BearerToken(pub String);

impl<S: Send + Sync> FromRequestParts<S> for BearerToken {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let token = parts
            .headers
            .get(AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.strip_prefix("Bearer "))
            .ok_or(AppError::Unauthorized("Missing or invalid Authorization header"))?;

        Ok(BearerToken(token.to_string()))
    }
}

pub struct AuthUser(pub User);

impl FromRequestParts<Arc<AppState>> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &Arc<AppState>) -> Result<Self, Self::Rejection> {
        let BearerToken(token) = BearerToken::from_request_parts(parts, state).await?;

        let token_hash = hex::encode(Sha256::digest(token.as_bytes()));
        let user = User::find_by_active_session(state.db(), &token_hash)
            .await?
            .ok_or(AppError::Unauthorized("Invalid or expired session"))?;

        Ok(AuthUser(user))
    }
}
