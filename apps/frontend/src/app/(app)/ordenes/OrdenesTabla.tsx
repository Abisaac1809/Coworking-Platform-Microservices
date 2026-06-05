'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ElementoCola } from '@/types';

const PAGE_SIZE = 10;

interface Props {
  items: ElementoCola[];
  espaciosMap: Record<number, string>;
  usuariosMap: Record<number, string>;
}

function buildPageList(current: number, total: number): (number | '...')[] {
  const result: (number | '...')[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) result.push(p);
    else if (result[result.length - 1] !== '...') result.push('...');
  }
  return result;
}

const idDe = (e: ElementoCola) => e.id ?? e.reservaId ?? e.reserva_id;
const espacioDe = (e: ElementoCola) => e.espacioId ?? e.espacio_id;
const usuarioDe = (e: ElementoCola) => e.usuarioId ?? e.usuario_id;
const inicioDe = (e: ElementoCola) => e.fechaInicio ?? e.fecha_inicio ?? '';
const finDe = (e: ElementoCola) => e.fechaFin ?? e.fecha_fin ?? '';

function fmt(date: string) {
  if (!date) return '—';
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
}

function fmtShort(date: string) {
  if (!date) return '—';
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

const btnCls =
  'inline-flex items-center justify-center px-3 py-[5px] text-[12px] rounded-[6px] border transition-colors';

// ─── Detail modal ────────────────────────────────────────────────────────────

interface DetalleModalProps {
  item: ElementoCola;
  nombreEspacio: string;
  nombreUsuario: string;
  onClose: () => void;
}

function DetalleModal({ item, nombreEspacio, nombreUsuario, onClose }: DetalleModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const inicio = inicioDe(item);
  const fin = finDe(item);

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: 'Espacio', value: nombreEspacio },
    { label: 'Usuario', value: nombreUsuario },
    { label: 'Inicio', value: fmt(inicio) },
    { label: 'Fin', value: fin ? fmt(fin) : '—' },
    {
      label: 'Notas',
      value: item.notas ? (
        <span className="text-[#1e293b] italic">&ldquo;{item.notas}&rdquo;</span>
      ) : (
        <span className="text-[#94a3b8]">Sin notas</span>
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.14)] w-full overflow-hidden"
        style={{ maxWidth: 420, animation: 'slideUp 0.22s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1e293b]">Detalle de orden</h2>
            <p className="text-[12px] text-[#94a3b8] mt-0.5">Reserva pendiente de verificación</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#1e293b] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notice */}
        <div className="mx-6 mt-4 flex items-start gap-3 bg-[#fef9c3] border border-[#fde047] rounded-[8px] px-4 py-3">
          <svg className="w-4 h-4 text-[#ca8a04] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-[12px] text-[#92400e] leading-relaxed">
            Este espacio requiere <strong>verificación manual</strong> del administrador antes de
            que la reserva pueda confirmarse.
          </p>
        </div>

        {/* Fields */}
        <dl className="px-6 py-4 space-y-3">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <dt className="w-16 flex-shrink-0 text-[12px] font-medium text-[#64748b] pt-0.5">
                {label}
              </dt>
              <dd className="flex-1 text-[13px] text-[#1e293b]">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b] font-medium text-[13px] py-[9px] rounded-[8px] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function OrdenesTabla({ items, espaciosMap, usuariosMap }: Props) {
  const [pagina, setPagina] = useState(1);
  const [selected, setSelected] = useState<ElementoCola | null>(null);

  const totalPaginas = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paginados = useMemo(
    () => items.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE),
    [items, pagina],
  );

  const nombreEspacio = (id: number | undefined) =>
    id != null ? espaciosMap[id] ?? `Espacio #${id}` : '—';
  const nombreUsuario = (id: number | undefined) =>
    id != null ? usuariosMap[id] ?? `Usuario #${id}` : '—';

  return (
    <>
      {selected && (
        <DetalleModal
          item={selected}
          nombreEspacio={nombreEspacio(espacioDe(selected))}
          nombreUsuario={nombreUsuario(usuarioDe(selected))}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8fafc]">
              {['Espacio', 'Usuario', 'Fecha de inicio', 'Acciones'].map((h) => (
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
            {paginados.map((e, i) => {
              const globalIdx = (pagina - 1) * PAGE_SIZE + i;
              return (
                <tr
                  key={idDe(e) ?? i}
                  className={`border-b border-[#e2e8f0] last:border-0 ${
                    globalIdx === 0 ? 'bg-[#f0fdfa]' : 'hover:bg-[#fafbfc]'
                  }`}
                >
                  <td className="px-4 py-3 text-[#64748b]">{nombreEspacio(espacioDe(e))}</td>
                  <td className="px-4 py-3 text-[#64748b]">{nombreUsuario(usuarioDe(e))}</td>
                  <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">
                    {fmtShort(inicioDe(e))}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(e)}
                      className="inline-flex items-center gap-1.5 px-3 py-[5px] text-[12px] font-medium rounded-[6px] border border-[#e2e8f0] text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488] transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
    </>
  );
}
