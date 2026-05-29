use axum::routing::{delete, get, post};
use axum::Router;
use sqlx::PgPool;

use crate::controllers::{cola_controller, health_controller, reserva_controller};
use crate::repositories::espacio_verificacion_repository::EspacioVerificacionRepository;
use crate::repositories::reserva_repository::ReservaRepository;
use crate::storage::cola_prioridad::ColaPrioridad;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub cola: ColaPrioridad,
    pub reserva_repo: ReservaRepository,
    pub ev_repo: EspacioVerificacionRepository,
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
            "/reservas/{id}",
            delete(reserva_controller::cancelar_reserva),
        )
        .route("/cola", get(cola_controller::estado_cola))
        .route("/cola/confirmar", post(cola_controller::confirmar_siguiente))
        .with_state(state)
}
