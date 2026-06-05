import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/user';
import { fetchAdmins } from '@/app/actions/users';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import CreateAdminModal from './CreateAdminModal';
import DeleteUserButton from './DeleteUserButton';

export const metadata: Metadata = { title: 'Usuarios — NEXUS Cowork' };

export default async function UsersPage() {
  const user = await getUserFromCookies();
  if (user?.role !== 'Admin') redirect('/dashboard');

  const admins = await fetchAdmins();

  return (
    <div>
      <PageHeader title="Gestión de Administradores">
        <CreateAdminModal />
      </PageHeader>

      <div className="bg-white rounded-[12px] border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {admins.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No hay administradores"
              description='Crea el primer administrador con el botón "Create Admin".'
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#64748b] uppercase tracking-wide">Nombre</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#64748b] uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#64748b] uppercase tracking-wide">Teléfono</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#64748b] uppercase tracking-wide">Creado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0d9488] flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0">
                        {admin.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <span className="font-medium text-[#1e293b]">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#475569]">{admin.email}</td>
                  <td className="px-5 py-4 text-[#475569]">{admin.phone}</td>
                  <td className="px-5 py-4 text-[#94a3b8] text-[13px]">
                    {new Date(admin.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {admin.id !== user?.id && (
                      <DeleteUserButton id={admin.id} name={admin.name} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
