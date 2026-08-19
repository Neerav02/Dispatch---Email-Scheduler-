'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Background3D from '@/components/canvas/Background3D';
import { fetchApi, clearToken, getToken } from '@/lib/api-client';
import { User } from '@/lib/types';
import {
  Mail,
  ShieldCheck,
  Zap,
  RefreshCw,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sliders,
  LogOut,
  Layers,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [recipientCount, setRecipientCount] = useState(250);
  const [delayMs, setDelayMs] = useState(1000);
  const [maxPerHour, setMaxPerHour] = useState(100);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchApi('/auth/me')
        .then((res) => {
          if (res?.data) setUser(res.data);
        })
        .catch(() => {
          setUser(null);
        });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    clearToken();
    setUser(null);
  };

  // Calculator Math
  const totalHours = Math.ceil(recipientCount / maxPerHour);
  const baseTimeMinutes = ((recipientCount * delayMs) / 60000).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden font-sans">
      <Background3D />

      {/* Public Header with Auth-Aware State */}
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
          <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">
            Features
          </a>
          <Link href="/how-it-works" className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
            <span>How It Works</span>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">New</span>
          </Link>
          <a href="#calculator" className="text-slate-600 hover:text-slate-900 transition-colors">
            Rate Calculator
          </a>

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

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
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

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 pt-12 pb-24 flex flex-col items-center text-center space-y-16">
        {/* Eyebrow & Hero Copy */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>RESTART-SAFE EMAIL SCHEDULING ENGINE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-5xl sm:text-7xl leading-tight max-w-4xl text-slate-900 mb-6 tracking-tight"
          >
            Cold Email Scheduling That{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Never Misses a Second.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mb-8 font-normal"
          >
            Enforce hourly sender caps, survive server restarts with zero duplicate emails, and visualize live outbound dispatch timelines in a high-contrast control tower.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            {user ? (
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5"
              >
                <span>Enter Dispatch Console ({user.name})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5"
                >
                  <span>Launch Dispatch Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition-colors"
                >
                  Sign In / Register
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Hero Visual Asset Showcase Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-100 bg-slate-950">
            <Image
              src="/hero-preview.png"
              alt="Dispatch Control Tower UI Interface Preview"
              width={1200}
              height={675}
              className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-500"
              priority
            />
          </div>
        </motion.div>

        {/* Features Section */}
        <div id="features" className="w-full space-y-8 text-left pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="font-display font-bold text-2xl text-slate-900">Enterprise Control Features</h2>
              <p className="text-xs text-slate-500">Built for mission-critical outbound cold email delivery.</p>
            </div>
            <Link
              href="/how-it-works"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
            >
              <span>Explore Technical Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Restart-Safe Reconciliation</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                PostgreSQL stores all scheduled email records permanently. On server reboot, automatic pass restores queued jobs with zero duplicate sends.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Atomic Redis Rate Limiting</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Enforce strict hourly sender caps. Jobs exceeding the cap enter a holding pattern and automatically spill into the next hour window.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900">Live Timeline Visualizer</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Track upcoming outbound email flights along a horizontal timeline with real-time status updates and delay metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Rate Limit Calculator Section with Visual Asset */}
        <section id="calculator" className="w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-display font-bold text-xl text-slate-900">Interactive Dispatch Rate Estimator</h3>
                <p className="text-xs text-slate-500">Calculate hourly window spillover times for bulk email campaigns.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Recipients</span>
                  <span className="font-mono text-indigo-600">{recipientCount} emails</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={recipientCount}
                  onChange={(e) => setRecipientCount(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Hourly Sender Limit</span>
                  <span className="font-mono text-purple-600">{maxPerHour} / hr</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={maxPerHour}
                  onChange={(e) => setMaxPerHour(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Inter-send Delay</span>
                  <span className="font-mono text-emerald-600">{delayMs} ms</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="250"
                  value={delayMs}
                  onChange={(e) => setDelayMs(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center font-mono text-xs">
              <div>
                <span className="block text-slate-500 text-[10px] uppercase">Estimated Hourly Windows</span>
                <span className="text-lg font-bold text-indigo-600">{totalHours} Hours</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[10px] uppercase">Base Transmission Time</span>
                <span className="text-lg font-bold text-slate-900">{baseTimeMinutes} Mins</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-slate-500 text-[10px] uppercase">Rate Protection</span>
                <span className="text-lg font-bold text-emerald-600">Active</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-md bg-slate-950">
              <Image
                src="/rate-limit-preview.png"
                alt="Sliding Window Rate Limit Visualizer"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center font-mono">
              Atomic sliding window rate limiter protects sender reputation and avoids spam flags.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 bg-white space-y-2">
        <div>Dispatch Engine © 2026 • High-Reliability Outbound Mail Scheduler</div>
        <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-600">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          <span>•</span>
          <Link href="/how-it-works" className="hover:text-indigo-600">How It Works (Architecture)</Link>
          <span>•</span>
          <Link href="/login" className="hover:text-indigo-600">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
