'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import SideRail from '@/components/layout/SideRail';
import TopBar from '@/components/layout/TopBar';
import RunwayLane from '@/components/runway/RunwayLane';
import ComposeDrawer from '@/components/compose/ComposeDrawer';
import Background3D from '@/components/canvas/Background3D';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const { data, isLoading, error } = useQuery<{ data: User }>({
    queryKey: ['me'],
    queryFn: () => fetchApi('/auth/me'),
    retry: false,
  });

  const user = data?.data || null;

  useEffect(() => {
    // Auth Protection Check
    if (!isLoading && error && !user) {
      const isDemo = typeof window !== 'undefined' && localStorage.getItem('dispatch_demo_mode') === 'true';
      if (!isDemo) {
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isLoading, error, user, router, pathname]);

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden relative font-sans">
      <Background3D />

      {/* 64px Side Rail */}
      <SideRail onOpenCompose={() => setIsComposeOpen(true)} />

      {/* Main Dashboard Console */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Header Bar */}
        <TopBar user={user} />

        {/* Pinned Timeline Visualizer Lane */}
        <div className="p-6 pb-0">
          <RunwayLane />
        </div>

        {/* Dynamic Page Body */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
          {children}
        </main>
      </div>

      {/* Compose Campaign Drawer */}
      <ComposeDrawer
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSuccess={() => {
          // Success callback
        }}
      />
    </div>
  );
}
