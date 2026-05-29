'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { logoutAction } from '@/app/actions/auth';
import type { AppUser } from '@/lib/user';

interface NavItem {
  label: string
  userLabel?: string
  href: string
  icon: React.ReactNode
  roles: ('User' | 'Admin')[]
}

const navItems: NavItem[] = [
  {
    label: 'Inventario de Espacios',
    userLabel: 'Espacios Disponibles',
    href: '/spaces',
    roles: ['User', 'Admin'],
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    label: 'Reservas',
    userLabel: 'Mis Reservas',
    href: '/reservations',
    roles: ['User', 'Admin'],
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Órdenes Pendientes',
    href: '/ordenes',
    roles: ['Admin'],
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    label: 'Facturas',
    userLabel: 'Mis Facturas',
    href: '/billing/invoices',
    roles: ['User', 'Admin'],
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Caja',
    href: '/caja',
    roles: ['Admin'],
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: 'Usuarios',
    href: '/users',
    roles: ['Admin'],
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

interface SidebarProps {
  user: AppUser
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.08]">
        <div
          className="w-9 h-9 rounded-[10px] grid grid-cols-2 gap-[3px] p-[7px] flex-shrink-0"
          style={{ backgroundColor: '#0d9488' }}
        >
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="block rounded-[3px] bg-white/90" />
          ))}
        </div>
        <div>
          <p className="text-[18px] font-bold text-white leading-tight tracking-[-0.02em]">
            NEXUS Cowork
          </p>
          <p className="text-[11px] text-[#94a3b8] uppercase tracking-[0.08em] leading-tight">
            Platform
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const label = user.role === 'User' && item.userLabel ? item.userLabel : item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 mx-2 px-3 py-[10px] rounded-[8px] text-[14px] transition-colors mb-[2px] ${
                active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-[#cbd5e1] hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {item.icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Profile footer */}
      <div className="px-5 py-4 border-t border-white/[0.08]">
        <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 mb-3 rounded-[8px] hover:bg-white/[0.06] transition-colors p-1 -m-1">
          <div className="w-9 h-9 rounded-full bg-[#0d9488] flex items-center justify-center text-white text-[14px] font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-[13px] font-medium text-white truncate">{user.name}</p>
            <p className="text-[11px] text-[#94a3b8] truncate">{user.email}</p>
          </div>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[13px] text-[#cbd5e1] hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-[260px] flex-col bg-[#111827] z-30">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#111827] z-30 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-1"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-[8px] grid grid-cols-2 gap-[2px] p-[5px]"
            style={{ backgroundColor: '#0d9488' }}
          >
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="block rounded-[2px] bg-white/90" />
            ))}
          </div>
          <span className="text-white font-bold text-[16px]">NEXUS Cowork</span>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed inset-y-0 left-0 w-[260px] flex flex-col bg-[#111827] z-50">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
