'use client';

import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { Database, Server, Cpu, HardDrive, Key, RefreshCw } from 'lucide-react';

function DatabaseVaultContent() {
  const { data, isLoading, refetch, isFetching } = useQuery<{ data: any }>({
    queryKey: ['storage-telemetry'],
    queryFn: () => fetchApi('/vault'),
    refetchInterval: 5000,
  });

  const telemetry = data?.data;
  const counts = telemetry?.counts;
  const liveRecords = telemetry?.liveRecords;

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6 overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2.5">
            <Database className="w-6 h-6 text-indigo-600" />
            Storage Vault & Telemetry Inspector
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Real-time breakdown of where user data, auth sessions, scheduled emails, and Redis rate limits are saved.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-mono text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          Refresh Live Metrics
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <Server className="w-5 h-5" />
            <span className="font-mono text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold">
              POSTGRESQL 16
            </span>
          </div>
          <h3 className="font-display font-semibold text-slate-900 text-base">User & Campaign Persistence</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All user registration details, hashed passwords, sender profiles, campaigns, and individual scheduled email statuses are saved permanently in <strong className="text-slate-900">PostgreSQL</strong> on port <code className="text-indigo-600 font-mono">5433</code>.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-purple-600">
            <Cpu className="w-5 h-5" />
            <span className="font-mono text-[10px] bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-bold">
              REDIS 7 + BULLMQ
            </span>
          </div>
          <h3 className="font-display font-semibold text-slate-900 text-base">Queue & Rate Limit State</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Hourly sender capacity limits (`INCR rate:senderId:hourKey`) and active delayed dispatch jobs are managed atomically in <strong className="text-slate-900">Redis</strong> on port <code className="text-purple-600 font-mono">6380</code>.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <HardDrive className="w-5 h-5" />
            <span className="font-mono text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              PRISMA GUI
            </span>
          </div>
          <h3 className="font-display font-semibold text-slate-900 text-base">How to View DB visually</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Run <code className="text-indigo-600 font-mono">npx prisma studio</code> inside <code className="text-slate-900 font-mono">/backend</code> to launch a web GUI on <strong className="text-slate-900 font-mono">http://localhost:5555</strong> to browse all raw database rows directly!
          </p>
        </div>
      </div>

      {/* Record Counts */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xs font-mono font-bold text-slate-900 uppercase flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-600" />
          DATABASE RECORD COUNTS (LIVE AGGREGATE)
        </h2>

        {isLoading ? (
          <div className="text-xs font-mono text-slate-500">Loading storage telemetry...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono text-center">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xl font-bold text-slate-900">{counts?.usersCount || 0}</span>
              <span className="block text-[10px] text-slate-500 uppercase mt-1">Users (Account)</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xl font-bold text-slate-900">{counts?.sendersCount || 0}</span>
              <span className="block text-[10px] text-slate-500 uppercase mt-1">Senders</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xl font-bold text-slate-900">{counts?.campaignsCount || 0}</span>
              <span className="block text-[10px] text-slate-500 uppercase mt-1">Campaigns</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xl font-bold text-amber-600">{counts?.scheduledEmailsCount || 0}</span>
              <span className="block text-[10px] text-slate-500 uppercase mt-1">Scheduled Emails</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xl font-bold text-emerald-600">{counts?.sentEmailsCount || 0}</span>
              <span className="block text-[10px] text-slate-500 uppercase mt-1">Sent Emails</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-xl font-bold text-purple-600">{counts?.holdingEmailsCount || 0}</span>
              <span className="block text-[10px] text-slate-500 uppercase mt-1">Held (Rate Cap)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DatabaseVaultPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs font-mono text-slate-500">Loading storage vault...</div>}>
      <DatabaseVaultContent />
    </Suspense>
  );
}
