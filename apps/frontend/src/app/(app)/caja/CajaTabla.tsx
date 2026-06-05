'use client';

import { useState, useMemo } from 'react';
import Badge from '@/components/Badge';
import PayButton from '../billing/invoices/PayButton';
import type { Factura } from '@/types';

const PAGE_SIZE = 10;

interface Props {
  facturas: Factura[];
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

const btnCls =
  'inline-flex items-center justify-center px-3 py-[5px] text-[12px] rounded-[6px] border transition-colors';

export default function CajaTabla({ facturas, espaciosMap, usuariosMap }: Props) {
  const [pagina, setPagina] = useState(1);

  const totalPaginas = Math.max(1, Math.ceil(facturas.length / PAGE_SIZE));
  const paginados = useMemo(
    () => facturas.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE),
    [facturas, pagina],
  );

  const nombreEspacio = (id: number) => espaciosMap[id] ?? `Espacio #${id}`;
  const nombreUsuario = (id: number | undefined) =>
    id != null ? usuariosMap[id] ?? `Usuario #${id}` : '—';

  if (facturas.length === 0) return null;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8fafc]">
              {['Espacio', 'Usuario', 'Periodo', 'Horas', 'Total', 'Estado', 'Acción'].map((h) => (
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
                <tr
                  key={f.id}
                  className="hover:bg-[#fafbfc] border-b border-[#e2e8f0] last:border-0"
                >
                  <td className="px-4 py-3 text-[#64748b]">{nombreEspacio(f.espacio_id)}</td>
                  <td className="px-4 py-3 text-[#64748b]">{nombreUsuario(f.usuario_id)}</td>
                  <td className="px-4 py-3 text-[#64748b] whitespace-nowrap">
                    {start} – {end}
                  </td>
                  <td className="px-4 py-3 text-[#64748b]">{f.horas}h</td>
                  <td className="px-4 py-3 font-semibold text-[#115e59]">
                    ${Number(f.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={f.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <PayButton id={f.id} />
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
