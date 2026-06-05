export interface ChartData {
  name: string
  value: number
}

export interface ChartCardProps {
  title: string
  data: ChartData[]
  color?: string
}
