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
import type { ChartData } from '@/types';

interface DashboardChartsProps {
  monthlyData: ChartData[]
  topSpaces: ChartData[]
}

export default function DashboardCharts({ monthlyData, topSpaces }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-[15px] font-semibold text-[#1e293b] mb-4">Ingresos Mensuales</h3>
        {monthlyData.length === 0 ? (
          <p className="text-[13px] text-[#94a3b8] text-center py-8">Sin datos disponibles</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={28}>
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
        )}
      </div>

      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-[15px] font-semibold text-[#1e293b] mb-4">Top Espacios por Ingresos</h3>
        {topSpaces.length === 0 ? (
          <p className="text-[13px] text-[#94a3b8] text-center py-8">Sin datos disponibles</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topSpaces} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, 'Ingresos']}
              />
              <Bar dataKey="value" fill="#0f766e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
