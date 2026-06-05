export interface Factura {
  id: number
  usuario_id?: number
  espacio_id: number
  fecha_inicio: string
  fecha_fin: string
  // Postgres returns DECIMAL columns as strings, so these may arrive as strings.
  horas: number | string
  precio_hora: number | string
  subtotal: number | string
  impuesto: number | string
  total: number | string
  estado: string
}

export interface RawMonthlyData {
  mes?: string
  month?: string
  periodo?: string
  total_ingresos?: number
  total?: number
  ingresos?: number
}

export interface RawSpaceData {
  espacio?: string
  space?: string
  nombre?: string
  espacio_id?: number | string
  total_ingresos?: number
  total?: number
  total_recaudado?: number
  ingresos?: number
}

export interface RawUserData {
  usuario?: string
  user?: string
  usuario_id?: number | string
  total_gastado?: number
  total?: number
  gasto?: number
}

export interface ReportSummary {
  total_ingresos?: number
  total_revenue?: number
  total_facturas?: number
  total_invoices?: number
  pendientes?: number
  pending?: number
  pagadas?: number
  paid?: number
}
