'use client';

import { useState, useActionState, useEffect } from 'react';
import { createReservaAction, type ReservationActionState } from '@/app/actions/reservations';
import Modal from '@/components/Modal';
import CalendarioReservaModal from './CalendarioReservaModal';
import type { Espacio } from '@/types';

const init: ReservationActionState = { error: null };

const inputCls =
  'w-full px-[14px] py-[10px] border border-[#e2e8f0] rounded-[8px] text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors';
const labelCls = 'block text-[13px] font-medium text-[#1e293b] mb-1.5';

interface Props {
  spaces?: Espacio[]
  preselectedSpace?: Espacio
  triggerLabel?: string
  openExternally?: boolean
  onClose?: () => void
  isOpenExternal?: boolean
}

export default function NuevaReservaModal({
  spaces = [],
  preselectedSpace,
  triggerLabel = 'Nueva Reserva',
  openExternally = false,
  onClose,
  isOpenExternal = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openExternally ? isOpenExternal : internalOpen;
  const setOpen = openExternally ? (val: boolean) => { if (!val) onClose?.(); } : setInternalOpen;
  const [state, action, pending] = useActionState(createReservaAction, init);

  const [showCalendario, setShowCalendario] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState(preselectedSpace?.id ?? 0);

  useEffect(() => {
    if (state.success) setOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <>
      {!openExternally && (
        <button
          onClick={() => setInternalOpen(true)}
          className="flex items-center gap-2 bg-[#0d9488] text-white text-sm font-medium px-5 py-[10px] rounded-[8px] hover:bg-[#0f766e] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {triggerLabel}
        </button>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Nueva Reserva">
        <form action={action} className="space-y-4">
          <div>
            <label className={labelCls}>Espacio</label>
            {preselectedSpace ? (
              <>
                <input type="hidden" name="espacioId" value={preselectedSpace.id} />
                <div className={`${inputCls} bg-[#f8fafc] cursor-not-allowed text-[#64748b]`}>
                  {preselectedSpace.nombre} — cap. {preselectedSpace.capacidad}
                  {preselectedSpace.necesita_verificacion ? ' (requiere verificación)' : ''}
                </div>
              </>
            ) : (
              <select
                name="espacioId"
                required
                className={inputCls}
                onChange={(e) => {
                  setSelectedSpaceId(Number(e.target.value));
                  setFechaInicio('');
                  setFechaFin('');
                }}
              >
                <option value="">Selecciona un espacio…</option>
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} — cap. {s.capacidad}
                    {s.necesita_verificacion ? ' (requiere verificación)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className={labelCls}>Fecha y hora</label>
            <button
              type="button"
              onClick={() => selectedSpaceId > 0 && setShowCalendario(true)}
              disabled={selectedSpaceId === 0}
              className={[
                inputCls,
                'text-left w-full',
                !fechaInicio ? 'text-[#94a3b8]' : 'text-[#1e293b]',
                selectedSpaceId === 0 ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {fechaInicio
                ? `${new Date(fechaInicio).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })} → ${new Date(fechaFin).toLocaleString('es-MX', { timeStyle: 'short' })}`
                : 'Seleccionar fecha y hora…'}
            </button>
            <input type="hidden" name="fechaInicio" value={fechaInicio} />
            <input type="hidden" name="fechaFin" value={fechaFin} />
          </div>

          <div>
            <label className={labelCls}>
              Notas <span className="text-[#94a3b8] font-normal">(opcional)</span>
            </label>
            <textarea
              name="notas"
              rows={3}
              placeholder="Información adicional sobre tu reserva…"
              className={`${inputCls} resize-y`}
            />
          </div>

          {state.error && (
            <p className="text-[13px] text-[#dc2626] bg-[#fee2e2] border border-[#fecaca] rounded-[8px] px-4 py-3">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !fechaInicio || !fechaFin}
            className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium text-sm py-[10px] rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {pending ? 'Creando reserva…' : 'Crear Reserva'}
          </button>
        </form>
      </Modal>

      {showCalendario && selectedSpaceId > 0 && (
        <CalendarioReservaModal
          espacioId={selectedSpaceId}
          onConfirm={(fi, ff) => {
            setFechaInicio(fi);
            setFechaFin(ff);
            setShowCalendario(false);
          }}
          onClose={() => setShowCalendario(false)}
        />
      )}
    </>
  );
}
