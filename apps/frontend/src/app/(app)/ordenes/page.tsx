import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import KpiCard from '@/components/KpiCard';
import EmptyState from '@/components/EmptyState';
import ConfirmNextButton from './ConfirmNextButton';
import type { ColaResponse, ElementoCola } from '@/types';

export const metadata: Metadata = { title: 'Órdenes Pendientes — NEXUS Cowork' };

const espacioDe = (e: ElementoCola) => e.espacioId ?? e.espacio_id;
const usuarioDe = (e: ElementoCola) => e.usuarioId ?? e.usuario_id;
const inicioDe = (e: ElementoCola) => e.fechaInicio ?? e.fecha_inicio ?? '';

function fmt(date: string) {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? date : d.toLocaleString();
}

export default async function OrdenesPage() {
  const user = await getUserFromCookies();
  if (user?.role !== 'Admin') redirect('/dashboard');

  let cola: ColaResponse = { totalEnEspera: 0, siguienteEnCola: null, listaOrdenada: [] };
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
                Reserva <span className="font-semibold">#{next.id}</span>
                {espacioDe(next) != null && <> · Espacio #{espacioDe(next)}</>}
                <span className="block text-[13px] text-[#64748b] mt-0.5">
                  Inicia: {fmt(inicioDe(next))}
                </span>
              </p>
            ) : (
              <p className="text-[14px] text-[#94a3b8]">No hay reservas en espera.</p>
            )}
          </div>
          <ConfirmNextButton disabled={empty} />
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc]">
                  {['#', 'ID Reserva', 'Espacio', 'Usuario', 'Fecha de inicio'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[12px] font-semibold text-[#64748b] uppercase tracking-[0.05em] whitespace-nowrap border-b border-[#e2e8f0]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cola.listaOrdenada.map((e, i) => (
                  <tr
                    key={e.id}
                    className={`border-b border-[#e2e8f0] last:border-0 ${i === 0 ? 'bg-[#f0fdfa]' : 'hover:bg-[#fafbfc]'}`}
                  >
                    <td className="px-4 py-3 text-[#94a3b8]">{i + 1}</td>
                    <td className="px-4 py-3 text-[#1e293b] font-medium">#{e.id}</td>
                    <td className="px-4 py-3 text-[#64748b]">{espacioDe(e) != null ? `Espacio #${espacioDe(e)}` : '—'}</td>
                    <td className="px-4 py-3 text-[#64748b]">{usuarioDe(e) != null ? `Usuario #${usuarioDe(e)}` : '—'}</td>
                    <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">{fmt(inicioDe(e))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
