use axum::routing::{delete, get, post, put};
use axum::Router;
use sqlx::PgPool;

use crate::controllers::{
    cola_controller, disponibilidad_controller, health_controller, horario_controller,
    reserva_controller,
};
use crate::repositories::espacio_verificacion_repository::EspacioVerificacionRepository;
use crate::repositories::horario_negocio_repository::HorarioNegocioRepository;
use crate::repositories::reserva_repository::ReservaRepository;
use crate::storage::cola_prioridad::ColaPrioridad;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub cola: ColaPrioridad,
    pub reserva_repo: ReservaRepository,
    pub ev_repo: EspacioVerificacionRepository,
    pub horario_repo: HorarioNegocioRepository,
}

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health_controller::health))
        .route(
            "/reservas",
            post(reserva_controller::crear_reserva).get(reserva_controller::listar_todas),
        )
        .route(
            "/reservas/mis-reservas",
            get(reserva_controller::mis_reservas),
        )
        .route(
            "/reservas/disponibilidad",
            get(disponibilidad_controller::disponibilidad),
        )
        .route(
            "/reservas/:id",
            delete(reserva_controller::cancelar_reserva),
        )
        .route("/cola", get(cola_controller::estado_cola))
        .route("/cola/confirmar", post(cola_controller::confirmar_siguiente))
        .route("/horarios", get(horario_controller::listar_horarios))
        .route(
            "/horarios/:dia_semana",
            put(horario_controller::actualizar_horario),
        )
        .with_state(state)
}
