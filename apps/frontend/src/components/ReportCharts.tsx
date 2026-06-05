'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData, ChartCardProps } from '@/types';

interface ReportChartsProps {
  bySpace: ChartData[]
  byUser: ChartData[]
}

function ChartCard({ title, data, color = '#0d9488' }: ChartCardProps) {
  return (
    <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
      <h3 className="text-[15px] font-semibold text-[#1e293b] mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-[13px] text-[#94a3b8] text-center py-8">Sin datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
              formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, 'Monto']}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function ReportCharts({ bySpace, byUser }: ReportChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <ChartCard title="Ingresos por Espacio" data={bySpace} color="#2563eb" />
      <ChartCard title="Gasto por Usuario" data={byUser} color="#0f766e" />
    </div>
  );
}
