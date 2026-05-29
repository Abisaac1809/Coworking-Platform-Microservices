'use client';

import { useTransition } from 'react';
import { deleteUserAction } from '@/app/actions/users';

export default function DeleteUserButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`¿Eliminar al admin "${name}"? Esta acción no se puede deshacer.`)) return;
    startTransition(() => deleteUserAction(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="flex items-center gap-1.5 text-[13px] text-[#dc2626] hover:text-[#b91c1c] hover:bg-[#fee2e2] px-3 py-1.5 rounded-[6px] transition-colors disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      {pending ? 'Eliminando…' : 'Eliminar'}
    </button>
  );
}
