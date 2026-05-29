'use server';

import { revalidatePath } from 'next/cache';
import { apiPostForm, apiPutForm, apiPatch } from '@/lib/api';

export type SpaceActionState = { error: string | null; success?: boolean }

const ALLOWED_ESTADOS = ['disponible', 'reservada', 'ocupada', 'mantenimiento'];

function buildSpaceForm(formData: FormData, requireFoto: boolean): FormData | string {
  const nombre = formData.get('nombre') as string;
  const descripcion = (formData.get('descripcion') as string) ?? '';
  const capacidad = formData.get('capacidad') as string;
  const precioPorHora = formData.get('precioPorHora') as string;
  const foto = formData.get('foto') as File | null;

  if (!nombre?.trim()) return 'El nombre es obligatorio.';
  if (!capacidad) return 'La capacidad es obligatoria.';
  if (!precioPorHora) return 'El precio por hora es obligatorio.';
  if (requireFoto && (!foto || foto.size === 0)) return 'La foto es obligatoria.';

  const fd = new FormData();
  fd.append('nombre', nombre);
  fd.append('descripcion', descripcion);
  fd.append('capacidad', capacidad);
  fd.append('precioPorHora', precioPorHora);
  if (foto && foto.size > 0) fd.append('foto', foto);
  return fd;
}

export async function createSpaceAction(
  _state: SpaceActionState,
  formData: FormData,
): Promise<SpaceActionState> {
  const fd = buildSpaceForm(formData, true);
  if (typeof fd === 'string') return { error: fd };

  let res: Response;
  try {
    res = await apiPostForm('/api/spaces/espacios', fd);
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: typeof body?.error === 'string' ? body.error : 'No se pudo crear el espacio.' };
  }

  revalidatePath('/spaces');
  return { error: null, success: true };
}

export async function updateSpaceAction(
  _state: SpaceActionState,
  formData: FormData,
): Promise<SpaceActionState> {
  const id = formData.get('id') as string;
  if (!id) return { error: 'Falta el identificador del espacio.' };

  const fd = buildSpaceForm(formData, false);
  if (typeof fd === 'string') return { error: fd };

  let res: Response;
  try {
    res = await apiPutForm(`/api/spaces/espacios/${id}`, fd);
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: typeof body?.error === 'string' ? body.error : 'No se pudo actualizar el espacio.' };
  }

  revalidatePath('/spaces');
  return { error: null, success: true };
}

export async function changeSpaceStatusAction(
  _state: SpaceActionState,
  formData: FormData,
): Promise<SpaceActionState> {
  const id = formData.get('id') as string;
  const estado = formData.get('estado') as string;
  if (!id) return { error: 'Falta el identificador del espacio.' };
  if (!ALLOWED_ESTADOS.includes(estado)) return { error: 'Estado no válido.' };

  let res: Response;
  try {
    res = await apiPatch(`/api/spaces/espacios/${id}/estado`, { estado });
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: typeof body?.error === 'string' ? body.error : 'No se pudo cambiar el estado.' };
  }

  revalidatePath('/spaces');
  return { error: null, success: true };
}
