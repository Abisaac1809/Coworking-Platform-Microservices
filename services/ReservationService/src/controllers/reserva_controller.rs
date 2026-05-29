use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;

use crate::errors::AppError;
use crate::middleware::auth::{AdminUser, AuthUser};
use crate::routers::AppState;
use crate::schemas::pagination::PaginationParams;
use crate::schemas::reserva_schemas::{CancelarResponse, CrearReservaRequest, ReservaListResponse};
use crate::services::reserva_service;

pub async fn crear_reserva(
    State(state): State<AppState>,
    auth: AuthUser,
    Json(body): Json<CrearReservaRequest>,
) -> Result<impl IntoResponse, AppError> {
    let reserva = reserva_service::crear_reserva(
        &state.reserva_repo,
        &state.ev_repo,
        &state.cola,
        auth.user_id,
        body,
    )
    .await?;

    Ok((StatusCode::CREATED, Json(reserva)))
}

pub async fn mis_reservas(
    State(state): State<AppState>,
    auth: AuthUser,
    Query(params): Query<PaginationParams>,
) -> Result<impl IntoResponse, AppError> {
    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(10);
    let sort_by = params.sort_by.as_deref().unwrap_or("creado_en");
    let sort_order = params.sort_order.as_deref().unwrap_or("desc");

    let reservas = crate::traits::ReservaRepositoryTrait::listar_por_usuario(
        &state.reserva_repo,
        auth.user_id,
        page,
        limit,
        sort_by,
        sort_order,
    )
    .await?;

    Ok(Json(ReservaListResponse {
        pagina: page,
        limite: limit,
        reservas,
    }))
}

pub async fn cancelar_reserva(
    State(state): State<AppState>,
    auth: AuthUser,
    Path(id): Path<i32>,
) -> Result<impl IntoResponse, AppError> {
    let reserva =
        reserva_service::cancelar_reserva(&state.reserva_repo, id, auth.user_id, &auth.user_role)
            .await?;

    Ok(Json(CancelarResponse {
        id: reserva.id,
        estado: reserva.estado,
    }))
}

pub async fn listar_todas(
    State(state): State<AppState>,
    _admin: AdminUser,
    Query(params): Query<PaginationParams>,
) -> Result<impl IntoResponse, AppError> {
    let page = params.page.unwrap_or(1);
    let limit = params.limit.unwrap_or(10);

    let reservas =
        crate::traits::ReservaRepositoryTrait::listar_todas(&state.reserva_repo, page, limit)
            .await?;

    Ok(Json(ReservaListResponse {
        pagina: page,
        limite: limit,
        reservas,
    }))
}
