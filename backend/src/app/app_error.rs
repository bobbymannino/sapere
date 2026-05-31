use std::collections::HashMap;

use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;
use tracing::error;
use validator::{ValidationError, ValidationErrors};

#[derive(Debug)]
pub enum AppError {
    Conflict(&'static str),
    Validation(ValidationErrors),
    Internal(anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::Conflict(msg) => (StatusCode::CONFLICT, Json(json!({ "message": msg }))).into_response(),
            AppError::Validation(errors) => (
                StatusCode::UNPROCESSABLE_ENTITY,
                Json(json!({
                    "message": "Validation failed",
                    "errors": format_validation_errors(&errors),
                })),
            )
                .into_response(),
            AppError::Internal(err) => {
                error!("Internal error: {err:?}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "message": "Internal server error" })),
                )
                    .into_response()
            }
        }
    }
}

impl From<anyhow::Error> for AppError {
    fn from(err: anyhow::Error) -> Self {
        AppError::Internal(err)
    }
}

impl From<ValidationErrors> for AppError {
    fn from(err: ValidationErrors) -> Self {
        AppError::Validation(err)
    }
}

fn format_validation_errors(errors: &ValidationErrors) -> HashMap<String, Vec<String>> {
    errors
        .field_errors()
        .into_iter()
        .map(|(field, errs)| {
            let field_name = field.to_string();
            let messages = errs.iter().map(|err| format_field_error(&field_name, err)).collect();
            (field_name, messages)
        })
        .collect()
}

fn format_field_error(field: &str, err: &ValidationError) -> String {
    if let Some(msg) = &err.message {
        return msg.to_string();
    }

    let param = |key: &str| err.params.get(key).cloned();

    match err.code.as_ref() {
        "email" => format!("{field} must be a valid email"),
        "url" => format!("{field} must be a valid URL"),
        "length" => match (param("min"), param("max")) {
            (Some(min), Some(max)) => format!("{field} must be between {min} and {max} characters"),
            (Some(min), None) => format!("{field} must be at least {min} characters"),
            (None, Some(max)) => format!("{field} must be at most {max} characters"),
            (None, None) => format!("{field} has an invalid length"),
        },
        "range" => match (param("min"), param("max")) {
            (Some(min), Some(max)) => format!("{field} must be between {min} and {max}"),
            (Some(min), None) => format!("{field} must be at least {min}"),
            (None, Some(max)) => format!("{field} must be at most {max}"),
            (None, None) => format!("{field} is out of range"),
        },
        "must_match" => format!("{field} does not match"),
        "regex" => format!("{field} is in the incorrect format"),
        "contains" => format!("{field} must contain the required value"),
        "does_not_contain" => format!("{field} contains a forbidden value"),
        "required" => format!("{field} is required"),
        code => format!("{field} failed validation: {code}"),
    }
}
