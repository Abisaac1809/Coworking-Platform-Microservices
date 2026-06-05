'use client';

import { useState, useEffect, useMemo } from 'react';
import { getDisponibilidadAction, getHorariosAction } from '@/app/actions/reservations';
import Badge from '@/components/Badge';
import CancelReservaButton from './CancelReservaButton';
import CobrarModal from './CobrarModal';
import type { Reserva, Espacio, HorarioNegocio, DisponibilidadResponse } from '@/types';
import type { UsuarioEntry } from './ReservationsAdminClient';

// ─── date/slot utilities ────────────────────────────────────────────────────

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

function findReservaForSlot(
  slot: string,
  date: Date,
  espacioId: number,
  reservas: Reserva[],
): Reserva | null {
  const dateStr = toLocalDateStr(date);
  const slotStart = `${dateStr}T${slot}:00`;
  const slotEnd = `${dateStr}T${addHour(slot)}:00`;
  return (
    reservas.find(
      (r) =>
        r.espacioId === espacioId &&
        r.estado !== 'CANCELADA' &&
        r.fechaInicio < slotEnd &&
        r.fechaFin > slotStart,
    ) ?? null
  );
}

// ─── component ──────────────────────────────────────────────────────────────

interface Props {
  espacios: Espacio[];
  reservas: Reserva[];
  usuarios: UsuarioEntry[];
}

