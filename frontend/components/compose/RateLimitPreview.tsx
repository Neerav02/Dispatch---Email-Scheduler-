'use client';

import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RateLimitPreviewProps {
  recipientCount: number;
  delayMs: number;
  maxPerHour: number;
  startTime: Date;
}

export default function RateLimitPreview({
  recipientCount,
  delayMs,
  maxPerHour,
  startTime,
}: RateLimitPreviewProps) {
  if (recipientCount <= 0) return null;

  const totalHours = Math.ceil(recipientCount / maxPerHour);

  const durationMs = recipientCount * delayMs;
  const finishTime = new Date(startTime.getTime() + durationMs + (totalHours - 1) * 3600000);

  const willSpill = recipientCount > maxPerHour;

  return (
    <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
      <div className="flex items-center justify-between font-mono">
        <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
          <Clock className="w-4 h-4 text-indigo-600" />
          Arrival Math Estimate
        </span>
        <span className="text-indigo-600 font-bold">
          {totalHours} Hourly Window{totalHours > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
        <div className="bg-slate-50 p-2 rounded border border-slate-200">
          <span className="block text-slate-400 text-[10px]">Start Departure</span>
          <span className="font-bold text-slate-800">{startTime.toLocaleTimeString()}</span>
        </div>
        <div className="bg-slate-50 p-2 rounded border border-slate-200">
          <span className="block text-slate-400 text-[10px]">Estimated Completion</span>
          <span className="font-bold text-indigo-700">{finishTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {willSpill ? (
        <div className="p-2 bg-purple-50 border border-purple-200 rounded text-purple-800 text-[11px] flex items-center gap-1.5 font-mono">
          <AlertTriangle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Hourly sender cap reached. Excess emails will hold for subsequent windows.</span>
        </div>
      ) : (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11px] flex items-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>All {recipientCount} emails fit within 1 hourly sender window.</span>
        </div>
      )}
    </div>
  );
}
