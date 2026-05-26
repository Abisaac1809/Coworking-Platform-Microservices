use actix_web::{get, web, App, HttpResponse, HttpServer};
use sqlx::PgPool;

#[get("/health")]
async fn health(pool: web::Data<PgPool>) -> HttpResponse {
    let db_status = match sqlx::query("SELECT 1").execute(pool.get_ref()).await {
        Ok(_) => "connected",
        Err(_) => "disconnected",
    };

    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "ReservationService",
        "database": db_status
    }))
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL environment variable is required");

    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    println!("ReservationService listening on port 8000");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .service(health)
    })
    .bind("0.0.0.0:8000")?
    .run()
    .await
}
