'use client';

import { useActionState } from 'react';
import { payInvoiceAction, type BillingState } from '@/app/actions/billing';

interface PayButtonProps {
  id: number
}

const init: BillingState = { error: null };

export default function PayButton({ id }: PayButtonProps) {
  const [, action, pending] = useActionState(payInvoiceAction, init);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-[12px] font-medium px-3 py-1.5 rounded-[6px] bg-[#0d9488] text-white hover:bg-[#0f766e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Pagando…' : 'Pagar'}
      </button>
    </form>
  );
}
