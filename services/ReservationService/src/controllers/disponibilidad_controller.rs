use axum::extract::{Query, State};
use axum::response::IntoResponse;
use axum::Json;
use chrono::Datelike;
use sqlx::FromRow;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::routers::AppState;
use crate::schemas::disponibilidad_schemas::{DisponibilidadQuery, DisponibilidadResponse, SlotOcupado};
use crate::traits::HorarioNegocioRepositoryTrait;

#[derive(FromRow)]
struct SlotRow {
    fecha_inicio: chrono::NaiveDateTime,
    fecha_fin: chrono::NaiveDateTime,
}

pub async fn disponibilidad(
    State(state): State<AppState>,
    _auth: AuthUser,
    Query(params): Query<DisponibilidadQuery>,
) -> Result<impl IntoResponse, AppError> {
    let dia_semana: i16 = match params.fecha.weekday() {
        chrono::Weekday::Sun => 0,
        chrono::Weekday::Mon => 1,
        chrono::Weekday::Tue => 2,
        chrono::Weekday::Wed => 3,
        chrono::Weekday::Thu => 4,
        chrono::Weekday::Fri => 5,
        chrono::Weekday::Sat => 6,
    };

    let horario = state.horario_repo.obtener_por_dia(dia_semana).await?;

    let Some(horario) = horario else {
        return Ok(Json(DisponibilidadResponse {
            dia_activo: false,
            hora_inicio: None,
            hora_fin: None,
            ocupadas: vec![],
        }));
    };

    if !horario.activo {
        return Ok(Json(DisponibilidadResponse {
            dia_activo: false,
            hora_inicio: None,
            hora_fin: None,
            ocupadas: vec![],
        }));
    }

    let slots = sqlx::query_as::<_, SlotRow>(
        "SELECT fecha_inicio, fecha_fin FROM reservas
         WHERE espacio_id = $1
           AND estado IN ('CONFIRMADA', 'PENDIENTE')
           AND DATE(fecha_inicio) = $2",
    )
    .bind(params.espacio_id)
    .bind(params.fecha)
    .fetch_all(&state.pool)
    .await?;

    let ocupadas = slots
        .into_iter()
        .map(|s| SlotOcupado {
            fecha_inicio: s.fecha_inicio,
            fecha_fin: s.fecha_fin,
        })
        .collect();

    Ok(Json(DisponibilidadResponse {
        dia_activo: true,
        hora_inicio: Some(horario.hora_inicio),
        hora_fin: Some(horario.hora_fin),
        ocupadas,
    }))
}
