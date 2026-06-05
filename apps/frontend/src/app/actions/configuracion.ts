'use server';

import { revalidatePath } from 'next/cache';
import { apiPut } from '@/lib/api';

export type HorarioActionState = { error: string | null; success?: boolean }

export async function updateHorarioAction(
  _state: HorarioActionState,
  formData: FormData,
): Promise<HorarioActionState> {
  const diaSemana = Number(formData.get('diaSemana'));
  const horaInicio = (formData.get('horaInicio') as string) ?? '';
  const horaFin = (formData.get('horaFin') as string) ?? '';
  const activo = formData.get('activo') === 'on';

  if (activo) {
    if (!horaInicio || !horaFin) {
      return { error: 'Las horas de apertura y cierre son obligatorias.' };
    }
    if (horaFin <= horaInicio) {
      return { error: 'La hora de cierre debe ser posterior a la de apertura.' };
    }
  }

  let res: Response;
  try {
    res = await apiPut(`/api/reservations/horarios/${diaSemana}`, {
      horaInicio: horaInicio || '00:00',
      horaFin: horaFin || '00:00',
      activo,
    });
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let msg: string | undefined;
    try {
      const body = JSON.parse(text);
      msg = body?.error ?? body?.message ?? body?.detail;
    } catch {
      msg = text || undefined;
    }
    return {
      error: typeof msg === 'string' && msg
        ? msg
        : `Error ${res.status}: no se pudo actualizar el horario.`,
    };
  }

  revalidatePath('/configuracion');
  return { error: null, success: true };
}
