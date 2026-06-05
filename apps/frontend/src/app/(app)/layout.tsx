import { redirect } from 'next/navigation';
import { getUserFromCookies } from '@/lib/user';
import Sidebar from '@/components/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await getUserFromCookies();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar user={user} />
      <main className="md:ml-[260px] pt-14 md:pt-0 min-h-screen">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
