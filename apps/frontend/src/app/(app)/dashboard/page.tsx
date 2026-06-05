import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import { getEspaciosMap, getUsuariosMap } from '@/lib/lookups';
import KpiCard from '@/components/KpiCard';
import PageHeader from '@/components/PageHeader';
import DashboardCharts from '@/components/DashboardCharts';
import ReportCharts from '@/components/ReportCharts';
import type { ChartData } from '@/types';

export const metadata: Metadata = { title: 'Dashboard — NEXUS Cowork' };

async function getAdminData() {
  const [resumen, monthly, top, bySpace, byUser, espacios, usuarios] = await Promise.allSettled([
    apiGet('/api/billing/reportes/resumen').then((r) => (r.ok ? r.json() : null)),
    apiGet('/api/billing/reportes/ingresos-mensuales?meses=6').then((r) => (r.ok ? r.json() : null)),
    apiGet('/api/billing/reportes/top-espacios?top=5').then((r) => (r.ok ? r.json() : null)),
    apiGet('/api/billing/reportes/por-espacio').then((r) => (r.ok ? r.json() : null)),
    apiGet('/api/billing/reportes/por-usuario').then((r) => (r.ok ? r.json() : null)),
    getEspaciosMap(),
    getUsuariosMap(),
  ]);

  const espaciosMap: Map<number, string> =
    espacios.status === 'fulfilled' ? espacios.value : new Map();
  const usuariosMap: Map<number, string> =
    usuarios.status === 'fulfilled' ? usuarios.value : new Map();

  const rawMonthly: { mes?: string; total_ingresos?: number }[] =
    monthly.status === 'fulfilled'
      ? (monthly.value?.datos ?? (Array.isArray(monthly.value) ? monthly.value : []))
      : [];
  const rawTop: { espacio_id?: number; total_ingresos?: number }[] =
    top.status === 'fulfilled' ? (Array.isArray(top.value) ? top.value : []) : [];
  const rawBySpace: { espacio_id?: number; total_ingresos?: number }[] =
    bySpace.status === 'fulfilled' ? (Array.isArray(bySpace.value) ? bySpace.value : []) : [];
  const rawByUser: { usuario_id?: number; total_gastado?: number }[] =
    byUser.status === 'fulfilled' ? (Array.isArray(byUser.value) ? byUser.value : []) : [];

  const monthlyChart: ChartData[] = rawMonthly.map((d) => ({
    name: d.mes ?? '',
    value: Number(d.total_ingresos ?? 0),
  }));
  const topChart: ChartData[] = rawTop.map((d) => ({
    name: espaciosMap.get(Number(d.espacio_id)) ?? `Espacio #${d.espacio_id ?? ''}`,
    value: Number(d.total_ingresos ?? 0),
  }));
  const bySpaceChart: ChartData[] = rawBySpace.map((d) => ({
    name: espaciosMap.get(Number(d.espacio_id)) ?? `Espacio #${d.espacio_id ?? ''}`,
    value: Number(d.total_ingresos ?? 0),
  }));
  const byUserChart: ChartData[] = rawByUser.map((d) => ({
    name: usuariosMap.get(Number(d.usuario_id)) ?? `Usuario #${d.usuario_id ?? ''}`,
    value: Number(d.total_gastado ?? 0),
  }));

  return {
    resumen: resumen.status === 'fulfilled' ? resumen.value : null,
    monthlyChart,
    topChart,
    bySpaceChart,
    byUserChart,
  };
}

export default async function DashboardPage() {
  const user = await getUserFromCookies();
  if (user?.role !== 'Admin') redirect('/spaces');

  const { resumen, monthlyChart, topChart, bySpaceChart, byUserChart } = await getAdminData();

  const totalRevenue = resumen?.total_ingresos ?? 0;
  const totalInvoices = resumen?.total_facturas ?? 0;
  const pending = resumen?.pendientes_pago ?? 0;
  const paid = totalInvoices - pending;
  const avgInvoice = resumen?.promedio_factura ?? 0;

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Ingresos Totales" value={`$${Number(totalRevenue).toFixed(2)}`} accentColor="#0d9488" />
        <KpiCard label="Facturas" value={totalInvoices} accentColor="#2563eb" />
        <KpiCard label="Pendientes" value={pending} accentColor="#ca8a04" />
        <KpiCard label="Pagadas" value={paid} accentColor="#16a34a" />
        <KpiCard label="Factura Promedio" value={`$${Number(avgInvoice).toFixed(2)}`} accentColor="#0f766e" />
      </div>
      <DashboardCharts monthlyData={monthlyChart} topSpaces={topChart} />
      <ReportCharts bySpace={bySpaceChart} byUser={byUserChart} />
    </div>
  );
}
