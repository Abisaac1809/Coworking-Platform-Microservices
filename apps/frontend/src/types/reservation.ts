export interface Reserva {
  id: number
  usuario_id: number
  espacio_id: number
  fecha_inicio: string
  fecha_fin: string
  estado: string
  notas?: string
  creado_en?: string
}

// The reservations queue endpoint serializes in camelCase. Read defensively.
export interface ElementoCola {
  id: number
  usuarioId?: number
  espacioId?: number
  fechaInicio: string
  fechaFin?: string
  estado?: string
  notas?: string
  // snake_case fallbacks
  usuario_id?: number
  espacio_id?: number
  fecha_inicio?: string
}

export interface ColaResponse {
  totalEnEspera: number
  siguienteEnCola: ElementoCola | null
  listaOrdenada: ElementoCola[]
}
