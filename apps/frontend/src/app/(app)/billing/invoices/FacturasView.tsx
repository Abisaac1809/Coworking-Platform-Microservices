'use client';

import { useState, useMemo } from 'react';
import Badge from '@/components/Badge';
import PayButton from './PayButton';
import type { Factura } from '@/types';

const PAGE_SIZE = 10;

type FiltroEstado = 'pendiente' | 'pagada' | 'todas';

interface Props {
  facturas: Factura[];
  espaciosMap: Record<number, string>;
  usuariosMap: Record<number, string>;
  isAdmin: boolean;
}

function buildPageList(current: number, total: number): (number | '...')[] {
  const result: (number | '...')[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) result.push(p);
    else if (result[result.length - 1] !== '...') result.push('...');
  }
  return result;
}

const fmt$ = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

function matchEstado(f: Factura, filtro: FiltroEstado): boolean {
  if (filtro === 'todas') return true;
  if (filtro === 'pendiente') return !/pagad|cancel/i.test(f.estado ?? '');
  if (filtro === 'pagada') return /pagad/i.test(f.estado ?? '');
  return true;
}

const btnCls =
  'inline-flex items-center justify-center px-3 py-[5px] text-[12px] rounded-[6px] border transition-colors';

export default function FacturasView({ facturas, espaciosMap, usuariosMap, isAdmin }: Props) {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('pendiente');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  // KPI data always from full unfiltered set
  const kpis = useMemo(() => {
    const pendientes = facturas.filter((f) => !/pagad|cancel/i.test(f.estado ?? ''));
    const pagadas = facturas.filter((f) => /pagad/i.test(f.estado ?? ''));
    return {
      total: facturas.length,
      pendientesCount: pendientes.length,
      pendientesMonto: pendientes.reduce((s, f) => s + Number(f.total), 0),
      pagadasCount: pagadas.length,
      pagadasMonto: pagadas.reduce((s, f) => s + Number(f.total), 0),
    };
  }, [facturas]);

  const filtrados = useMemo(() => {
    return facturas.filter((f) => {
      if (!matchEstado(f, filtroEstado)) return false;
      if (isAdmin && busqueda.trim()) {
        const nombre = (usuariosMap[f.usuario_id ?? -1] ?? '').toLowerCase();
        if (!nombre.includes(busqueda.toLowerCase().trim())) return false;
      }
      return true;
    });
  }, [facturas, filtroEstado, busqueda, isAdmin, usuariosMap]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginados = useMemo(
    () => filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE),
    [filtrados, pagina],
  );

  function setFiltro(f: FiltroEstado) {
    setFiltroEstado(f);
    setPagina(1);
  }

  const tabs: { key: FiltroEstado; label: string; count: number }[] = [
    { key: 'pendiente', label: 'Pendientes', count: kpis.pendientesCount },
    { key: 'pagada', label: 'Pagadas', count: kpis.pagadasCount },
    { key: 'todas', label: 'Todas', count: kpis.total },
  ];

  const columns = isAdmin
    ? ['Espacio', 'Usuario', 'Periodo', 'Horas', 'Subtotal', 'Impuesto', 'Total', 'Estado', 'Acción']
    : ['Espacio', 'Periodo', 'Horas', 'Subtotal', 'Impuesto', 'Total', 'Estado'];

  return (
    <>
      {/* KPI cards — admin only */}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4">
            <p className="text-[12px] font-medium text-[#64748b] uppercase tracking-[0.05em] mb-1">Total facturas</p>
            <p className="text-[24px] font-bold text-[#1e293b]">{kpis.total}</p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4" style={{ borderLeft: '3px solid #ca8a04' }}>
            <p className="text-[12px] font-medium text-[#64748b] uppercase tracking-[0.05em] mb-1">Pendientes</p>
            <p className="text-[24px] font-bold text-[#1e293b]">{kpis.pendientesCount}</p>
            <p className="text-[12px] text-[#94a3b8] mt-0.5">{fmt$(kpis.pendientesMonto)}</p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4" style={{ borderLeft: '3px solid #0d9488' }}>
            <p className="text-[12px] font-medium text-[#64748b] uppercase tracking-[0.05em] mb-1">Pagadas</p>
            <p className="text-[24px] font-bold text-[#1e293b]">{kpis.pagadasCount}</p>
            <p className="text-[12px] text-[#94a3b8] mt-0.5">{fmt$(kpis.pagadasMonto)}</p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4" style={{ borderLeft: '3px solid #0d9488' }}>
            <p className="text-[12px] font-medium text-[#64748b] uppercase tracking-[0.05em] mb-1">Recaudado</p>
            <p className="text-[20px] font-bold text-[#0d9488]">{fmt$(kpis.pagadasMonto)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          {/* Estado tabs */}
          <div className="inline-flex bg-[#e2e8f0] rounded-[10px] p-1 gap-0.5">
            {tabs.map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFiltro(key)}
                className={[
                  'flex items-center gap-1.5 px-3 py-[6px] rounded-[8px] text-[12px] font-medium transition-all',
                  filtroEstado === key
                    ? 'bg-white text-[#0d9488] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                    : 'text-[#64748b] hover:text-[#1e293b]',
                ].join(' ')}
              >
                {label}
                <span className={[
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold',
                  filtroEstado === key ? 'bg-[#ccfbf1] text-[#0d9488]' : 'bg-[#f1f5f9] text-[#94a3b8]',
                ].join(' ')}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Search — admin only */}
          {isAdmin && (
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
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                className="pl-8 pr-3 py-[7px] border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#1e293b] bg-white placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors w-44"
              />
            </div>
          )}

          <span className="ml-auto text-[12px] text-[#94a3b8]">
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        {paginados.length === 0 ? (
          <div className="px-6 py-12 text-center text-[13px] text-[#94a3b8]">
            Sin facturas para los filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc]">
                  {columns.map((h) => (
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
                {paginados.map((f) => {
                  const start = new Date(f.fecha_inicio).toLocaleDateString('es-MX');
                  const end = new Date(f.fecha_fin).toLocaleDateString('es-MX');
                  return (
                    <tr key={f.id} className="hover:bg-[#fafbfc] border-b border-[#e2e8f0] last:border-0">
                      <td className="px-4 py-3 text-[#64748b]">
                        {espaciosMap[f.espacio_id] ?? `Espacio #${f.espacio_id}`}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-[#64748b]">
                          {usuariosMap[f.usuario_id ?? -1] ?? `Usuario #${f.usuario_id}`}
                        </td>
                      )}
                      <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">{start} – {end}</td>
                      <td className="px-4 py-3 text-[#64748b]">{f.horas}h</td>
                      <td className="px-4 py-3 text-[#64748b]">{fmt$(Number(f.subtotal))}</td>
                      <td className="px-4 py-3 text-[#64748b]">{fmt$(Number(f.impuesto))}</td>
                      <td className="px-4 py-3 font-semibold text-[#115e59]">{fmt$(Number(f.total))}</td>
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

        {/* Pagination */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
            <span className="text-[12px] text-[#94a3b8]">Página {pagina} de {totalPaginas}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => p - 1)}
                className={`${btnCls} border-[#e2e8f0] text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488] disabled:text-[#cbd5e1] disabled:cursor-not-allowed`}
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
                      'inline-flex items-center justify-center w-8 h-8 text-[12px] rounded-[6px] border transition-colors',
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
                className={`${btnCls} border-[#e2e8f0] text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488] disabled:text-[#cbd5e1] disabled:cursor-not-allowed`}
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
