use std::collections::BinaryHeap;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::entities::elemento_cola::ElementoCola;
use crate::entities::reserva::Reserva;

#[derive(Clone)]
pub struct ColaPrioridad {
    heap: Arc<Mutex<BinaryHeap<ElementoCola>>>,
}

impl ColaPrioridad {
    pub fn new() -> Self {
        Self {
            heap: Arc::new(Mutex::new(BinaryHeap::new())),
        }
    }

    pub fn from_reservas(reservas: &[Reserva]) -> Self {
        let mut heap = BinaryHeap::new();
        for r in reservas {
            heap.push(ElementoCola {
                reserva_id: r.id,
                espacio_id: r.espacio_id,
                usuario_id: r.usuario_id,
                fecha_inicio: r.fecha_inicio,
            });
        }
        Self {
            heap: Arc::new(Mutex::new(heap)),
        }
    }

    pub async fn insertar(&self, elemento: ElementoCola) {
        let mut heap = self.heap.lock().await;
        heap.push(elemento);
    }

    pub async fn pop(&self) -> Option<ElementoCola> {
        let mut heap = self.heap.lock().await;
        heap.pop()
    }

    pub async fn peek(&self) -> Option<ElementoCola> {
        let heap = self.heap.lock().await;
        heap.peek().cloned()
    }

    pub async fn len(&self) -> usize {
        let heap = self.heap.lock().await;
        heap.len()
    }

    pub async fn listar_ordenada(&self) -> Vec<ElementoCola> {
        let heap = self.heap.lock().await;
        let mut items: Vec<ElementoCola> = heap.iter().cloned().collect();
        items.sort_by(|a, b| a.fecha_inicio.cmp(&b.fecha_inicio));
        items
    }
}
