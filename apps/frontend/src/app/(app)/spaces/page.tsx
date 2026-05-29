import type { Metadata } from 'next';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import SpaceCard from '@/components/SpaceCard';
import SpaceFormModal from '@/components/SpaceFormModal';
import type { Espacio } from '@/types';

export const metadata: Metadata = { title: 'Inventario de Espacios — NEXUS Cowork' };

const ESTADOS = ['disponible', 'reservada', 'ocupada', 'mantenimiento'];
const inputCls =
  'px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] bg-white focus:outline-none focus:border-[#0d9488] transition-colors';

interface SpacesPageProps {
  searchParams: Promise<{ search?: string; status?: string; capacidad?: string }>
}

export default async function SpacesPage({ searchParams }: SpacesPageProps) {
  const user = await getUserFromCookies();
  const isAdmin = user?.role === 'Admin';
  const { search = '', status = '', capacidad = '' } = await searchParams;

  const params = new URLSearchParams({ page: '1', limit: '50' });
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (capacidad) params.set('capacidad', capacidad);

  let espacios: Espacio[] = [];
  try {
    const res = await apiGet(`/api/spaces/espacios?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      espacios = Array.isArray(data.espacios) ? data.espacios : Array.isArray(data) ? data : [];
    }
  } catch {
    // show empty state
  }

  return (
    <div>
      <PageHeader title="Inventario de Espacios">
        {isAdmin && <SpaceFormModal mode="create" />}
      </PageHeader>

      {/* Filtros */}
      <form
        method="get"
        className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 mb-6 flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">Buscar</label>
          <input
            name="search"
            type="text"
            defaultValue={search}
            placeholder="Nombre o descripción…"
            className={`${inputCls} w-full`}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">Estado</label>
          <select name="status" defaultValue={status} className={`${inputCls} w-[170px]`}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1e293b] mb-1.5">Capacidad mín.</label>
          <input
            name="capacidad"
            type="number"
            min={1}
            defaultValue={capacidad}
            placeholder="0"
            className={`${inputCls} w-[130px]`}
          />
        </div>
        <button
          type="submit"
          className="bg-[#0d9488] text-white text-sm font-medium px-5 py-[10px] rounded-[8px] hover:bg-[#0f766e] transition-colors"
        >
          Filtrar
        </button>
      </form>

      {espacios.length === 0 ? (
        <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
          <EmptyState
            title="No hay espacios"
            description={
              isAdmin
                ? 'Crea tu primer espacio con el botón “Nuevo Espacio”.'
                : 'Aún no hay espacios disponibles en el catálogo.'
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {espacios.map((espacio) => (
            <SpaceCard key={espacio.id} espacio={espacio} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
