export interface Factura {
  id: number
  espacio_id: number
  fecha_inicio: string
  fecha_fin: string
  horas: number
  precio_hora: number
  subtotal: number
  impuesto: number
  total: number
  estado: string
}

export interface RawMonthlyData {
  mes?: string
  month?: string
  periodo?: string
  total?: number
  ingresos?: number
}

export interface RawSpaceData {
  espacio?: string
  space?: string
  espacio_id?: number | string
  total?: number
  ingresos?: number
}

export interface RawUserData {
  usuario?: string
  user?: string
  usuario_id?: number | string
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
