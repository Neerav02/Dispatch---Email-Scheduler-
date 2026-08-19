'use client';

import { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';
import { ScheduledEmail } from '@/lib/types';
import {
  Search,
  ExternalLink,
  RefreshCw,
  Clock,
  CheckCircle2,
  Send,
  Zap,
  Layers,
  Plus,
  Inbox,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'scheduled';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery<{ data: ScheduledEmail[]; pagination: any }>({
    queryKey: ['emails', currentTab, page, search],
    queryFn: () =>
      fetchApi(`/emails?status=${currentTab === 'sent' ? 'sent' : 'scheduled'}&page=${page}&limit=10&search=${encodeURIComponent(search)}`),
    refetchInterval: 5000,
  });

  const emails = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };

  const setTab = (tab: string) => {
    setPage(1);
    router.push(`/dashboard?tab=${tab}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4">
      {/* Top Header Bar with Tab Selection & KPI Badges */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full md:w-auto font-medium text-xs">
          <button
            onClick={() => setTab('scheduled')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold ${
              currentTab === 'scheduled'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled Queue</span>
          </button>

          <button
            onClick={() => setTab('sent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold ${
              currentTab === 'sent'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sent History</span>
          </button>
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search recipient or subject..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-field w-full pl-10 text-xs"
            />
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
            title="Refresh queue"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Queue & Dispatch Table */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Scheduled Departure</th>
                <th className="py-3.5 px-4">Dispatch Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-sans">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                      <span>Synchronizing flight queue...</span>
                    </div>
                  </td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-sans">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 rounded-full bg-slate-100 text-slate-400">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No email dispatches in this view</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Use the purple <span className="font-bold text-indigo-600">&quot;+&quot;</span> button on the left navigation rail to schedule your outbound campaign.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                emails.map((email) => (
                  <tr key={email.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {email.recipient}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-800">
                      {email.campaign?.subject || 'Dispatch Email'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(email.sendAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium uppercase font-mono shadow-2xs ${
                          email.status === 'queued'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : email.status === 'in_flight'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold animate-pulse'
                            : email.status === 'holding'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : email.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            email.status === 'queued'
                              ? 'bg-amber-500'
                              : email.status === 'in_flight'
                              ? 'bg-blue-500'
                              : email.status === 'holding'
                              ? 'bg-purple-500'
                              : email.status === 'sent'
                              ? 'bg-emerald-500'
                              : 'bg-red-500'
                          }`}
                        />
                        {email.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {email.etherealUrl ? (
                        <a
                          href={email.etherealUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold font-mono text-xs hover:underline"
                        >
                          Preview Mail <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 px-4 flex items-center justify-between text-xs font-mono">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Previous
          </button>
          <span className="text-slate-500">
            Page {page} of {pagination.totalPages || 1} ({pagination.total || 0} total records)
          </span>
          <button
            disabled={page >= (pagination.totalPages || 1)}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500 font-mono">Loading console...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
