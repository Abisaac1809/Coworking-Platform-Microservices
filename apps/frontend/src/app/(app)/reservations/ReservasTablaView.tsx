'use client';

import { useState, useMemo } from 'react';
import Badge from '@/components/Badge';
import EmptyState from '@/components/EmptyState';
import CancelReservaButton from './CancelReservaButton';
import CobrarModal from './CobrarModal';
import type { Reserva, Espacio } from '@/types';
import type { UsuarioEntry } from './ReservationsAdminClient';

const PAGE_SIZE = 15;

interface Props {
  reservas: Reserva[];
  espacios: Espacio[];
  usuarios: UsuarioEntry[];
}

function fmt(date: string) {
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildPageList(current: number, total: number): (number | '...')[] {
  const result: (number | '...')[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) result.push(p);
    else if (result[result.length - 1] !== '...') result.push('...');
  }
  return result;
}

const inputCls =
  'px-3 py-[7px] border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#1e293b] bg-white focus:outline-none focus:border-[#0d9488] transition-colors';

export default function ReservasTablaView({ reservas, espacios, usuarios }: Props) {
  const today = toDateStr(new Date());
  const [filtroFecha, setFiltroFecha] = useState(today);
  const [filtroEspacioId, setFiltroEspacioId] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cobrarReserva, setCobrarReserva] = useState<Reserva | null>(null);

  const espaciosMap = useMemo(() => new Map(espacios.map((e) => [e.id, e])), [espacios]);
  const usuariosMap = useMemo(() => new Map(usuarios.map((u) => [u.id, u.name])), [usuarios]);

  // IDs de usuarios cuyo nombre coincide con la búsqueda
  const usuarioIdsFiltrados = useMemo(() => {
    const q = busquedaUsuario.toLowerCase().trim();
    if (!q) return null;
    return new Set(
      usuarios
        .filter((u) => u.name.toLowerCase().includes(q))
        .map((u) => u.id),
    );
  }, [busquedaUsuario, usuarios]);

  const filtrados = useMemo(() => {
    return reservas.filter((r) => {
      if (filtroFecha && !r.fechaInicio.startsWith(filtroFecha)) return false;
      if (filtroEspacioId && r.espacioId !== Number(filtroEspacioId)) return false;
      if (filtroEstado && r.estado !== filtroEstado) return false;
      if (usuarioIdsFiltrados && !usuarioIdsFiltrados.has(r.usuarioId)) return false;
      return true;
    });
  }, [reservas, filtroFecha, filtroEspacioId, filtroEstado, usuarioIdsFiltrados]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginados = filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  function change<T extends string>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setPagina(1); };
  }

  function limpiar() {
    setFiltroFecha(today);
    setFiltroEspacioId('');
    setFiltroEstado('');
    setBusquedaUsuario('');
    setPagina(1);
  }

  const cobrarEspacio = cobrarReserva ? espaciosMap.get(cobrarReserva.espacioId) : null;

  return (
    <>
      {cobrarReserva && cobrarEspacio && (
        <CobrarModal
          reserva={cobrarReserva}
          espacioNombre={cobrarEspacio.nombre}
          precioPorHora={Number(cobrarEspacio.precio_por_hora)}
          usuarioNombre={usuariosMap.get(cobrarReserva.usuarioId) ?? `Usuario #${cobrarReserva.usuarioId}`}
          onClose={() => setCobrarReserva(null)}
        />
      )}

      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          {/* Search by user */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar usuario…"
              value={busquedaUsuario}
              onChange={(e) => { setBusquedaUsuario(e.target.value); setPagina(1); }}
              className={`${inputCls} pl-8 w-40`}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[12px] font-medium text-[#64748b]">Fecha</label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => change(setFiltroFecha)(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[12px] font-medium text-[#64748b]">Espacio</label>
            <select
              value={filtroEspacioId}
              onChange={(e) => change(setFiltroEspacioId)(e.target.value)}
              className={inputCls}
            >
              <option value="">Todos</option>
              {espacios.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[12px] font-medium text-[#64748b]">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => change(setFiltroEstado)(e.target.value)}
              className={inputCls}
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={limpiar}
              className="text-[12px] text-[#64748b] hover:text-[#0d9488] transition-colors"
            >
              Limpiar
            </button>
            <span className="text-[12px] text-[#94a3b8]">
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {paginados.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Sin reservas"
              description="No hay reservas que coincidan con los filtros aplicados."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc]">
                  {['Espacio', 'Usuario', 'Inicio', 'Fin', 'Estado', 'Notas', 'Acciones'].map((h) => (
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
                {paginados.map((r) => {
                  const espacio = espaciosMap.get(r.espacioId);
                  return (
                    <tr key={r.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#fafbfc]">
                      <td className="px-4 py-3 text-[#64748b] text-[13px]">
                        {espacio?.nombre ?? `Espacio #${r.espacioId}`}
                      </td>
                      <td className="px-4 py-3 text-[#64748b] text-[13px]">
                        {usuariosMap.get(r.usuarioId) ?? `Usuario #${r.usuarioId}`}
                      </td>
                      <td className="px-4 py-3 text-[#64748b] text-[13px] whitespace-nowrap">
                        {fmt(r.fechaInicio)}
                      </td>
                      <td className="px-4 py-3 text-[#64748b] text-[13px] whitespace-nowrap">
                        {fmt(r.fechaFin)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={r.estado} />
                      </td>
                      <td className="px-4 py-3 text-[#64748b] text-[13px] max-w-[160px] truncate">
                        {r.notas ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {r.estado === 'CANCELADA' ? (
                          <span className="text-[12px] text-[#94a3b8]">—</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {r.estado === 'CONFIRMADA' && espacio && (
                              <button
                                type="button"
                                onClick={() => setCobrarReserva(r)}
                                className="text-[12px] font-medium px-3 py-1.5 rounded-[6px] bg-[#0d9488] text-white hover:bg-[#0f766e] transition-colors"
                              >
                                Cobrar
                              </button>
                            )}
                            <CancelReservaButton id={r.id} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
            <span className="text-[12px] text-[#94a3b8]">
              Página {pagina} de {totalPaginas}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => p - 1)}
                className="px-3 py-[5px] text-[12px] rounded-[6px] border border-[#e2e8f0] text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              {buildPageList(pagina, totalPaginas).map((item, idx) =>
                item === '...' ? (
                  <span key={`dots-${idx}`} className="text-[#94a3b8] px-1 text-[13px]">…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPagina(item)}
                    className={[
                      'w-8 h-8 text-[12px] rounded-[6px] border transition-colors',
                      item === pagina
                        ? 'bg-[#0d9488] text-white border-[#0d9488]'
                        : 'border-[#e2e8f0] text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488]',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                type="button"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
                className="px-3 py-[5px] text-[12px] rounded-[6px] border border-[#e2e8f0] text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
