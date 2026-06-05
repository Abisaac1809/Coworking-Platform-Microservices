use chrono::{NaiveDateTime, NaiveTime};
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HorarioNegocio {
    pub id: i32,
    pub dia_semana: i16,
    pub hora_inicio: NaiveTime,
    pub hora_fin: NaiveTime,
    pub activo: bool,
    pub actualizado_en: Option<NaiveDateTime>,
}
