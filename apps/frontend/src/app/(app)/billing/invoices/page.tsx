import type { Metadata } from 'next';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import PayButton from './PayButton';
import type { Factura } from '@/types';

export const metadata: Metadata = { title: 'Facturas — NEXUS Cowork' };

export default async function InvoicesPage() {
  const user = await getUserFromCookies();
  const isAdmin = user?.role === 'Admin';

  const endpoint = isAdmin
    ? '/api/billing/facturas?page=1&limit=50'
    : '/api/billing/facturas/mis-facturas?page=1&limit=50';

  let facturas: Factura[] = [];
  try {
    const res = await apiGet(endpoint);
    if (res.ok) {
      const data = await res.json();
      facturas = Array.isArray(data.facturas) ? data.facturas : Array.isArray(data) ? data : [];
    }
  } catch {
    // show empty state
  }

  const columns = isAdmin
    ? ['ID', 'Espacio', 'Periodo', 'Horas', 'Subtotal', 'Impuesto', 'Total', 'Estado', 'Acción']
    : ['ID', 'Espacio', 'Periodo', 'Horas', 'Subtotal', 'Impuesto', 'Total', 'Estado'];

  return (
    <div>
      <PageHeader title={isAdmin ? 'Todas las Facturas' : 'Mis Facturas'} />

      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {facturas.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Aún no hay facturas" description="Las facturas aparecerán aquí cuando se generen a partir de las reservas." />
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
                      <td className="px-4 py-3 text-[#64748b]">Space #{f.espacio_id}</td>
                      <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">{start} – {end}</td>
                      <td className="px-4 py-3 text-[#64748b]">{f.horas}h</td>
                      <td className="px-4 py-3 text-[#64748b]">${Number(f.subtotal).toFixed(2)}</td>
                      <td className="px-4 py-3 text-[#64748b]">${Number(f.impuesto).toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold text-[#115e59]">${Number(f.total).toFixed(2)}</td>
                      <td className="px-4 py-3"><Badge status={f.estado} /></td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          {!/pagad|cancel/i.test(f.estado ?? '') && <PayButton id={f.id} />}
                        </td>
                      )}
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
