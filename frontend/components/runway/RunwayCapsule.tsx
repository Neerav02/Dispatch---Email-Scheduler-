'use client';

import { useState } from 'react';
import { ScheduledEmail } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface RunwayCapsuleProps {
  email: ScheduledEmail;
  leftPercent: number;
}

function maskEmail(emailStr: string): string {
  const parts = emailStr.split('@');
  if (parts.length !== 2) return emailStr;
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

export default function RunwayCapsule({ email, leftPercent }: RunwayCapsuleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusStyles = () => {
    switch (email.status) {
      case 'queued':
        return 'bg-amber-50 border border-amber-300 text-amber-800 shadow-sm';
      case 'in_flight':
        return 'bg-blue-600 text-white font-bold shadow-md animate-pulse';
      case 'holding':
        return 'bg-purple-50 border border-purple-300 text-purple-800';
      case 'sent':
        return 'bg-emerald-50 border border-emerald-300 text-emerald-800';
      case 'failed':
        return 'bg-red-50 border border-red-300 text-red-800';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const formattedTime = new Date(email.sendAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer z-10"
      style={{ left: `${Math.max(5, Math.min(95, leftPercent))}%` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ scale: 1.1, zIndex: 30 }}
        className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 ${getStatusStyles()}`}
      >
        <span className="font-semibold">{maskEmail(email.recipient)}</span>
        <span className="opacity-75 text-[10px]">[{formattedTime}]</span>
      </motion.div>

      {/* Detail Card Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: -5 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white rounded-xl p-3 shadow-xl border border-slate-200 text-slate-900 pointer-events-none z-50 text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 font-mono text-[10px]">
              <span className="font-bold text-slate-500">ID: {email.id.slice(0, 8)}</span>
              <span className="capitalize font-bold text-indigo-600">{email.status}</span>
            </div>
            <p className="font-semibold truncate">{email.campaign?.subject || 'Outbound Email'}</p>
            <p className="text-slate-500 text-[11px]">To: <span className="font-mono text-slate-900">{email.recipient}</span></p>
            <p className="text-slate-400 text-[10px]">Scheduled: {new Date(email.sendAt).toLocaleString()}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
