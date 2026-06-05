'use server';

import { revalidatePath } from 'next/cache';
import { apiPatch, apiPost } from '@/lib/api';

export type BillingState = { error: string | null; success?: boolean }

export async function payInvoiceAction(
  _state: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const id = formData.get('id') as string;

  let res: Response;
  try {
    res = await apiPatch(`/api/billing/facturas/${id}/pagar`);
  } catch {
    return { error: 'Unable to reach the server.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: typeof body?.detail === 'string' ? body.detail : 'Payment failed.' };
  }

  revalidatePath('/billing/invoices');
  revalidatePath('/caja');
  return { error: null, success: true };
}

export async function cobrarReservaAction(
  _state: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const reservaId = Number(formData.get('reservaId'));
  const usuarioId = Number(formData.get('usuarioId'));
  const espacioId = Number(formData.get('espacioId'));
  const fechaInicio = formData.get('fechaInicio') as string;
  const fechaFin = formData.get('fechaFin') as string;
  const precioHora = Number(formData.get('precioHora'));

  let createRes: Response;
  try {
    createRes = await apiPost('/api/billing/facturas', {
      reservaId,
      usuarioId,
      espacioId,
      fechaInicio,
      fechaFin,
      precioHora,
    });
  } catch {
    return { error: 'No se pudo conectar con el servidor.' };
  }

  if (!createRes.ok) {
    const body = await createRes.json().catch(() => ({}));
    const msg = body?.error ?? body?.message ?? body?.detail;
    return { error: typeof msg === 'string' ? msg : 'No se pudo crear la factura.' };
  }

  const factura = await createRes.json();

  let payRes: Response;
  try {
    payRes = await apiPatch(`/api/billing/facturas/${factura.id}/pagar`);
  } catch {
    return { error: 'Factura creada pero no se pudo marcar como pagada.' };
  }

  if (!payRes.ok) {
    const body = await payRes.json().catch(() => ({}));
    const msg = body?.error ?? body?.message ?? body?.detail;
    return { error: typeof msg === 'string' ? msg : 'Factura creada pero el pago falló.' };
  }

  revalidatePath('/billing/invoices');
  revalidatePath('/caja');
  revalidatePath('/reservations');
  return { error: null, success: true };
}
