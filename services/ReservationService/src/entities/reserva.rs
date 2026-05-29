use chrono::NaiveDateTime;
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Reserva {
    pub id: i32,
    pub usuario_id: i32,
    pub espacio_id: i32,
    pub fecha_inicio: NaiveDateTime,
    pub fecha_fin: NaiveDateTime,
    pub estado: String,
    pub notas: Option<String>,
    pub creado_en: Option<NaiveDateTime>,
}
