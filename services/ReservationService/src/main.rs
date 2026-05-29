mod controllers;
mod db;
mod entities;
mod errors;
mod messaging;
mod middleware;
mod repositories;
mod routers;
mod schemas;
mod services;
mod storage;
mod traits;

use sqlx::PgPool;

use crate::repositories::espacio_verificacion_repository::EspacioVerificacionRepository;
use crate::repositories::reserva_repository::ReservaRepository;
use crate::routers::AppState;
use crate::storage::cola_prioridad::ColaPrioridad;
use crate::traits::ReservaRepositoryTrait;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let database_url =
        std::env::var("DATABASE_URL").expect("DATABASE_URL environment variable is required");
    let amqp_url = std::env::var("AMQP_URL").unwrap_or_default();

    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    db::run_migrations(&pool).await;

    let reserva_repo = ReservaRepository::new(pool.clone());
    let ev_repo = EspacioVerificacionRepository::new(pool.clone());

    let pendientes = reserva_repo
        .cargar_pendientes()
        .await
        .expect("Failed to load pending reservations");
    let cola = ColaPrioridad::from_reservas(&pendientes);
    println!(
        "Loaded {} pending reservations into priority queue",
        pendientes.len()
    );

    if !amqp_url.is_empty() {
        tokio::spawn(messaging::start_consumer(amqp_url, pool.clone()));
    } else {
        println!("AMQP_URL not set, skipping RabbitMQ consumer");
    }

    let state = AppState {
        pool,
        cola,
        reserva_repo,
        ev_repo,
    };

    let app = routers::create_router(state);
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000")
        .await
        .expect("Failed to bind to port 8000");

    println!("ReservationService listening on port 8000");
    axum::serve(listener, app).await.expect("Server failed");
}
