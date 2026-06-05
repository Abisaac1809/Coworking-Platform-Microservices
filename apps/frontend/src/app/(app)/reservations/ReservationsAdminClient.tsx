'use client';

import { useState } from 'react';
import KpiCard from '@/components/KpiCard';
import EmptyState from '@/components/EmptyState';
import type { Reserva, Espacio } from '@/types';
import ReservasTablaView from './ReservasTablaView';
import ReservasEspacioView from './ReservasEspacioView';

export interface UsuarioEntry { id: number; name: string }

interface Props {
  reservas: Reserva[];
  espacios: Espacio[];
  usuarios: UsuarioEntry[];
  fetchError: boolean;
}

type Vista = 'tabla' | 'espacio';

export default function ReservationsAdminClient({ reservas, espacios, usuarios, fetchError }: Props) {
  const [vista, setVista] = useState<Vista>('tabla');

  const pendientes = reservas.filter((r) => r.estado === 'PENDIENTE').length;
  const confirmadas = reservas.filter((r) => r.estado === 'CONFIRMADA').length;
  const canceladas = reservas.filter((r) => r.estado === 'CANCELADA').length;

  if (fetchError) {
    return (
      <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-6">
        <EmptyState
          title="No se pudo cargar las reservas"
          description="Verifica que el servicio de reservas esté activo e intenta de nuevo."
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total" value={reservas.length} />
        <KpiCard label="Pendientes" value={pendientes} accentColor="#ca8a04" />
        <KpiCard label="Confirmadas" value={confirmadas} accentColor="#0d9488" />
        <KpiCard label="Canceladas" value={canceladas} accentColor="#94a3b8" />
      </div>

      <div className="inline-flex bg-[#f1f5f9] rounded-[10px] p-1 mb-6">
        <button
          type="button"
          onClick={() => setVista('tabla')}
          className={[
            'flex items-center gap-2 px-4 py-[7px] rounded-[8px] text-[13px] font-medium transition-all',
            vista === 'tabla'
              ? 'bg-white text-[#0d9488] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
              : 'text-[#64748b] hover:text-[#1e293b]',
          ].join(' ')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" />
          </svg>
          Vista Tabla
        </button>
        <button
          type="button"
          onClick={() => setVista('espacio')}
          className={[
            'flex items-center gap-2 px-4 py-[7px] rounded-[8px] text-[13px] font-medium transition-all',
            vista === 'espacio'
              ? 'bg-white text-[#0d9488] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
              : 'text-[#64748b] hover:text-[#1e293b]',
          ].join(' ')}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Vista por Espacio
        </button>
      </div>

      {vista === 'tabla' ? (
        <ReservasTablaView reservas={reservas} espacios={espacios} usuarios={usuarios} />
      ) : (
        <ReservasEspacioView espacios={espacios} reservas={reservas} usuarios={usuarios} />
      )}
    </>
  );
}
