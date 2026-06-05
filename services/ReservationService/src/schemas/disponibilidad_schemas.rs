use chrono::{NaiveDate, NaiveDateTime, NaiveTime};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct DisponibilidadQuery {
    pub espacio_id: i32,
    pub fecha: NaiveDate,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SlotOcupado {
    pub fecha_inicio: NaiveDateTime,
    pub fecha_fin: NaiveDateTime,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DisponibilidadResponse {
    pub dia_activo: bool,
    pub hora_inicio: Option<NaiveTime>,
    pub hora_fin: Option<NaiveTime>,
    pub ocupadas: Vec<SlotOcupado>,
}
