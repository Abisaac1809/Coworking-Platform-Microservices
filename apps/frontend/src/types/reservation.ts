// ReservationService serializes every response with serde camelCase
// (see entities/reserva.rs `#[serde(rename_all = "camelCase")]`).
export interface Reserva {
  id: number
  usuarioId: number
  espacioId: number
  fechaInicio: string
  fechaFin: string
  estado: string
  notas?: string | null
  creadoEn?: string
}

// The reservations queue endpoint serializes in camelCase. Read defensively.
export interface ElementoCola {
  id?: number
  reservaId?: number
  usuarioId?: number
  espacioId?: number
  fechaInicio: string
  fechaFin?: string
  estado?: string
  notas?: string
  // snake_case fallbacks
  reserva_id?: number
  usuario_id?: number
  espacio_id?: number
  fecha_inicio?: string
  fecha_fin?: string
}

export interface ColaResponse {
  totalEnEspera: number
  siguienteEnCola: ElementoCola | null
  listaOrdenada: ElementoCola[]
}

export interface ReservaListResponse {
  pagina: number
  limite: number
  reservas: Reserva[]
}

export interface HorarioNegocio {
  id: number
  diaSemana: number
  horaInicio: string
  horaFin: string
  activo: boolean
}

export interface SlotOcupado {
  fechaInicio: string
  fechaFin: string
}

export interface DisponibilidadResponse {
  diaActivo: boolean
  horaInicio: string | null
  horaFin: string | null
  ocupadas: SlotOcupado[]
}
