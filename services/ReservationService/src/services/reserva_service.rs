use chrono::Utc;

use crate::entities::elemento_cola::ElementoCola;
use crate::entities::reserva::Reserva;
use crate::errors::AppError;
use crate::repositories::espacio_verificacion_repository::EspacioVerificacionRepository;
use crate::repositories::reserva_repository::ReservaRepository;
use crate::schemas::reserva_schemas::{ConfirmarResponse, CrearReservaRequest};
use crate::storage::cola_prioridad::ColaPrioridad;
use crate::traits::{EspacioVerificacionRepositoryTrait, ReservaRepositoryTrait};

pub async fn crear_reserva(
    repo: &ReservaRepository,
    ev_repo: &EspacioVerificacionRepository,
    cola: &ColaPrioridad,
    usuario_id: i32,
    req: CrearReservaRequest,
) -> Result<Reserva, AppError> {
    let now = Utc::now().naive_utc();
    if req.fecha_inicio <= now {
        return Err(AppError::BadRequest(
            "La fecha de inicio debe ser posterior al momento actual".into(),
        ));
    }
    if req.fecha_fin <= req.fecha_inicio {
        return Err(AppError::BadRequest(
            "La fecha de fin debe ser posterior a la fecha de inicio".into(),
        ));
    }

    let verificacion = ev_repo.obtener(req.espacio_id).await?;
    let necesita = verificacion
        .map(|v| v.necesita_verificacion)
        .unwrap_or(false);

    let estado = if necesita { "PENDIENTE" } else { "CONFIRMADA" };

    let reserva = repo
        .crear(
            usuario_id,
            req.espacio_id,
            req.fecha_inicio,
            req.fecha_fin,
            estado,
            req.notas.as_deref(),
        )
        .await?;

    if necesita {
        cola.insertar(ElementoCola {
            reserva_id: reserva.id,
            espacio_id: reserva.espacio_id,
            usuario_id: reserva.usuario_id,
            fecha_inicio: reserva.fecha_inicio,
        })
        .await;
    }

    Ok(reserva)
}

pub async fn cancelar_reserva(
    repo: &ReservaRepository,
    reserva_id: i32,
    user_id: i32,
    user_role: &str,
) -> Result<Reserva, AppError> {
    let reserva = repo
        .obtener_por_id(reserva_id)
        .await?
        .ok_or_else(|| AppError::NotFound("Reserva no encontrada".into()))?;

    if user_role != "admin" && reserva.usuario_id != user_id {
        return Err(AppError::Forbidden(
            "No tiene permiso para cancelar esta reserva".into(),
        ));
    }

    let updated = repo.actualizar_estado(reserva_id, "CANCELADA").await?;
    Ok(updated)
}

pub async fn confirmar_siguiente(
    repo: &ReservaRepository,
    cola: &ColaPrioridad,
) -> Result<ConfirmarResponse, AppError> {
    loop {
        let elemento = cola
            .pop()
            .await
            .ok_or_else(|| AppError::BadRequest("No hay reservas en espera".into()))?;

        let reserva = repo
            .obtener_por_id(elemento.reserva_id)
            .await?
            .ok_or_else(|| AppError::Internal("Reserva en cola no encontrada en BD".into()))?;

        if reserva.estado == "CANCELADA" {
            continue;
        }

        let confirmed = repo
            .actualizar_estado(elemento.reserva_id, "CONFIRMADA")
            .await?;

        return Ok(ConfirmarResponse {
            id: confirmed.id,
            usuario_id: confirmed.usuario_id,
            espacio_id: confirmed.espacio_id,
            estado: confirmed.estado,
            fecha_inicio: confirmed.fecha_inicio,
        });
    }
}
