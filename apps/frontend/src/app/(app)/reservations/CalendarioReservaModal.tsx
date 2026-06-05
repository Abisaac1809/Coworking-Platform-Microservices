'use client';

import { useEffect, useState } from 'react';
import { getDisponibilidadAction, getHorariosAction } from '@/app/actions/reservations';
import type { DisponibilidadResponse, HorarioNegocio, SlotOcupado } from '@/types/reservation';

interface Props {
  espacioId: number;
  onConfirm: (fechaInicio: string, fechaFin: string) => void;
  onClose: () => void;
}

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addHour(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function isSlotOccupied(slotStart: string, ocupadas: SlotOcupado[]): boolean {
  const slotEnd = addHour(slotStart);
  return ocupadas.some((o) => {
    const oStart = o.fechaInicio.slice(11, 16);
    const oEnd = o.fechaFin.slice(11, 16);
    return oStart < slotEnd && oEnd > slotStart;
  });
}

function hasOccupiedBetween(start: string, end: string, ocupadas: SlotOcupado[]): boolean {
  let cur = start;
  while (cur < end) {
    if (isSlotOccupied(cur, ocupadas)) return true;
    cur = addHour(cur);
  }
  return false;
}

function generateSlots(horaInicio: string, horaFin: string): string[] {
  const slots: string[] = [];
  let cur = horaInicio.slice(0, 5);
  const end = horaFin.slice(0, 5);
  while (cur < end) {
    slots.push(cur);
    cur = addHour(cur);
  }
  return slots;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export default function CalendarioReservaModal({ espacioId, onConfirm, onClose }: Props) {
  const [horarios, setHorarios] = useState<HorarioNegocio[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startSlot, setStartSlot] = useState<string | null>(null);
  const [endSlot, setEndSlot] = useState<string | null>(null);

  useEffect(() => {
    getHorariosAction().then(setHorarios);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const horarioMap = new Map(horarios.map((h) => [h.diaSemana, h]));

  async function handleDayClick(day: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day < today) return;

    const weekday = day.getDay();
    const horario = horarioMap.get(weekday);
    if (!horario?.activo) return;

    setSelectedDate(day);
    setStartSlot(null);
    setEndSlot(null);
    setLoadingSlots(true);
    const data = await getDisponibilidadAction(espacioId, toLocalDateStr(day));
    setDisponibilidad(data);
    setLoadingSlots(false);
  }

  function handleSlotClick(slot: string) {
    if (!disponibilidad) return;
    if (isSlotOccupied(slot, disponibilidad.ocupadas)) return;

    // Deselect if clicking the already-selected start slot
    if (slot === startSlot) {
      setStartSlot(null);
      setEndSlot(null);
      return;
    }

    // Extend selection: click a later slot to expand the end
    if (startSlot !== null && slot > startSlot) {
      const newEnd = addHour(slot);
      if (!hasOccupiedBetween(startSlot, newEnd, disponibilidad.ocupadas)) {
        setEndSlot(newEnd);
        return;
      }
    }

    // Default: select single 1-hour block
    setStartSlot(slot);
    setEndSlot(addHour(slot));
  }

  function handleConfirm() {
    if (!selectedDate || !startSlot || !endSlot) return;
    const dateStr = toLocalDateStr(selectedDate);
    onConfirm(`${dateStr}T${startSlot}:00`, `${dateStr}T${endSlot}:00`);
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getDaysInMonth(year, month);
  const firstDayOfWeek = days[0].getDay();

  const slots =
    disponibilidad?.diaActivo && disponibilidad.horaInicio && disponibilidad.horaFin
      ? generateSlots(disponibilidad.horaInicio, disponibilidad.horaFin)
      : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.14)] w-full overflow-hidden"
        style={{
          maxWidth: 740,
          animation: 'slideUp 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-[15px] font-semibold text-[#1e293b]">Seleccionar fecha y hora</h2>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#1e293b] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body: two panels */}
        <div className="flex divide-x divide-[#e2e8f0]">
          {/* Left: Calendar */}
          <div className="w-[320px] flex-shrink-0 p-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                className="p-1 text-[#64748b] hover:text-[#1e293b] transition-colors rounded"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-[14px] font-semibold text-[#1e293b]">
                {MESES_ES[month]} {year}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                className="p-1 text-[#64748b] hover:text-[#1e293b] transition-colors rounded"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {DIAS_ES.map((d) => (
                <div key={d} className="text-center text-[11px] font-medium text-[#94a3b8] py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const weekday = day.getDay();
                const horario = horarioMap.get(weekday);
                const isPast = day < today;
                const isClosed = !horario?.activo;
                const disabled = isPast || isClosed;
                const isSelected =
                  selectedDate?.toDateString() === day.toDateString();

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleDayClick(day)}
                    className={[
                      'w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[13px] transition-colors',
                      disabled
                        ? 'text-[#cbd5e1] cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#0d9488] text-white font-semibold'
                        : 'text-[#1e293b] hover:bg-[#f0fdfa] hover:text-[#0d9488]',
                    ].join(' ')}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-[11px] text-[#94a3b8]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#0d9488] inline-block" /> Seleccionado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#e2e8f0] inline-block" /> Cerrado
              </span>
            </div>
          </div>

          {/* Right: Hours panel */}
          <div className="flex-1 p-5 flex flex-col">
            {!selectedDate ? (
              <div className="flex-1 flex items-center justify-center text-[13px] text-[#94a3b8]">
                Selecciona un día en el calendario
              </div>
            ) : loadingSlots ? (
              <div className="flex-1 flex items-center justify-center text-[13px] text-[#94a3b8]">
                Cargando disponibilidad…
              </div>
            ) : disponibilidad && !disponibilidad.diaActivo ? (
              <div className="flex-1 flex items-center justify-center text-[13px] text-[#94a3b8]">
                El negocio no opera ese día
              </div>
            ) : (
              <>
                <p className="text-[13px] font-semibold text-[#1e293b] mb-3">
                  {selectedDate.toLocaleDateString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>

                <p className="text-[11px] text-[#64748b] mb-3">
                  Clic en un slot para seleccionarlo. Clic en un slot posterior para extender.
                </p>

                <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 max-h-[260px] pr-1">
                  {slots.map((slot) => {
                    const occupied = disponibilidad
                      ? isSlotOccupied(slot, disponibilidad.ocupadas)
                      : false;
                    const slotEnd = addHour(slot);
                    const inRange =
                      startSlot && endSlot ? slot >= startSlot && slot < endSlot : false;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={occupied}
                        onClick={() => handleSlotClick(slot)}
                        className={[
                          'px-3 py-2 rounded-[8px] text-[12px] font-medium border transition-colors text-left',
                          occupied
                            ? 'bg-[#fee2e2] border-[#fecaca] text-[#dc2626] cursor-not-allowed line-through'
                            : inRange
                            ? 'bg-[#ccfbf1] border-[#5eead4] text-[#0d9488]'
                            : 'border-[#e2e8f0] text-[#1e293b] hover:border-[#0d9488] hover:bg-[#f0fdfa]',
                        ].join(' ')}
                      >
                        {slot} – {slotEnd}
                      </button>
                    );
                  })}
                </div>

                {/* Selection summary + confirm */}
                <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                  {startSlot && endSlot ? (
                    <p className="text-[13px] text-[#1e293b] mb-3">
                      <span className="font-medium">Seleccionado:</span> {startSlot} → {endSlot}
                    </p>
                  ) : (
                    <p className="text-[13px] text-[#94a3b8] mb-3">Ningún horario seleccionado</p>
                  )}

                  <button
                    type="button"
                    disabled={!startSlot || !endSlot}
                    onClick={handleConfirm}
                    className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium text-sm py-[10px] rounded-[8px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Confirmar horario
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
