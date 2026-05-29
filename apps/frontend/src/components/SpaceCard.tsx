'use client';

import { useActionState } from 'react';
import { changeSpaceStatusAction, type SpaceActionState } from '@/app/actions/spaces';
import { spaceImageUrl } from '@/lib/spaces';
import Badge from '@/components/Badge';
import SpaceFormModal from '@/components/SpaceFormModal';
import type { Espacio } from '@/types';

const ESTADOS = ['disponible', 'reservada', 'ocupada', 'mantenimiento'];
const init: SpaceActionState = { error: null };

interface SpaceCardProps {
  espacio: Espacio
  isAdmin: boolean
}

export default function SpaceCard({ espacio, isAdmin }: SpaceCardProps) {
  const [state, action, pending] = useActionState(changeSpaceStatusAction, init);
  const img = spaceImageUrl(espacio.foto_url);

  return (
    <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
      <div className="relative h-40 bg-[#f1f5f9]">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={espacio.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#94a3b8]">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge status={espacio.estado} />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-[16px] font-semibold text-[#1e293b] leading-tight">{espacio.nombre}</h3>
          <p className="text-[15px] font-bold text-[#115e59] whitespace-nowrap">
            ${Number(espacio.precio_por_hora).toFixed(2)}
            <span className="text-[12px] font-normal text-[#94a3b8]">/h</span>
          </p>
        </div>

        {espacio.descripcion && (
          <p className="text-[13px] text-[#64748b] line-clamp-2 mb-3">{espacio.descripcion}</p>
        )}

        <div className="flex items-center gap-1.5 text-[13px] text-[#64748b] mb-4 mt-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Capacidad: {espacio.capacidad} personas
        </div>

        {isAdmin && (
          <div className="space-y-2 border-t border-[#e2e8f0] pt-3">
            <div className="flex items-center gap-2">
              <SpaceFormModal mode="edit" espacio={espacio} />
              <form action={action} className="flex-1">
                <input type="hidden" name="id" value={espacio.id} />
                <select
                  name="estado"
                  defaultValue={espacio.estado}
                  disabled={pending}
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#1e293b] bg-white focus:outline-none focus:border-[#0d9488] transition-colors disabled:opacity-50"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </form>
            </div>
            {state.error && <p className="text-[12px] text-[#dc2626]">{state.error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
