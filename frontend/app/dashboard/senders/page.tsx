'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { Sender } from '@/lib/types';
import { Users, Plus, ShieldCheck, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SendersPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [label, setLabel] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [maxPerHour, setMaxPerHour] = useState(150);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ data: Sender[] }>({
    queryKey: ['senders'],
    queryFn: () => fetchApi('/senders'),
  });

  const senders = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (newSender: { label: string; smtpFrom: string; maxPerHour: number }) =>
      fetchApi('/senders', {
        method: 'POST',
        body: JSON.stringify(newSender),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['senders'] });
      setShowAddModal(false);
      setLabel('');
      setSmtpFrom('');
      setMaxPerHour(150);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to create sender identity.');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !smtpFrom.trim()) {
      setErrorMsg('Please complete all fields.');
      return;
    }
    createMutation.mutate({ label, smtpFrom, maxPerHour });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Sender Profiles & Rate Caps
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure outbound SMTP identities and hourly sending rate limits.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sender Profile</span>
        </button>
      </div>

      {/* Senders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {senders.map((sender) => (
          <div key={sender.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">{sender.label}</h3>
                  <p className="text-xs text-slate-500 font-mono">{sender.smtpFrom}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Hourly Rate Cap:</span>
              <span className="font-bold text-indigo-600">{sender.maxPerHour} emails / hour</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-900">Add New Outbound Sender</h2>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs">{errorMsg}</div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sender Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Alpha Team"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">From Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sales@outbound.com"
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Per Hour Limit</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={maxPerHour}
                  onChange={(e) => setMaxPerHour(Number(e.target.value))}
                  className="input-field w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary px-4 py-2 rounded-lg font-semibold"
                >
                  {createMutation.isPending ? 'Saving...' : 'Create Sender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
