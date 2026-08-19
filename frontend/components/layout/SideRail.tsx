'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BarChart3, Database, Plus } from 'lucide-react';

interface SideRailProps {
  onOpenCompose: () => void;
}

function SideRailContent({ onOpenCompose }: SideRailProps) {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Control Center',
      icon: LayoutDashboard,
      href: '/dashboard',
      isActive: pathname === '/dashboard',
    },
    {
      id: 'senders',
      label: 'Sender Profiles',
      icon: Users,
      href: '/dashboard/senders',
      isActive: pathname === '/dashboard/senders',
    },
    {
      id: 'analytics',
      label: 'Dispatch Analytics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      isActive: pathname === '/dashboard/analytics',
    },
    {
      id: 'database',
      label: 'Storage Vault',
      icon: Database,
      href: '/dashboard/database',
      isActive: pathname === '/dashboard/database',
    },
  ];

  return (
    <aside className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-5 shrink-0 z-20 shadow-sm">
      {/* Schedule Button */}
      <button
        onClick={onOpenCompose}
        className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center mb-6 shadow-md transition-all hover:scale-105 active:scale-95 group relative"
        title="Schedule New Email Campaign"
      >
        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
      </button>

      {/* Nav Items */}
      <nav className="flex-1 w-full space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative w-full h-11 flex items-center justify-center transition-colors group ${
                item.isActive ? 'text-indigo-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
              }`}
              title={item.label}
            >
              {item.isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-7 bg-indigo-600 rounded-r-full shadow-sm" />
              )}
              <div
                className={`p-2 rounded-xl transition-all ${
                  item.isActive ? 'bg-indigo-50 text-indigo-600' : 'group-hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default function SideRail({ onOpenCompose }: SideRailProps) {
  return (
    <Suspense fallback={<div className="w-16 bg-white border-r border-slate-200" />}>
      <SideRailContent onOpenCompose={onOpenCompose} />
    </Suspense>
  );
}
