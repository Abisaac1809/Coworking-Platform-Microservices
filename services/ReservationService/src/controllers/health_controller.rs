use axum::extract::State;
use axum::response::IntoResponse;
use axum::Json;

use crate::routers::AppState;

pub async fn health(State(state): State<AppState>) -> impl IntoResponse {
    let db_status = match sqlx::query("SELECT 1").execute(&state.pool).await {
        Ok(_) => "connected",
        Err(_) => "disconnected",
    };

    Json(serde_json::json!({
        "status": "healthy",
        "service": "ReservationService",
        "database": db_status
    }))
}
