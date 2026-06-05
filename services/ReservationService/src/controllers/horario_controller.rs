use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use chrono::NaiveTime;

use crate::errors::AppError;
use crate::middleware::auth::{AdminUser, AuthUser};
use crate::routers::AppState;
use crate::schemas::horario_schemas::ActualizarHorarioRequest;
use crate::traits::HorarioNegocioRepositoryTrait;

pub async fn listar_horarios(
    State(state): State<AppState>,
    _auth: AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let horarios = state.horario_repo.listar_todos().await?;
    Ok(Json(horarios))
}

pub async fn actualizar_horario(
    State(state): State<AppState>,
    _admin: AdminUser,
    Path(dia_semana): Path<i16>,
    Json(body): Json<ActualizarHorarioRequest>,
) -> Result<impl IntoResponse, AppError> {
    let hora_inicio = NaiveTime::parse_from_str(&body.hora_inicio, "%H:%M")
        .map_err(|_| AppError::BadRequest("Formato de hora_inicio inválido (usa HH:MM)".into()))?;
    let hora_fin = NaiveTime::parse_from_str(&body.hora_fin, "%H:%M")
        .map_err(|_| AppError::BadRequest("Formato de hora_fin inválido (usa HH:MM)".into()))?;

    if hora_fin <= hora_inicio && body.activo {
        return Err(AppError::BadRequest(
            "hora_fin debe ser posterior a hora_inicio".into(),
        ));
    }

    let horario = state
        .horario_repo
        .actualizar(dia_semana, hora_inicio, hora_fin, body.activo)
        .await?;

    Ok((StatusCode::OK, Json(horario)))
}
