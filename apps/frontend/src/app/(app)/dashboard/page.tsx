import type { Metadata } from 'next';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import KpiCard from '@/components/KpiCard';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import DashboardCharts from '@/components/DashboardCharts';
import ReportCharts from '@/components/ReportCharts';
import type { Factura, RawSpaceData, RawUserData } from '@/types';

export const metadata: Metadata = { title: 'Dashboard — NEXUS Cowork' };

async function getAdminData() {
  const [resumen, monthly, top, bySpace, byUser] = await Promise.allSettled([
    apiGet('/api/billing/reportes/resumen').then((r) => (r.ok ? r.json() : null)),
    apiGet('/api/billing/reportes/ingresos-mensuales?meses=6').then((r) => (r.ok ? r.json() : null)),
    apiGet('/api/billing/reportes/top-espacios?top=5').then((r) => (r.ok ? r.json() : null)),
    apiGet('/api/billing/reportes/por-espacio').then((r) => (r.ok ? r.json() : null)),
    apiGet('/api/billing/reportes/por-usuario').then((r) => (r.ok ? r.json() : null)),
  ]);
  return {
    resumen: resumen.status === 'fulfilled' ? resumen.value : null,
    monthly: monthly.status === 'fulfilled' ? (monthly.value?.datos ?? monthly.value ?? []) : [],
    top: top.status === 'fulfilled' ? (Array.isArray(top.value) ? top.value : []) : [],
    bySpace: bySpace.status === 'fulfilled' ? (Array.isArray(bySpace.value) ? bySpace.value : []) : [],
    byUser: byUser.status === 'fulfilled' ? (Array.isArray(byUser.value) ? byUser.value : []) : [],
  };
}

async function getUserData() {
  const res = await apiGet('/api/billing/facturas/mis-facturas?page=1&limit=5').catch(() => null);
  if (!res?.ok) return { facturas: [], total: 0, spent: 0 };
  const data = await res.json().catch(() => ({ facturas: [] }));
  const facturas = Array.isArray(data.facturas) ? data.facturas : [];
  const spent = facturas.reduce((s: number, f: Factura) => s + (Number(f.total) || 0), 0);
  return { facturas, total: data.total ?? facturas.length, spent };
}

export default async function DashboardPage() {
  const user = await getUserFromCookies();
  const isAdmin = user?.role === 'Admin';

  if (isAdmin) {
    const { resumen, monthly, top, bySpace, byUser } = await getAdminData();
    const totalRevenue = resumen?.total_ingresos ?? resumen?.total_revenue ?? 0;
    const totalInvoices = resumen?.total_facturas ?? resumen?.total_invoices ?? 0;
    const pending = resumen?.pendientes ?? resumen?.pending ?? resumen?.pendientes_pago ?? 0;
    const paid = resumen?.pagadas ?? resumen?.paid ?? 0;
    const avgInvoice =
      resumen?.promedio_factura ?? (totalInvoices > 0 ? Number(totalRevenue) / Number(totalInvoices) : 0);

    const spaceData = (bySpace as RawSpaceData[]).map((d) => ({
      name: String(d.espacio ?? d.space ?? d.espacio_id ?? ''),
      value: Number(d.total ?? d.ingresos ?? 0),
    }));
    const userData = (byUser as RawUserData[]).map((d) => ({
      name: String(d.usuario ?? d.user ?? d.usuario_id ?? ''),
      value: Number(d.total ?? d.gasto ?? 0),
    }));

    return (
      <div>
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Ingresos Totales" value={`$${Number(totalRevenue).toFixed(2)}`} accentColor="#0d9488" />
          <KpiCard label="Facturas" value={totalInvoices} accentColor="#2563eb" />
          <KpiCard label="Pendientes" value={pending} accentColor="#ca8a04" />
          <KpiCard label="Pagadas" value={paid} accentColor="#16a34a" />
          <KpiCard label="Factura Promedio" value={`$${Number(avgInvoice).toFixed(2)}`} accentColor="#0f766e" />
        </div>
        <DashboardCharts monthlyData={monthly} topSpaces={top} />
        <ReportCharts bySpace={spaceData} byUser={userData} />
      </div>
    );
  }

  const { facturas, total, spent } = await getUserData();

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Mis Facturas" value={total} accentColor="#0d9488" />
        <KpiCard label="Total Gastado" value={`$${spent.toFixed(2)}`} accentColor="#2563eb" />
        <KpiCard label="Reservas" value="—" accentColor="#ca8a04" />
        <KpiCard label="Espacios Activos" value="—" accentColor="#16a34a" />
      </div>

      {facturas.length > 0 && (
        <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e8f0]">
            <h3 className="text-[15px] font-semibold text-[#1e293b]">Facturas Recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc]">
                  {['ID', 'Espacio', 'Horas', 'Total', 'Estado'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold text-[#64748b] uppercase tracking-[0.05em] whitespace-nowrap border-b border-[#e2e8f0]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facturas.map((f: Factura) => (
                  <tr key={f.id} className="hover:bg-[#fafbfc] border-b border-[#e2e8f0] last:border-0">
                    <td className="px-4 py-3 text-[#1e293b]">#{f.id}</td>
                    <td className="px-4 py-3 text-[#64748b]">Espacio #{f.espacio_id}</td>
                    <td className="px-4 py-3 text-[#64748b]">{f.horas}h</td>
                    <td className="px-4 py-3 font-medium text-[#115e59]">${Number(f.total).toFixed(2)}</td>
                    <td className="px-4 py-3"><Badge status={f.estado ?? 'pendiente'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
