'use client';

import { useActionState, useState, useEffect } from 'react';
import { updateHorarioAction, type HorarioActionState } from '@/app/actions/configuracion';
import type { HorarioNegocio } from '@/types';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const init: HorarioActionState = { error: null };

interface Props {
  horario: HorarioNegocio;
}

export default function HorarioCard({ horario }: Props) {
  const [state, action, pending] = useActionState(updateHorarioAction, init);
  const [activo, setActivo] = useState(horario.activo);
  const [horaInicio, setHoraInicio] = useState(horario.horaInicio.slice(0, 5));
  const [horaFin, setHoraFin] = useState(horario.horaFin.slice(0, 5));
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state.success]);

  return (
    <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-[#1e293b]">
          {DIAS[horario.diaSemana]}
        </h3>
        <label className="relative inline-flex items-center cursor-pointer gap-2">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            aria-label={`Día activo: ${DIAS[horario.diaSemana]}`}
          />
          <div className="w-10 h-[22px] bg-[#e2e8f0] peer-checked:bg-[#0d9488] rounded-full transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[18px]" />
          <span className={`text-[12px] font-medium ${activo ? 'text-[#0d9488]' : 'text-[#94a3b8]'}`}>
            {activo ? 'Abierto' : 'Cerrado'}
          </span>
        </label>
      </div>

      <form action={action} className="space-y-3">
        <input type="hidden" name="diaSemana" value={horario.diaSemana} />
        <input type="hidden" name="activo" value={activo ? 'on' : 'off'} />
        <input type="hidden" name="horaInicio" value={horaInicio} />
        <input type="hidden" name="horaFin" value={horaFin} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">
              Apertura
            </label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              disabled={!activo}
              className="w-full px-3 py-[7px] border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#1e293b] bg-white focus:outline-none focus:border-[#0d9488] transition-colors disabled:bg-[#f8fafc] disabled:text-[#94a3b8] disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#64748b] mb-1">
              Cierre
            </label>
            <input
              type="time"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              disabled={!activo}
              className="w-full px-3 py-[7px] border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#1e293b] bg-white focus:outline-none focus:border-[#0d9488] transition-colors disabled:bg-[#f8fafc] disabled:text-[#94a3b8] disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {state.error && (
          <p className="text-[12px] text-[#dc2626]">{state.error}</p>
        )}
        {showSuccess && (
          <p className="text-[12px] text-[#0d9488] font-medium">Horario actualizado.</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-[8px] rounded-[8px] bg-[#0d9488] text-white text-[13px] font-medium hover:bg-[#0f766e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
