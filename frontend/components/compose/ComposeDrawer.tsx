'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { Sender } from '@/lib/types';
import CsvDropzone from './CsvDropzone';
import RateLimitPreview from './RateLimitPreview';
import { X, Send, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComposeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ComposeDrawer({ isOpen, onClose, onSuccess }: ComposeDrawerProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);
  const [selectedSenderId, setSelectedSenderId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [startTime, setStartTime] = useState('');
  const [delayMs, setDelayMs] = useState(1000);
  const [maxPerHour, setMaxPerHour] = useState(150);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: sendersData } = useQuery<{ data: Sender[] }>({
    queryKey: ['senders'],
    queryFn: () => fetchApi('/senders'),
  });

  const senders = sendersData?.data || [];

  const handleParsedCsv = (valid: string[], invalid: string[]) => {
    setRecipients(valid);
    setInvalidEmails(invalid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (recipients.length === 0) {
      setErrorMsg('Please upload a CSV file with valid recipient email addresses.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Please enter an email subject line.');
      return;
    }
    if (!body.trim()) {
      setErrorMsg('Please enter email body content.');
      return;
    }

    setIsSubmitting(true);

    try {
      const senderId = selectedSenderId || senders[0]?.id;
      const scheduledStartTime = startTime ? new Date(startTime).toISOString() : new Date().toISOString();

      await fetchApi('/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          senderId,
          subject,
          body,
          startTime: scheduledStartTime,
          delayMs,
          maxPerHour,
          recipients,
        }),
      });

      setSuccessMsg(`Successfully enqueued campaign for ${recipients.length} recipients!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to schedule campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900 z-40"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  Schedule New Outbound Dispatch
                </h2>
                <p className="text-xs text-slate-500">
                  Configure recipient list, sender cap limits, and arrival math.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* 1. CSV Dropzone Component */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient List (CSV File Upload)
                </label>
                <CsvDropzone onParsed={handleParsedCsv} />
              </div>

              {/* 2. Sender Identity Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Outbound Sender Identity
                </label>
                <select
                  value={selectedSenderId}
                  onChange={(e) => setSelectedSenderId(e.target.value)}
                  className="input-field w-full"
                >
                  {senders.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.smtpFrom}) — Limit: {s.maxPerHour}/hr
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Subject & Body */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Telemetry Quarterly Update"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Body Template
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Hello {{name}},\n\nThis is an automated outbound dispatch message."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="input-field w-full font-mono text-xs"
                  />
                </div>
              </div>

              {/* 4. Scheduling & Rate Limiting Controls */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="font-display font-bold text-xs text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Rate Control Parameters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Start Departure Time
                    </label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="input-field w-full font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Hourly Sender Cap
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={maxPerHour}
                      onChange={(e) => setMaxPerHour(Number(e.target.value))}
                      className="input-field w-full font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Live Completion Math Telemetry Component */}
                <RateLimitPreview
                  recipientCount={recipients.length}
                  delayMs={delayMs}
                  maxPerHour={maxPerHour}
                  startTime={startTime ? new Date(startTime) : new Date()}
                />
              </div>
            </form>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || recipients.length === 0}
                className="btn-primary px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'ENQUEUING DISPATCH...' : `DISPATCH ${recipients.length} EMAILS`}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
