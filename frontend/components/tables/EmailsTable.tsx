'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { ScheduledEmail } from '@/lib/types';
import { ExternalLink, AlertCircle, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailsTableProps {
  statusTab: 'scheduled' | 'sent';
  onOpenCompose: () => void;
}

export default function EmailsTable({ statusTab, onOpenCompose }: EmailsTableProps) {
  const [page, setPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<ScheduledEmail | null>(null);

  const { data, isLoading } = useQuery<{ data: ScheduledEmail[]; pagination: any }>({
    queryKey: ['emails', statusTab, page],
    queryFn: () => fetchApi(`/emails?status=${statusTab}&page=${page}&limit=15`),
    refetchInterval: 5000, // 5s live polling
  });

  const emails = data?.data || [];
  const pagination = data?.pagination;

  const renderStatusBadge = (email: ScheduledEmail) => {
    switch (email.status) {
      case 'queued':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-ember-gold/60 text-ember-gold bg-ember-gold/10">
            queued
          </span>
        );
      case 'in_flight':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-ember-magenta text-canvas font-bold animate-pulse">
            in-flight
          </span>
        );
      case 'holding':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-dashed border-orchid text-orchid bg-orchid/15">
            holding
          </span>
        );
      case 'sent':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-champagne text-canvas font-bold">
            sent
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-crimson text-fog font-bold">
            failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-panel/70 border border-hairline rounded-lg overflow-hidden cockpit-grid">
      {/* Table Content */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-hairline bg-panel-raised/80 text-[11px] font-mono uppercase text-mist tracking-wider sticky top-0 z-10 backdrop-blur-md">
              <th className="py-3 px-4 font-semibold">Recipient</th>
              <th className="py-3 px-4 font-semibold">Subject</th>
              <th className="py-3 px-4 font-semibold">
                {statusTab === 'sent' ? 'Sent Time' : 'Scheduled Departure'}
              </th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline/40 text-xs">
            {isLoading ? (
              // Skeleton Loader Rows per §1.6
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="h-4 bg-panel-raised/80 rounded w-36" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-panel-raised/80 rounded w-48" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-panel-raised/80 rounded w-28" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-panel-raised/80 rounded w-16" /></td>
                  <td className="py-4 px-4"><div className="h-4 bg-panel-raised/80 rounded w-12 ml-auto" /></td>
                </tr>
              ))
            ) : emails.length === 0 ? (
              // Empty State per §1.7
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                    <span className="font-mono text-xs text-mist-dim tracking-widest uppercase">
                      {statusTab === 'scheduled' ? '[ NO ACTIVE FLIGHTS ]' : '[ NOTHING SENT YET ]'}
                    </span>
                    <p className="text-xs text-mist text-center">
                      {statusTab === 'scheduled'
                        ? 'No emails scheduled yet. Compose one to see it appear on the runway.'
                        : 'Sent emails will land here once your first scheduled email departs.'}
                    </p>
                    <button
                      onClick={onOpenCompose}
                      className="mt-3 px-4 py-2 rounded-md btn-ember-flare text-xs font-bold uppercase tracking-wider"
                    >
                      Schedule Dispatch Send
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              emails.map((email) => (
                <tr
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className="hover:bg-panel-hover/80 transition-colors cursor-pointer group"
                >
                  {/* Recipient */}
                  <td className="py-3 px-4 font-mono font-medium text-fog truncate max-w-[180px]">
                    {email.recipient}
                  </td>

                  {/* Subject */}
                  <td className="py-3 px-4 text-fog font-medium truncate max-w-[280px]">
                    {email.campaign?.subject}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4 font-mono text-mist text-[11px]">
                    {new Date(email.sentAt || email.sendAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    {renderStatusBadge(email)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {email.etherealUrl ? (
                      <a
                        href={email.etherealUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-ember-gold hover:underline"
                      >
                        Preview <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="text-mist hover:text-fog transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="h-12 border-t border-hairline px-4 bg-panel-raised/60 flex items-center justify-between font-mono text-xs text-mist">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded border border-hairline hover:border-fog disabled:opacity-30 disabled:hover:border-hairline"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded border border-hairline hover:border-fog disabled:opacity-30 disabled:hover:border-hairline"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Slide-Over Modal */}
      <AnimatePresence>
        {selectedEmail && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEmail(null)}
              className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-md h-full bg-panel border-l border-hairline p-6 flex flex-col z-10 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <span className="text-xs font-mono uppercase text-mist tracking-wider">
                  FLIGHT TELEMETRY // {selectedEmail.id.slice(0, 8)}
                </span>
                <button onClick={() => setSelectedEmail(null)} className="text-mist hover:text-fog">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-mist uppercase block text-[10px]">Status:</span>
                  <div className="mt-1">{renderStatusBadge(selectedEmail)}</div>
                </div>
                <div>
                  <span className="text-mist uppercase block text-[10px]">Recipient:</span>
                  <p className="text-fog font-bold text-sm mt-0.5">{selectedEmail.recipient}</p>
                </div>
                <div>
                  <span className="text-mist uppercase block text-[10px]">Subject:</span>
                  <p className="text-fog font-medium mt-0.5">{selectedEmail.campaign?.subject}</p>
                </div>
                <div>
                  <span className="text-mist uppercase block text-[10px]">Scheduled Time:</span>
                  <p className="text-fog mt-0.5">{new Date(selectedEmail.sendAt).toLocaleString()}</p>
                </div>
                {selectedEmail.sentAt && (
                  <div>
                    <span className="text-mist uppercase block text-[10px]">Actual Departure Time:</span>
                    <p className="text-champagne font-bold mt-0.5">{new Date(selectedEmail.sentAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedEmail.heldReason && (
                  <div className="bg-orchid/15 border border-orchid/30 p-2.5 rounded text-orchid text-[11px]">
                    ⚠️ Holding Reason: {selectedEmail.heldReason}
                  </div>
                )}
                {selectedEmail.errorMessage && (
                  <div className="bg-crimson/15 border border-crimson/30 p-2.5 rounded text-crimson text-[11px]">
                    💥 Delivery Error: {selectedEmail.errorMessage}
                  </div>
                )}
                {selectedEmail.etherealUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedEmail.etherealUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-champagne text-canvas font-bold hover:brightness-110"
                    >
                      Open Ethereal SMTP Live Preview <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
