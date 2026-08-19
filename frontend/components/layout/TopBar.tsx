'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { LogOut, ShieldCheck, Mail, ChevronDown } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TopBarProps {
  user: User | null;
}

export default function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('dispatch_demo_mode');
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore
    } finally {
      router.push('/login');
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-30 text-white">
      {/* Brand Title */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm group-hover:bg-indigo-500 transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Dispatch <span className="text-indigo-400 font-normal">Tower</span>
          </span>
        </Link>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          System Operational
        </span>
      </div>

      {/* User Controls & Logout Dropdown */}
      {user ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-slate-700 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 font-bold text-white flex items-center justify-center text-xs">
                {user.name[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{user.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Console</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
        >
          Sign In
        </Link>
      )}
    </header>
  );
}
