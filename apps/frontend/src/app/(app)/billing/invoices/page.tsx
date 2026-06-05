import type { Metadata } from 'next';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import { getEspaciosMap, getUsuariosMap } from '@/lib/lookups';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import FacturasView from './FacturasView';
import type { Factura } from '@/types';

export const metadata: Metadata = { title: 'Facturas — NEXUS Cowork' };

export default async function InvoicesPage() {
  const user = await getUserFromCookies();
  const isAdmin = user?.role === 'Admin';

  const endpoint = isAdmin
    ? '/api/billing/facturas?page=1&limit=300&order=desc'
    : '/api/billing/facturas/mis-facturas?page=1&limit=100&order=desc';

  let facturas: Factura[] = [];
  let fetchError = false;

  const [, espacios, usuarios] = await Promise.all([
    (async () => {
      try {
        const res = await apiGet(endpoint);
        if (res.ok) {
          const data = await res.json();
          facturas = Array.isArray(data.facturas) ? data.facturas : Array.isArray(data) ? data : [];
        } else {
          fetchError = true;
        }
      } catch {
        fetchError = true;
      }
    })(),
    getEspaciosMap(),
    isAdmin ? getUsuariosMap() : Promise.resolve(new Map<number, string>()),
  ]);

  const espaciosMap: Record<number, string> = Object.fromEntries(espacios.entries());
  const usuariosMap: Record<number, string> = Object.fromEntries(usuarios.entries());

  return (
    <div>
      <PageHeader title={isAdmin ? 'Facturas' : 'Mis Facturas'} />

      {fetchError ? (
        <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-6">
          <EmptyState
            title="No se pudo cargar las facturas"
            description="Verifica que el servicio de facturación esté activo e intenta de nuevo."
          />
        </div>
      ) : (
        <FacturasView
          facturas={facturas}
          espaciosMap={espaciosMap}
          usuariosMap={usuariosMap}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
