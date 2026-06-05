import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import HorarioCard from './HorarioCard';
import type { HorarioNegocio } from '@/types';

export const metadata: Metadata = { title: 'Configuración — NEXUS Cowork' };

// Lunes → Sábado → Domingo
const DIA_ORDER = [1, 2, 3, 4, 5, 6, 0];

export default async function ConfiguracionPage() {
  const user = await getUserFromCookies();
  if (user?.role !== 'Admin') redirect('/dashboard');

  let horarios: HorarioNegocio[] = [];
  let fetchError = false;

  try {
    const res = await apiGet('/api/reservations/horarios');
    if (res.ok) {
      const data = await res.json();
      horarios = Array.isArray(data) ? data : [];
    } else {
      fetchError = true;
    }
  } catch {
    fetchError = true;
  }

  const horarioMap = new Map(horarios.map((h) => [h.diaSemana, h]));
  const ordenados = DIA_ORDER.map((d) => horarioMap.get(d)).filter(Boolean) as HorarioNegocio[];

  return (
    <div>
      <PageHeader title="Configuración" />
      <p className="text-[14px] text-[#64748b] -mt-3 mb-6">
        Define los días y horarios en que opera el coworking. Los cambios afectan inmediatamente
        la disponibilidad al crear reservas.
      </p>

      {fetchError ? (
        <div className="bg-white rounded-[12px] border border-[#e2e8f0] p-6">
          <EmptyState
            title="No se pudo cargar los horarios"
            description="Verifica que el servicio de reservas esté activo e intenta de nuevo."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ordenados.map((h) => (
            <HorarioCard key={h.diaSemana} horario={h} />
          ))}
        </div>
      )}
    </div>
  );
}
