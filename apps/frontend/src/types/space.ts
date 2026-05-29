export type EspacioEstado = 'disponible' | 'reservada' | 'ocupada' | 'mantenimiento'

export interface Espacio {
  id: number
  nombre: string
  descripcion: string
  capacidad: number
  precio_por_hora: number
  estado: EspacioEstado | string
  foto_url: string
  necesita_verificacion?: boolean
  creado_en?: string
}

export interface EspaciosResponse {
  pagina: number
  limite: number
  filtros?: Record<string, unknown>
  espacios: Espacio[]
}
