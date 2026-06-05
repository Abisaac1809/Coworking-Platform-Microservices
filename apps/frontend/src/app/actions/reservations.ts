'use server';

import { revalidatePath } from 'next/cache';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import type { DisponibilidadResponse, HorarioNegocio } from '@/types/reservation';

export type ReservationActionState = { error: string | null; success?: boolean }

export async function getHorariosAction(): Promise<HorarioNegocio[]> {
  try {
    const res = await apiGet('/api/reservations/horarios');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getDisponibilidadAction(
  espacioId: number,
  fecha: string,
): Promise<DisponibilidadResponse | null> {
  try {
    const res = await apiGet(
      `/api/reservations/reservas/disponibilidad?espacio_id=${espacioId}&fecha=${fecha}`,
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Confirms the soonest pending reservation (heap pop on the backend).
 * The backend only supports confirming the next-in-time element, not an
 * arbitrary one, so this action takes no target id.
 */
export async function confirmNextAction(
  _state: ReservationActionState,
  _formData: FormData,
): Promise<ReservationActionState> {
  let res: Response;
  try {
    res = await apiPost('/api/reservations/cola/confirmar', {});
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error ?? body?.message ?? body?.detail;
    return { error: typeof msg === 'string' ? msg : 'No hay reservas en espera.' };
  }

  revalidatePath('/ordenes');
  return { error: null, success: true };
}

export async function createReservaAction(
  _state: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  const espacioId = Number(formData.get('espacioId'));
  const fechaInicio = formData.get('fechaInicio') as string;
  const fechaFin = formData.get('fechaFin') as string;
  const notas = (formData.get('notas') as string) || undefined;

  if (!espacioId || !fechaInicio || !fechaFin) {
    return { error: 'Todos los campos obligatorios deben estar completos.' };
  }

  let res: Response;
  try {
    res = await apiPost('/api/reservations/reservas', {
      espacioId,
      fechaInicio,
      fechaFin,
      notas,
    });
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error ?? body?.message ?? body?.detail;
    return { error: typeof msg === 'string' ? msg : 'No se pudo crear la reserva.' };
  }

  revalidatePath('/reservations');
  return { error: null, success: true };
}

export async function cancelReservaAction(
  _state: ReservationActionState,
  formData: FormData,
): Promise<ReservationActionState> {
  const id = formData.get('id') as string;
  if (!id) return { error: 'ID de reserva no válido.' };

  let res: Response;
  try {
    res = await apiDelete(`/api/reservations/reservas/${id}`);
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error ?? body?.message ?? body?.detail;
    return { error: typeof msg === 'string' ? msg : 'No se pudo cancelar la reserva.' };
  }

  revalidatePath('/reservations');
  revalidatePath('/ordenes');
  return { error: null, success: true };
}
