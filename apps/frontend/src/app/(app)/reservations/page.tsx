import type { Metadata } from 'next';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import { getEspaciosMap } from '@/lib/lookups';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import PaginationBar from '@/components/PaginationBar';
import CancelReservaButton from './CancelReservaButton';
import NuevaReservaModal from './NuevaReservaModal';
import ReservationsAdminClient from './ReservationsAdminClient';
import type { Reserva, ReservaListResponse, Espacio, EspaciosResponse, UserData } from '@/types';

export const metadata: Metadata = { title: 'Reservas — NEXUS Cowork' };

const PAGE_SIZE = 10;

function fmt(date: string) {
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function ReservationsPage({ searchParams }: Props) {
  const user = await getUserFromCookies();
  const isAdmin = user?.role === 'Admin';

  let reservas: Reserva[] = [];
  let fetchError = false;

  if (isAdmin) {
    // ── Admin path: fetch 300 reservas + full spaces + users for the rich UI ──
    let espacios: Espacio[] = [];
    let usuarios: { id: number; name: string }[] = [];

    await Promise.all([
      (async () => {
        try {
          const res = await apiGet('/api/reservations/reservas?page=1&limit=300');
          if (res.ok) {
            const data: ReservaListResponse = await res.json();
            reservas = Array.isArray(data.reservas) ? data.reservas : [];
          } else {
            fetchError = true;
          }
        } catch {
          fetchError = true;
        }
      })(),
      (async () => {
        try {
          const res = await apiGet('/api/spaces/espacios?page=1&limit=100');
          if (res.ok) {
            const data: EspaciosResponse = await res.json();
            espacios = Array.isArray(data.espacios) ? data.espacios : [];
          }
        } catch {
          // falls back to "Espacio #id"
        }
      })(),
      (async () => {
        try {
          const res = await apiGet('/api/auth/users');
          if (res.ok) {
            const data: UserData[] = await res.json();
            usuarios = Array.isArray(data) ? data.map((u) => ({ id: u.id, name: u.name })) : [];
          }
        } catch {
          // falls back to "Usuario #id"
        }
      })(),
    ]);

    return (
      <div>
        <PageHeader title="Todas las Reservas" />
        <ReservationsAdminClient
          reservas={reservas}
          espacios={espacios}
          usuarios={usuarios}
          fetchError={fetchError}
        />
      </div>
    );
  }

  // ── User path: paginated server-rendered table ───────────────────────────
  const { page = '1' } = await searchParams;
  const pageNum = Math.max(1, parseInt(page) || 1);

  const [espacios] = await Promise.all([
    getEspaciosMap(),
    (async () => {
      try {
        const res = await apiGet(
          `/api/reservations/reservas/mis-reservas?page=${pageNum}&limit=${PAGE_SIZE}&sort_order=desc`,
        );
        if (res.ok) {
          const data: ReservaListResponse = await res.json();
          reservas = Array.isArray(data.reservas) ? data.reservas : [];
        } else {
          fetchError = true;
        }
      } catch {
        fetchError = true;
      }
    })(),
  ]);

  const nombreEspacio = (id: number) => espacios.get(id) ?? `Espacio #${id}`;
  const hasNext = reservas.length >= PAGE_SIZE;

  return (
    <div>
      <PageHeader title="Mis Reservas"><NuevaReservaModal /></PageHeader>

      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {fetchError ? (
          <div className="p-6">
            <EmptyState
              title="No se pudo cargar las reservas"
              description="Verifica que el servicio de reservas esté activo e intenta de nuevo."
            />
          </div>
        ) : reservas.length === 0 && pageNum === 1 ? (
          <div className="p-6">
            <EmptyState
              title="No tienes reservas aún"
              description='Haz clic en "Nueva Reserva" para reservar un espacio.'
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc]">
                    {['Espacio', 'Inicio', 'Fin', 'Estado', 'Notas', 'Acciones'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[12px] font-semibold text-[#64748b] uppercase tracking-[0.05em] whitespace-nowrap border-b border-[#e2e8f0]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#fafbfc]"
                    >
                      <td className="px-4 py-3 text-[#64748b]">{nombreEspacio(r.espacioId)}</td>
                      <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">
                        {fmt(r.fechaInicio)}
                      </td>
                      <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">
                        {fmt(r.fechaFin)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={r.estado} />
                      </td>
                      <td className="px-4 py-3 text-[#64748b] max-w-[200px] truncate">
                        {r.notas ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {r.estado !== 'CANCELADA' ? (
                          <CancelReservaButton id={r.id} />
                        ) : (
                          <span className="text-[12px] text-[#94a3b8]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationBar page={pageNum} hasNext={hasNext} />
          </>
        )}
      </div>
    </div>
  );
}
