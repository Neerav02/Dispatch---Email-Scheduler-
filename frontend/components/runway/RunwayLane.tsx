'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { ScheduledEmail } from '@/lib/types';
import RunwayCapsule from './RunwayCapsule';
import { Plane, Clock, RefreshCw } from 'lucide-react';

export default function RunwayLane() {
  const { data, isLoading, isError, refetch } = useQuery<{ data: ScheduledEmail[] }>({
    queryKey: ['runway-emails'],
    queryFn: () => fetchApi('/emails/runway'),
    refetchInterval: 5000,
  });

  const emails = data?.data || [];

  const nowMs = Date.now();
  const rangeMs = 120 * 60 * 1000;
  const startMs = nowMs - 30 * 60 * 1000;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-indigo-600" />
          <h2 className="font-display font-bold text-sm text-slate-900">
            Live Email Dispatch Timeline
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            ({emails.length} active jobs in window)
          </span>
        </div>

        <button
          onClick={() => refetch()}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          title="Refresh timeline"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline Lane Container */}
      <div className="relative h-16 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        {/* Horizontal Progress Track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200" />

        {/* NOW Vertical Red Indicator Line */}
        <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-red-500 z-20">
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-red-500 text-white font-mono text-[9px] font-bold rounded">
            NOW
          </span>
        </div>

        {/* Render Email Capsules along the Timeline */}
        {!isLoading && emails.map((email) => {
          const sendMs = new Date(email.sendAt).getTime();
          const leftPercent = ((sendMs - startMs) / rangeMs) * 100;

          if (leftPercent < 0 || leftPercent > 100) return null;

          return (
            <RunwayCapsule
              key={email.id}
              email={email}
              leftPercent={leftPercent}
            />
          );
        })}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-slate-400">
            Syncing timeline...
          </div>
        )}
      </div>

      {/* Legend & Legend Badges */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Queued
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> In Flight
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Holding (Rate Cap)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sent
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3 h-3" /> 2-Hour Departure Window
        </div>
      </div>
    </div>
  );
}
