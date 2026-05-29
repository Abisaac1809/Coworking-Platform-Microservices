use axum::extract::State;
use axum::response::IntoResponse;
use axum::Json;

use crate::errors::AppError;
use crate::middleware::auth::AdminUser;
use crate::routers::AppState;
use crate::services::{cola_service, reserva_service};

pub async fn estado_cola(
    State(state): State<AppState>,
    _admin: AdminUser,
) -> Result<impl IntoResponse, AppError> {
    let response = cola_service::estado_cola(&state.cola).await;
    Ok(Json(response))
}

pub async fn confirmar_siguiente(
    State(state): State<AppState>,
    _admin: AdminUser,
) -> Result<impl IntoResponse, AppError> {
    let response =
        reserva_service::confirmar_siguiente(&state.reserva_repo, &state.cola).await?;
    Ok(Json(response))
}
