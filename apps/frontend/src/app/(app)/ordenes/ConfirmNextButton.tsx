'use client';

import { useActionState } from 'react';
import { confirmNextAction, type ReservationActionState } from '@/app/actions/reservations';

const init: ReservationActionState = { error: null };

interface ConfirmNextButtonProps {
  disabled?: boolean
}

export default function ConfirmNextButton({ disabled }: ConfirmNextButtonProps) {
  const [state, action, pending] = useActionState(confirmNextAction, init);

  return (
    <form action={action} className="flex flex-col items-stretch gap-2">
      <button
        type="submit"
        disabled={pending || disabled}
        className="flex items-center justify-center gap-2 bg-[#0d9488] text-white text-sm font-medium px-5 py-[10px] rounded-[8px] hover:bg-[#0f766e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {pending ? 'Confirmando…' : 'Confirmar siguiente'}
      </button>
      {state.error && <p className="text-[12px] text-[#dc2626] text-center">{state.error}</p>}
    </form>
  );
}
