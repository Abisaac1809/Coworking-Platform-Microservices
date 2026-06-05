'use client';

import { useActionState, useEffect } from 'react';
import { cobrarReservaAction, type BillingState } from '@/app/actions/billing';
import type { Reserva } from '@/types';

interface Props {
  reserva: Reserva;
  espacioNombre: string;
  precioPorHora: number;
  usuarioNombre: string;
  onClose: () => void;
}

const init: BillingState = { error: null };

function fmtDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

function calcHoras(inicio: string, fin: string): number {
  const ms = new Date(fin).getTime() - new Date(inicio).getTime();
  return Math.max(0, ms / 3_600_000);
}

export default function CobrarModal({
  reserva,
  espacioNombre,
  precioPorHora,
  usuarioNombre,
  onClose,
}: Props) {
  const [state, action, pending] = useActionState(cobrarReservaAction, init);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !pending) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, pending]);

  const horas = calcHoras(reserva.fechaInicio, reserva.fechaFin);
  const subtotal = horas * precioPorHora;
  const impuesto = subtotal * 0.16;
  const total = subtotal + impuesto;

  const fmt$ = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={() => { if (!pending) onClose(); }}
    >
      <div
        className="bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.14)] w-full overflow-hidden"
        style={{ maxWidth: 440, animation: 'slideUp 0.22s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1e293b]">Cobrar reserva</h2>
            <p className="text-[12px] text-[#94a3b8] mt-0.5">Crea la factura y regístrala como pagada</p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#1e293b] transition-colors disabled:opacity-40"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {state.success ? (
          /* ── Success state ── */
          <div className="px-6 py-8 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#dcfce7] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#16a34a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-[#1e293b]">Cobro registrado</p>
            <p className="text-[13px] text-[#64748b]">
              Factura creada y marcada como pagada por {fmt$(total)}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium text-[13px] py-[9px] rounded-[8px] transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* ── Confirm form ── */
          <form action={action}>
            <input type="hidden" name="reservaId" value={reserva.id} />
            <input type="hidden" name="usuarioId" value={reserva.usuarioId} />
            <input type="hidden" name="espacioId" value={reserva.espacioId} />
            <input type="hidden" name="fechaInicio" value={reserva.fechaInicio} />
            <input type="hidden" name="fechaFin" value={reserva.fechaFin} />
            <input type="hidden" name="precioHora" value={precioPorHora} />

            {/* Detail rows */}
            <dl className="px-6 pt-4 pb-2 space-y-2.5">
              {[
                { label: 'Espacio', value: espacioNombre },
                { label: 'Usuario', value: usuarioNombre },
                { label: 'Inicio', value: fmtDate(reserva.fechaInicio) },
                { label: 'Fin', value: fmtDate(reserva.fechaFin) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <dt className="w-16 flex-shrink-0 text-[12px] font-medium text-[#64748b]">{label}</dt>
                  <dd className="text-[13px] text-[#1e293b]">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Invoice breakdown */}
            <div className="mx-6 mt-2 mb-4 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] divide-y divide-[#e2e8f0]">
              {[
                { label: `${horas.toFixed(1)}h × ${fmt$(precioPorHora)}/h`, value: fmt$(subtotal) },
                { label: 'Impuesto (16 %)', value: fmt$(impuesto) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                  <span className="text-[#64748b]">{label}</span>
                  <span className="text-[#1e293b]">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[13px] font-semibold text-[#1e293b]">Total</span>
                <span className="text-[15px] font-bold text-[#0d9488]">{fmt$(total)}</span>
              </div>
            </div>

            {state.error && (
              <p className="mx-6 mb-3 text-[12px] text-[#dc2626] bg-[#fee2e2] px-3 py-2 rounded-[6px]">
                {state.error}
              </p>
            )}

            <div className="px-6 pb-5 flex gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={onClose}
                className="flex-1 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b] font-medium text-[13px] py-[9px] rounded-[8px] transition-colors disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-[13px] py-[9px] rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? 'Procesando…' : `Cobrar ${fmt$(total)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