export default function ReservasEspacioView({ espacios, reservas, usuarios }: Props) {
  const [search, setSearch] = useState('');
  const [selectedEspacio, setSelectedEspacio] = useState<Espacio | null>(null);
  const [horarios, setHorarios] = useState<HorarioNegocio[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [cobrarReserva, setCobrarReserva] = useState<Reserva | null>(null);

  useEffect(() => {
    getHorariosAction().then(setHorarios);
  }, []);

  const usuariosMap = useMemo(() => new Map(usuarios.map((u) => [u.id, u.name])), [usuarios]);

  const horarioMap = useMemo(
    () => new Map(horarios.map((h) => [h.diaSemana, h])),
    [horarios],
  );

  const filteredEspacios = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return espacios;
    return espacios.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.descripcion?.toLowerCase().includes(q),
    );
  }, [espacios, search]);

  // Days that have reservations for the selected space (for dots in calendar)
  const reservaDaysSet = useMemo(() => {
    if (!selectedEspacio) return new Set<string>();
    return new Set(
      reservas
        .filter((r) => r.espacioId === selectedEspacio.id && r.estado !== 'CANCELADA')
        .map((r) => r.fechaInicio.slice(0, 10)),
    );
  }, [reservas, selectedEspacio]);

  async function handleSelectEspacio(espacio: Espacio) {
    setSelectedEspacio(espacio);
    setSelectedDate(null);
    setDisponibilidad(null);
  }

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  async function handleDayClick(day: Date) {
    if (day < today) return;
    if (!selectedEspacio) return;

    const weekday = day.getDay();
    const horario = horarioMap.get(weekday);
    if (!horario?.activo) return;

    setSelectedDate(day);
    setLoadingSlots(true);
    const data = await getDisponibilidadAction(selectedEspacio.id, toLocalDateStr(day));
    setDisponibilidad(data);
    setLoadingSlots(false);
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getDaysInMonth(year, month);
  const firstDayOfWeek = days[0].getDay();

  const slots =
    disponibilidad?.diaActivo && disponibilidad.horaInicio && disponibilidad.horaFin
      ? generateSlots(disponibilidad.horaInicio, disponibilidad.horaFin)
      : [];

  return (
    <div className="flex gap-5 items-start">
      {cobrarReserva && selectedEspacio && (
        <CobrarModal
          reserva={cobrarReserva}
          espacioNombre={selectedEspacio.nombre}
          precioPorHora={Number(selectedEspacio.precio_por_hora)}
          usuarioNombre={usuariosMap.get(cobrarReserva.usuarioId) ?? `Usuario #${cobrarReserva.usuarioId}`}
          onClose={() => setCobrarReserva(null)}
        />
      )}
      {/* ── Left: space selector ── */}
      <div className="w-[220px] flex-shrink-0 bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e2e8f0]">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar espacio…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-[7px] text-[13px] border border-[#e2e8f0] rounded-[8px] text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#0d9488] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[460px]">
          {filteredEspacios.length === 0 ? (
            <p className="text-[13px] text-[#94a3b8] text-center py-6">Sin resultados</p>
          ) : (
            filteredEspacios.map((e) => {
              const isSelected = selectedEspacio?.id === e.id;
              const reservaCount = reservas.filter(
                (r) => r.espacioId === e.id && r.estado !== 'CANCELADA',
              ).length;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => handleSelectEspacio(e)}
                  className={[
                    'w-full text-left px-4 py-3 border-b border-[#e2e8f0] last:border-0 transition-colors',
                    isSelected
                      ? 'bg-[#f0fdfa] border-l-2 border-l-[#0d9488]'
                      : 'hover:bg-[#f8fafc]',
                  ].join(' ')}
                >
                  <p
                    className={[
                      'text-[13px] font-medium truncate',
                      isSelected ? 'text-[#0d9488]' : 'text-[#1e293b]',
                    ].join(' ')}
                  >
                    {e.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-[#94a3b8]">
                      Cap. {e.capacidad}
                    </span>
                    {reservaCount > 0 && (
                      <span className="text-[11px] text-[#0d9488] font-medium">
                        {reservaCount} reserva{reservaCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: calendar + slots ── */}
      <div className="flex-1 min-w-0">
        {!selectedEspacio ? (
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-12 flex flex-col items-center justify-center text-center gap-3">
            <svg
              className="w-10 h-10 text-[#cbd5e1]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-[14px] font-medium text-[#64748b]">Selecciona un espacio</p>
            <p className="text-[13px] text-[#94a3b8]">
              Elige un espacio a la izquierda para ver su disponibilidad por día.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Space header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
              <div>
                <h3 className="text-[14px] font-semibold text-[#1e293b]">{selectedEspacio.nombre}</h3>
                <p className="text-[12px] text-[#64748b] mt-0.5">
                  Capacidad: {selectedEspacio.capacidad} · $
                  {Number(selectedEspacio.precio_por_hora).toLocaleString('es-MX')} / hora
                </p>
              </div>
              <Badge status={selectedEspacio.estado} />
            </div>

            <div className="flex divide-x divide-[#e2e8f0]">
              {/* Calendar panel */}
              <div className="w-[300px] flex-shrink-0 p-5">
                {/* Month nav */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
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
                    type="button"
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
                    const isSelected = selectedDate?.toDateString() === day.toDateString();
                    const dateStr = toLocalDateStr(day);
                    const hasReserva = reservaDaysSet.has(dateStr);

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        disabled={disabled}
                        onClick={() => handleDayClick(day)}
                        className={[
                          'relative w-8 h-8 mx-auto flex flex-col items-center justify-center rounded-full text-[13px] transition-colors',
                          disabled
                            ? 'text-[#cbd5e1] cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#0d9488] text-white font-semibold'
                            : 'text-[#1e293b] hover:bg-[#f0fdfa] hover:text-[#0d9488]',
                        ].join(' ')}
                      >
                        <span className="leading-none">{day.getDate()}</span>
                        {hasReserva && !disabled && (
                          <span
                            className={[
                              'absolute bottom-[3px] w-1 h-1 rounded-full',
                              isSelected ? 'bg-white' : 'bg-[#0d9488]',
                            ].join(' ')}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-col gap-1.5 text-[11px] text-[#94a3b8]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#0d9488] inline-block" /> Seleccionado
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] inline-block" /> Con reservas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#e2e8f0] inline-block" /> Cerrado / pasado
                  </span>
                </div>
              </div>

              {/* Slots panel */}
              <div className="flex-1 p-5 min-w-0">
                {!selectedDate ? (
                  <div className="h-full flex items-center justify-center text-[13px] text-[#94a3b8]">
                    Selecciona un día para ver la disponibilidad
                  </div>
                ) : loadingSlots ? (
                  <div className="h-full flex items-center justify-center text-[13px] text-[#94a3b8]">
                    Cargando disponibilidad…
                  </div>
                ) : disponibilidad && !disponibilidad.diaActivo ? (
                  <div className="h-full flex items-center justify-center text-[13px] text-[#94a3b8]">
                    El negocio no opera ese día
                  </div>
                ) : (
                  <>
                    <p className="text-[13px] font-semibold text-[#1e293b] mb-1 capitalize">
                      {selectedDate.toLocaleDateString('es-MX', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-[11px] text-[#64748b] mb-4">
                      Horario: {disponibilidad?.horaInicio?.slice(0, 5)} – {disponibilidad?.horaFin?.slice(0, 5)}
                    </p>

                    <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                      {slots.map((slot) => {
                        const slotEnd = addHour(slot);
                        const reserva = findReservaForSlot(
                          slot,
                          selectedDate,
                          selectedEspacio.id,
                          reservas,
                        );
                        const occupied = reserva !== null;

                        return (
                          <div
                            key={slot}
                            className={[
                              'flex items-start gap-3 px-4 py-3 rounded-[8px] border text-[13px]',
                              occupied
                                ? 'bg-[#fff7ed] border-[#fed7aa]'
                                : 'bg-[#f0fdf4] border-[#bbf7d0]',
                            ].join(' ')}
                          >
                            {/* Time */}
                            <span className="font-medium text-[#1e293b] whitespace-nowrap tabular-nums pt-0.5">
                              {slot} – {slotEnd}
                            </span>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              {occupied && reserva ? (
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span className="font-medium text-[#92400e]">
                                    {usuariosMap.get(reserva.usuarioId) ?? `Usuario #${reserva.usuarioId}`}
                                  </span>
                                  <span className="text-[11px] text-[#94a3b8]">
                                    #{reserva.id}
                                  </span>
                                  <Badge status={reserva.estado} />
                                  {reserva.notas && (
                                    <span className="text-[11px] text-[#64748b] italic truncate max-w-[180px]">
                                      &ldquo;{reserva.notas}&rdquo;
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[#16a34a]">Disponible</span>
                              )}
                            </div>

                            {/* Actions */}
                            {occupied && reserva && reserva.estado !== 'CANCELADA' && (
                              <div className="flex-shrink-0 flex flex-col gap-1.5">
                                {reserva.estado === 'CONFIRMADA' && (
                                  <button
                                    type="button"
                                    onClick={() => setCobrarReserva(reserva)}
                                    className="text-[11px] font-medium px-2.5 py-1 rounded-[6px] bg-[#0d9488] text-white hover:bg-[#0f766e] transition-colors whitespace-nowrap"
                                  >
                                    Cobrar
                                  </button>
                                )}
                                <CancelReservaButton id={reserva.id} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
