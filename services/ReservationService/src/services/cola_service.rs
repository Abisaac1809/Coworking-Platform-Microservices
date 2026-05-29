use crate::schemas::reserva_schemas::ColaResponse;
use crate::storage::cola_prioridad::ColaPrioridad;

pub async fn estado_cola(cola: &ColaPrioridad) -> ColaResponse {
    let total = cola.len().await;
    let siguiente = cola.peek().await;
    let lista = cola.listar_ordenada().await;

    ColaResponse {
        total_en_espera: total,
        siguiente_en_cola: siguiente,
        lista_ordenada: lista,
    }
}
