'use client';

import { useActionState } from 'react';
import { cancelReservaAction, type ReservationActionState } from '@/app/actions/reservations';

const init: ReservationActionState = { error: null };

interface Props {
  id: number
}

export default function CancelReservaButton({ id }: Props) {
  const [state, action, pending] = useActionState(cancelReservaAction, init);

  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        title={state.error ?? undefined}
        className="text-[12px] font-medium px-3 py-1.5 rounded-[6px] border border-[#fecaca] text-[#dc2626] hover:bg-[#fee2e2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Cancelando…' : 'Cancelar'}
      </button>
    </form>
  );
}
