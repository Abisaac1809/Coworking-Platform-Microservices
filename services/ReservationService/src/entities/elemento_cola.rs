use chrono::NaiveDateTime;
use serde::Serialize;
use std::cmp::Ordering;

#[derive(Debug, Clone, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementoCola {
    pub reserva_id: i32,
    pub espacio_id: i32,
    pub usuario_id: i32,
    pub fecha_inicio: NaiveDateTime,
}

impl Ord for ElementoCola {
    fn cmp(&self, other: &Self) -> Ordering {
        other
            .fecha_inicio
            .cmp(&self.fecha_inicio)
            .then_with(|| other.reserva_id.cmp(&self.reserva_id))
    }
}

impl PartialOrd for ElementoCola {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}
