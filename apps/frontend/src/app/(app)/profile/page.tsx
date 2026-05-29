import type { Metadata } from 'next';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import KpiCard from '@/components/KpiCard';
import Badge from '@/components/Badge';
import EditProfileModal from './EditProfileModal';
import type { UserData, Factura } from '@/types';

export const metadata: Metadata = { title: 'Perfil — NEXUS Cowork' };

async function getAdminKpis() {
  try {
    const res = await apiGet('/api/billing/reportes/resumen');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getUserKpis() {
  try {
    const res = await apiGet('/api/billing/facturas/mis-facturas?page=1&limit=100');
    if (!res.ok) return { total: 0, spent: 0 };
    const data = await res.json().catch(() => ({ facturas: [] }));
    const facturas: Factura[] = Array.isArray(data.facturas) ? data.facturas : [];
    const spent = facturas.reduce((s, f) => s + (Number(f.total) || 0), 0);
    return { total: data.total ?? facturas.length, spent };
  } catch {
    return { total: 0, spent: 0 };
  }
}

export default async function ProfilePage() {
  const sessionUser = await getUserFromCookies();
  const isAdmin = sessionUser?.role === 'Admin';

  let userData: UserData | null = null;
  try {
    const res = await apiGet('/api/auth/users/me');
    if (res.ok) userData = await res.json();
  } catch {
    // fall back to cookie data
  }

  const user = userData ?? {
    id: sessionUser?.id ?? 0,
    name: sessionUser?.name ?? '',
    email: sessionUser?.email ?? '',
    phone: '',
    role: sessionUser?.role ?? 'User',
  };

  const initials = user.name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div>
      <PageHeader title="Mi Perfil" />

      {/* Profile card */}
      <div className="relative bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 flex flex-col items-center text-center mb-6">
        <EditProfileModal
          name={user.name}
          email={user.email}
          phone={user.phone || '+58 300-0000000'}
          role={user.role}
        />
        <div className="w-20 h-20 rounded-full bg-[#0d9488] flex items-center justify-center text-white text-[28px] font-bold mb-4">
          {initials || '?'}
        </div>
        <p className="text-[18px] font-bold text-[#1e293b] mb-1">{user.name}</p>
        <p className="text-[14px] text-[#64748b] mb-3">{user.email}</p>
        <Badge status={user.role} />
        {user.created_at && (
          <p className="text-[12px] text-[#94a3b8] mt-4">
            Miembro desde {new Date(user.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      {/* KPIs */}
      {isAdmin ? (
        <AdminKpis />
      ) : (
        <UserKpis />
      )}
    </div>
  );
}

async function AdminKpis() {
  const resumen = await getAdminKpis();
  const totalRevenue = resumen?.total_ingresos ?? resumen?.total_revenue ?? 0;
  const totalInvoices = resumen?.total_facturas ?? resumen?.total_invoices ?? 0;
  const pending = resumen?.pendientes ?? resumen?.pending ?? resumen?.pendientes_pago ?? 0;
  const paid = resumen?.pagadas ?? resumen?.paid ?? 0;
  const avgInvoice = resumen?.promedio_factura ?? (totalInvoices > 0 ? Number(totalRevenue) / Number(totalInvoices) : 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Ingresos Totales" value={`$${Number(totalRevenue).toFixed(2)}`} accentColor="#0d9488" />
      <KpiCard label="Facturas" value={totalInvoices} accentColor="#2563eb" />
      <KpiCard label="Pendientes" value={pending} accentColor="#ca8a04" />
      <KpiCard label="Pagadas" value={paid} accentColor="#16a34a" />
      <KpiCard label="Factura Promedio" value={`$${Number(avgInvoice).toFixed(2)}`} accentColor="#0f766e" />
    </div>
  );
}

async function UserKpis() {
  const { total, spent } = await getUserKpis();

  return (
    <div className="grid grid-cols-2 gap-4">
      <KpiCard label="Mis Facturas" value={total} accentColor="#0d9488" />
      <KpiCard label="Total Gastado" value={`$${spent.toFixed(2)}`} accentColor="#2563eb" />
    </div>
  );
}
