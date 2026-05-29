import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import KpiCard from '@/components/KpiCard';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import PayButton from '../billing/invoices/PayButton';
import type { Factura } from '@/types';

export const metadata: Metadata = { title: 'Caja — NEXUS Cowork' };

// A factura counts as pending to collect unless it's already paid or cancelled.
const isPending = (estado?: string) => !/pagad|cancel/i.test(estado ?? '');

export default async function CajaPage() {
  const user = await getUserFromCookies();
  if (user?.role !== 'Admin') redirect('/dashboard');

  let facturas: Factura[] = [];
  try {
    const res = await apiGet('/api/billing/facturas?page=1&limit=100');
    if (res.ok) {
      const data = await res.json();
      const all = Array.isArray(data.facturas) ? data.facturas : Array.isArray(data) ? data : [];
      facturas = all.filter((f: Factura) => isPending(f.estado));
    }
  } catch {
    // show empty state
  }

  const pendingCount = facturas.length;
  const pendingTotal = facturas.reduce((s, f) => s + (Number(f.total) || 0), 0);

  const columns = ['ID', 'Espacio', 'Periodo', 'Horas', 'Total', 'Estado', 'Acción'];

  return (
    <div>
      <PageHeader title="Caja" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Facturas Pendientes" value={pendingCount} accentColor="#ca8a04" />
        <KpiCard label="Monto Pendiente" value={`$${pendingTotal.toFixed(2)}`} accentColor="#0d9488" />
      </div>

      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {facturas.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No hay facturas pendientes"
              description="Todas las facturas están al día. Las nuevas aparecerán aquí para cobro."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc]">
                  {columns.map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold text-[#64748b] uppercase tracking-[0.05em] whitespace-nowrap border-b border-[#e2e8f0]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => {
                  const start = new Date(f.fecha_inicio).toLocaleDateString();
                  const end = new Date(f.fecha_fin).toLocaleDateString();
                  return (
                    <tr key={f.id} className="hover:bg-[#fafbfc] border-b border-[#e2e8f0] last:border-0">
                      <td className="px-4 py-3 text-[#1e293b] font-medium">#{f.id}</td>
                      <td className="px-4 py-3 text-[#64748b]">Espacio #{f.espacio_id}</td>
                      <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">{start} – {end}</td>
                      <td className="px-4 py-3 text-[#64748b]">{f.horas}h</td>
                      <td className="px-4 py-3 font-semibold text-[#115e59]">${Number(f.total).toFixed(2)}</td>
                      <td className="px-4 py-3"><Badge status={f.estado} /></td>
                      <td className="px-4 py-3"><PayButton id={f.id} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
