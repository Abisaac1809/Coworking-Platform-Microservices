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
import type { RawMonthlyData, RawSpaceData } from '@/types';

interface DashboardChartsProps {
  monthlyData: RawMonthlyData[]
  topSpaces: RawSpaceData[]
}

export default function DashboardCharts({ monthlyData, topSpaces }: DashboardChartsProps) {
  const monthly = monthlyData.map((d) => ({
    name: String(d.mes ?? d.month ?? ''),
    value: Number(d.total ?? d.ingresos ?? 0),
  }));

  const spaces = topSpaces.map((d) => ({
    name: String(d.espacio ?? d.space ?? d.espacio_id ?? ''),
    value: Number(d.total ?? d.ingresos ?? 0),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-[15px] font-semibold text-[#1e293b] mb-4">Ingresos Mensuales</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthly} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
              formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, 'Ingresos']}
            />
            <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-[15px] font-semibold text-[#1e293b] mb-4">Top Espacios por Ingresos</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={spaces} layout="vertical" barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
              formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, 'Ingresos']}
            />
            <Bar dataKey="value" fill="#0f766e" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
