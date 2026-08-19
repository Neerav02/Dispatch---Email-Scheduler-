'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Background3D from '@/components/canvas/Background3D';
import { fetchApi } from '@/lib/api-client';
import { User } from '@/lib/types';
import {
  Mail,
  ShieldCheck,
  Zap,
  RefreshCw,
  ArrowRight,
  Database,
  Cpu,
  Server,
  CheckCircle2,
  Lock,
  Layers,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorksPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchApi('/auth/me')
      .then((res) => {
        if (res?.data) setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden font-sans">
      <Background3D />

      {/* Public Header with Auth-Aware state */}
      <header className="relative z-20 h-20 border-b border-slate-200/80 px-8 flex items-center justify-between max-w-7xl w-full mx-auto bg-white/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900 tracking-tight">
            Dispatch <span className="text-indigo-600 font-normal">Tower</span>
          </span>
        </Link>

        <div className="flex items-center gap-6 text-xs font-semibold">
          <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
            Home
          </Link>
          <Link href="/how-it-works" className="text-indigo-600 font-bold transition-colors">
            How It Works
          </Link>
          <Link href="/#calculator" className="text-slate-600 hover:text-slate-900 transition-colors">
            Rate Calculator
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-indigo-900 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Welcome, {user.name}</span>
              </div>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all hover:-translate-y-0.5"
              >
                Go to Console →
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-slate-700 hover:text-indigo-600 transition-colors">
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 pt-12 pb-24 space-y-16">
        {/* Page Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 shadow-sm">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>ENTERPRISE ARCHITECTURE & SYSTEM DESIGN</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight text-slate-900 tracking-tight">
            How Dispatch Delivers{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              100% Reliable
            </span>{' '}
            Outbound Mail
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every email scheduled for 09:04 AM departs at 09:04 AM — even if the backend server rebooted at 09:00 AM. Here is how our PostgreSQL, Redis, and BullMQ control tower operates behind the scenes.
          </p>
        </div>

        {/* System Architecture Diagram Image Showcase */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 uppercase">
              <Activity className="w-4 h-4 text-indigo-600" />
              SYSTEM COMPONENT & DATA FLOW DIAGRAM
            </div>
            <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
              Live Architecture Active
            </span>
          </div>

          <div className="relative w-full rounded-xl overflow-hidden border border-slate-100 bg-slate-900">
            <Image
              src="/architecture-diagram.png"
              alt="Dispatch Engine Technical Architecture Diagram"
              width={1200}
              height={675}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">1. PostgreSQL Single Source of Truth</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Campaign metadata, user authentication, sender SMTP credentials, and individual scheduled email rows are stored in PostgreSQL. Each scheduled email has an explicit status lifecycle: <code className="text-amber-700 font-mono">queued</code> ➔ <code className="text-blue-700 font-mono">in_flight</code> ➔ <code className="text-emerald-700 font-mono">sent</code> (or <code className="text-purple-700 font-mono">holding</code>).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">2. BullMQ + Redis Delayed Queue</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              When a campaign is scheduled, delayed jobs are enqueued into Redis with a millisecond delay (`delay = sendAt - now`). BullMQ workers pick up jobs precisely at the scheduled timestamp for deterministic execution.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">3. Atomic Redis Rate Limiting</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Before sending an email, worker threads invoke an atomic Redis <code className="text-emerald-700 font-mono">INCR rate:senderId:hourKey</code> check. If the hourly cap is reached, the job is automatically converted to <code className="text-purple-700 font-mono">holding</code> status and postponed to the next hour window.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">4. Self-Healing Reconciliation Pass</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              If the backend server crashes or reboots, <code className="text-indigo-700 font-mono">reconcileOnBoot()</code> scans PostgreSQL for un-enqueued pending emails, compares them with active Redis queue state, and restores all missing delay jobs seamlessly.
            </p>
          </div>
        </div>

        {/* Step-by-Step Interactive Workflow */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-2xl shadow-xl space-y-8">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="font-display font-bold text-2xl text-white">Step-by-Step Outbound Dispatch Lifecycle</h2>
            <p className="text-xs text-slate-400 mt-1">From campaign creation in the browser to inbox delivery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Campaign Drafted</h4>
              <p className="text-slate-400 leading-relaxed">
                User selects sender profile, uploads CSV recipient list, sets template, and specifies departure schedule.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-white text-sm">DB & Queue Enqueued</h4>
              <p className="text-slate-400 leading-relaxed">
                Email rows created in PostgreSQL with status <code className="text-amber-400">queued</code> and delayed jobs enqueued in Redis.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Rate Limit Gate</h4>
              <p className="text-slate-400 leading-relaxed">
                Worker validates atomic hourly limit. If quota is available, status shifts to <code className="text-blue-400">in_flight</code>.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h4 className="font-bold text-white text-sm">SMTP Dispatch & Preview</h4>
              <p className="text-slate-400 leading-relaxed">
                Email is dispatched via SMTP, marked as <code className="text-emerald-400">sent</code>, and live Ethereal inbox URL is logged.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Ready to experience the dispatch engine live?</span>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Launch Control Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 bg-white">
        Dispatch Engine Architecture © 2026 • Enterprise Grade Control Tower
      </footer>
    </div>
  );
}
