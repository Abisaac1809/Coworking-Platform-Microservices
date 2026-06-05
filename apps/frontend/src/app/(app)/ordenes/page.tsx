import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import { getEspaciosMap, getUsuariosMap } from '@/lib/lookups';
import PageHeader from '@/components/PageHeader';
import KpiCard from '@/components/KpiCard';
import EmptyState from '@/components/EmptyState';
import ConfirmNextButton from './ConfirmNextButton';
import CancelReservaButton from '../reservations/CancelReservaButton';
import OrdenesTabla from './OrdenesTabla';
import type { ColaResponse, ElementoCola } from '@/types';

export const metadata: Metadata = { title: 'Órdenes Pendientes — NEXUS Cowork' };

const idDe = (e: ElementoCola) => e.id ?? e.reservaId ?? e.reserva_id;
const espacioDe = (e: ElementoCola) => e.espacioId ?? e.espacio_id;
const inicioDe = (e: ElementoCola) => e.fechaInicio ?? e.fecha_inicio ?? '';

function fmt(date: string) {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

export default async function OrdenesPage() {
  const user = await getUserFromCookies();
  if (user?.role !== 'Admin') redirect('/dashboard');

  let cola: ColaResponse = { totalEnEspera: 0, siguienteEnCola: null, listaOrdenada: [] };
  const [, espacios, usuarios] = await Promise.all([
    (async () => {
      try {
        const res = await apiGet('/api/reservations/cola');
        if (res.ok) {
          const data = await res.json();
          cola = {
            totalEnEspera: data.totalEnEspera ?? data.listaOrdenada?.length ?? 0,
            siguienteEnCola: data.siguienteEnCola ?? null,
            listaOrdenada: Array.isArray(data.listaOrdenada) ? data.listaOrdenada : [],
          };
        }
      } catch {
        // show empty state
      }
    })(),
    getEspaciosMap(),
    getUsuariosMap(),
  ]);

  const espaciosMap: Record<number, string> = Object.fromEntries(espacios.entries());
  const usuariosMap: Record<number, string> = Object.fromEntries(usuarios.entries());

  const nombreEspacio = (id: number | undefined) =>
    id != null ? espacios.get(id) ?? `Espacio #${id}` : '—';

  const next = cola.siguienteEnCola;
  const empty = cola.listaOrdenada.length === 0 && !next;

  return (
    <div>
      <PageHeader title="Órdenes Pendientes" />

      <p className="text-[14px] text-[#64748b] -mt-3 mb-6">
        Las reservas que requieren aprobación manual se ordenan por proximidad de inicio. Solo
        puede confirmarse la <strong className="font-semibold text-[#1e293b]">siguiente</strong> en
        la cola (la más próxima a comenzar).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <KpiCard label="En Espera" value={cola.totalEnEspera} accentColor="#ca8a04" />

        <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-[#64748b] mb-1">Siguiente en cola</p>
            {next ? (
              <p className="text-[15px] text-[#1e293b]">
                {espacioDe(next) != null && nombreEspacio(espacioDe(next))}
                <span className="block text-[13px] text-[#64748b] mt-0.5">
                  Inicia: {fmt(inicioDe(next))}
                </span>
              </p>
            ) : (
              <p className="text-[14px] text-[#94a3b8]">No hay reservas en espera.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ConfirmNextButton disabled={empty} />
            {next && idDe(next) != null && <CancelReservaButton id={idDe(next)!} />}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {empty ? (
          <div className="p-6">
            <EmptyState
              title="No hay órdenes pendientes"
              description="Cuando un usuario solicite un espacio que requiere verificación manual, aparecerá aquí."
            />
          </div>
        ) : (
          <OrdenesTabla
            items={cola.listaOrdenada}
            espaciosMap={espaciosMap}
            usuariosMap={usuariosMap}
          />
        )}
      </div>
    </div>
  );
}
