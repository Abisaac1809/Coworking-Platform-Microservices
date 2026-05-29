'use server';

import { revalidatePath } from 'next/cache';
import { apiPatch } from '@/lib/api';

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
