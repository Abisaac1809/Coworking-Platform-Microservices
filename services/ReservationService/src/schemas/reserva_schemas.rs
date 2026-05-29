use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

use crate::entities::elemento_cola::ElementoCola;
use crate::entities::reserva::Reserva;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CrearReservaRequest {
    pub espacio_id: i32,
    pub fecha_inicio: NaiveDateTime,
    pub fecha_fin: NaiveDateTime,
    pub notas: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReservaListResponse {
    pub pagina: i64,
    pub limite: i64,
    pub reservas: Vec<Reserva>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ColaResponse {
    pub total_en_espera: usize,
    pub siguiente_en_cola: Option<ElementoCola>,
    pub lista_ordenada: Vec<ElementoCola>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CancelarResponse {
    pub id: i32,
    pub estado: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfirmarResponse {
    pub id: i32,
    pub usuario_id: i32,
    pub espacio_id: i32,
    pub estado: String,
    pub fecha_inicio: NaiveDateTime,
}
