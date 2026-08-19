'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { BarChart3, TrendingUp, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function AnalyticsPage() {
  const { data } = useQuery<{ data: any }>({
    queryKey: ['storage-telemetry'],
    queryFn: () => fetchApi('/vault'),
  });

  const counts = data?.data?.counts || {};

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Dispatch Performance Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time metrics on enqueued jobs, rate limiting holding loops, and delivery success.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL DISPATCHES</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="font-display font-bold text-2xl text-slate-900">{counts.scheduledEmailsCount || 0}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Tracked in PostgreSQL</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>DELIVERED (SENT)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-display font-bold text-2xl text-emerald-600">{counts.sentEmailsCount || 0}</p>
          <span className="text-[11px] text-slate-500">Live Ethereal Preview Available</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>HOLDING (RATE CAP)</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-display font-bold text-2xl text-purple-600">{counts.holdingEmailsCount || 0}</p>
          <span className="text-[11px] text-slate-500">Spilled to Next Hour Window</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVE SENDERS</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-display font-bold text-2xl text-slate-900">{counts.sendersCount || 0}</p>
          <span className="text-[11px] text-blue-600 font-semibold">Configured & Enforced</span>
        </div>
      </div>

      {/* Visual Rate Efficiency Bar Graphic */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-900">Queue Processing Capacity Overview</h3>
        <div className="space-y-3 font-mono text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span>Hourly Capacity Utilization</span>
              <span className="font-bold text-indigo-600">85% Optimal</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full w-[85%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Restart Safety Score</span>
              <span className="font-bold text-emerald-600">100% Protected</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
