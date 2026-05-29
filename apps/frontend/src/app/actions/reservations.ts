'use server';

import { revalidatePath } from 'next/cache';
import { apiPost } from '@/lib/api';

export type ReservationActionState = { error: string | null; success?: boolean }

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
