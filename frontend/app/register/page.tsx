'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { NeonGlassLogo } from '@/components/NeonGlassLogo';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const { register, enterDemoSandbox } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(email.trim(), password, fullName.trim());
      toast.success('Account created successfully', {
        description: 'Welcome to DevFlow workspace.',
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantSandbox = () => {
    toast.success('⚡ Launching instant sandbox session...', {
      description: 'Zero-login sandbox activated with HyperScale Core.',
    });
    enterDemoSandbox();
    router.push('/dashboard');
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#000000] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Matrix Dot Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 -z-20"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Scattered Cyan & Purple Sparkling Light Points */}
      <div className="absolute inset-0 pointer-events-none -z-15 overflow-hidden">
        <div className="absolute top-[18%] left-[12%] w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse" />
        <div className="absolute top-[32%] left-[8%] w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_14px_#c084fc] animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[24%] left-[15%] w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
        <div className="absolute top-[16%] right-[14%] w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_16px_#a855f7] animate-pulse" />
        <div className="absolute top-[48%] right-[8%] w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]" />
        <div className="absolute bottom-[18%] right-[18%] w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_12px_#8b5cf6]" />
      </div>

      {/* Glowing Orbital Neon Rings Behind Glass Panel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[920px] h-[550px] sm:h-[680px] pointer-events-none -z-10 flex items-center justify-center">
        <svg
          viewBox="0 0 800 600"
          className="absolute inset-0 w-full h-full opacity-85 overflow-visible"
        >
          <defs>
            <linearGradient id="neonCyanArcReg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="35%" stopColor="#00f0ff" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="neonPurpleArcReg" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
              <stop offset="40%" stopColor="#a855f7" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#6366f1" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>

            <filter id="laserGlowReg" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <ellipse
            cx="400"
            cy="300"
            rx="320"
            ry="190"
            transform="rotate(-28 400 300)"
            fill="none"
            stroke="url(#neonCyanArcReg)"
            strokeWidth="1.8"
            filter="url(#laserGlowReg)"
          />

          <ellipse
            cx="400"
            cy="300"
            rx="290"
            ry="170"
            transform="rotate(32 400 300)"
            fill="none"
            stroke="url(#neonPurpleArcReg)"
            strokeWidth="1.6"
            filter="url(#laserGlowReg)"
          />
        </svg>

        <div className="w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-sky-500/15 via-indigo-500/15 to-purple-600/15 blur-[90px] -z-10" />
      </div>

      {/* ----------------- Central Neon Glass Card ----------------- */}
      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative p-[1.5px] rounded-[28px] bg-gradient-to-br from-sky-400 via-indigo-500/40 to-purple-500 shadow-[0_0_50px_-10px_rgba(56,189,248,0.3),0_0_60px_-12px_rgba(168,85,247,0.35)]">
          <div className="w-full bg-[#08090d]/90 backdrop-blur-3xl rounded-[26.5px] p-6 sm:p-8 space-y-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            {/* Header */}
            <div className="text-center space-y-1.5 flex flex-col items-center">
              <NeonGlassLogo size="lg" className="mb-1" />
              <h1 className="text-2xl font-bold font-heading tracking-tight text-white">
                Create Account
              </h1>
              <p className="text-xs text-zinc-400 font-normal">
                Join DevFlow engineering workspace
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-start gap-2">
                <span className="shrink-0 font-bold">•</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    autoFocus
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full h-11 bg-black/60 border border-white/[0.1] rounded-xl pl-10 pr-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Work Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Work Email
                </label>
                <div className="relative">
                  <Mail
                    className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    spellCheck={false}
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-11 bg-black/60 border border-white/[0.1] rounded-xl pl-10 pr-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 bg-black/60 border border-white/[0.1] rounded-xl pl-10 pr-10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !fullName || !email || !password}
                  className="w-full h-11 bg-white hover:bg-zinc-200 active:scale-[0.99] text-zinc-950 font-bold rounded-full text-xs transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(255,255,255,0.2)] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Instant Demo Sandbox Shortcut Option */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleInstantSandbox}
                className="w-full py-2 px-3 rounded-full bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/25 text-amber-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>Or launch instant sandbox (no registration required)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 text-center space-y-2 text-xs text-zinc-500">
          <p>
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-zinc-300 hover:text-white font-medium underline underline-offset-4 transition"
            >
              Sign in
            </Link>
          </p>
          <p className="font-mono text-[11px] text-zinc-600">
            <Link href="/" className="hover:text-zinc-400 transition">
              ← Back to DevFlow Home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
