use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("No encontrado: {0}")]
    NotFound(String),
    #[error("No autorizado")]
    Unauthorized,
    #[error("Prohibido: {0}")]
    Forbidden(String),
    #[error("Solicitud inválida: {0}")]
    BadRequest(String),
    #[error("Error interno: {0}")]
    Internal(String),
    #[error("Error de base de datos: {0}")]
    Database(#[from] sqlx::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, msg) = match &self {
            AppError::NotFound(m) => (StatusCode::NOT_FOUND, m.clone()),
            AppError::Unauthorized => {
                (StatusCode::UNAUTHORIZED, "Usuario no autenticado".into())
            }
            AppError::Forbidden(m) => (StatusCode::FORBIDDEN, m.clone()),
            AppError::BadRequest(m) => (StatusCode::BAD_REQUEST, m.clone()),
            AppError::Internal(m) => (StatusCode::INTERNAL_SERVER_ERROR, m.clone()),
            AppError::Database(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()),
        };
        (status, Json(serde_json::json!({"error": msg}))).into_response()
    }
}
