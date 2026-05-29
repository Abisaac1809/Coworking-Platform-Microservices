import type { Metadata } from 'next';
import { getUserFromCookies } from '@/lib/user';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

export const metadata: Metadata = { title: 'Reservas — NEXUS Cowork' };

export default async function ReservationsPage() {
  const user = await getUserFromCookies();
  const isAdmin = user?.role === 'Admin';

  return (
    <div>
      <PageHeader title={isAdmin ? 'Todas las Reservas' : 'Mis Reservas'}>
        {!isAdmin && (
          <button
            disabled
            title="Próximamente"
            className="flex items-center gap-2 bg-[#0d9488] text-white text-sm font-medium px-5 py-[10px] rounded-[8px] opacity-50 cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Reserva
          </button>
        )}
      </PageHeader>

      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <EmptyState
          title="Reservas próximamente"
          description="La API del servicio de Reservas está en desarrollo. Pronto podrás crear y gestionar reservas aquí."
        />
      </div>
    </div>
  );
}
