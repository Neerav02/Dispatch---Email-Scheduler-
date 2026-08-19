'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi, setToken, getToken } from '@/lib/api-client';
import { User } from '@/lib/types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SideRail from '@/components/layout/SideRail';
import TopBar from '@/components/layout/TopBar';
import RunwayLane from '@/components/runway/RunwayLane';
import ComposeDrawer from '@/components/compose/ComposeDrawer';
import Background3D from '@/components/canvas/Background3D';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [tokenReady, setTokenReady] = useState(false);

  // On mount: check for token in URL (Google OAuth redirect) and store it
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      // Clean the token from the URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.pathname);
    }
    setTokenReady(true);
  }, [searchParams]);

  const { data, isLoading, error } = useQuery<{ data: User }>({
    queryKey: ['me'],
    queryFn: () => fetchApi('/auth/me'),
    retry: false,
    enabled: tokenReady,
  });

  const user = data?.data || null;

  useEffect(() => {
    if (tokenReady && !isLoading && error && !user) {
      const isDemo = typeof window !== 'undefined' && localStorage.getItem('dispatch_demo_mode') === 'true';
      const hasToken = !!getToken();
      if (!isDemo && !hasToken) {
        router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
      }
    }
  }, [tokenReady, isLoading, error, user, router, pathname]);

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-slate-50 text-xs text-slate-400 font-mono">Initializing Dispatch Console...</div>}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
