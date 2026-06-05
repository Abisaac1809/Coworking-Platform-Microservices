import type { Metadata } from 'next';
import { getUserFromCookies } from '@/lib/user';
import { apiGet } from '@/lib/api';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/Badge';
import EditProfileModal from './EditProfileModal';
import type { UserData } from '@/types';

export const metadata: Metadata = { title: 'Perfil — NEXUS Cowork' };

export default async function ProfilePage() {
  const sessionUser = await getUserFromCookies();
  let userData: UserData | null = null;
  try {
    const res = await apiGet('/api/auth/users/me');
    if (res.ok) userData = await res.json();
  } catch {
    // fall back to cookie data
  }

  const user = userData ?? {
    id: sessionUser?.id ?? 0,
    name: sessionUser?.name ?? '',
    email: sessionUser?.email ?? '',
    phone: '',
    role: sessionUser?.role ?? 'User',
  };

  const initials = user.name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div>
      <PageHeader title="Mi Perfil" />

      {/* Profile card */}
      <div className="relative bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 flex flex-col items-center text-center mb-6">
        <EditProfileModal
          name={user.name}
          email={user.email}
          phone={user.phone || '+58 300-0000000'}
          role={user.role}
        />
        <div className="w-20 h-20 rounded-full bg-[#0d9488] flex items-center justify-center text-white text-[28px] font-bold mb-4">
          {initials || '?'}
        </div>
        <p className="text-[18px] font-bold text-[#1e293b] mb-1">{user.name}</p>
        <p className="text-[14px] text-[#64748b] mb-3">{user.email}</p>
        <Badge status={user.role} />
        {user.created_at && (
          <p className="text-[12px] text-[#94a3b8] mt-4">
            Miembro desde {new Date(user.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
}
